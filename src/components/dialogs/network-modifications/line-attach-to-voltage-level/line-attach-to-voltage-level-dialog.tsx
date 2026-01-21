/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, ModificationType, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ATTACHMENT_LINE_ID,
    ATTACHMENT_POINT_ID,
    ATTACHMENT_POINT_NAME,
    BUS_OR_BUSBAR_SECTION,
    CONNECTIVITY,
    ID,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    LINE_TO_ATTACH_OR_SPLIT_ID,
    SLIDER_PERCENTAGE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../dialog-utils';
import yup from 'components/utils/yup-config';
import { ModificationDialog } from '../../commons/modificationDialog';
import {
    getConnectivityPropertiesData,
    getConnectivityPropertiesValidationSchema,
    getConnectivityWithoutPositionEmptyFormData,
    getNewVoltageLevelData,
} from '../../connectivity/connectivity-form-utils';
import LineAttachToVoltageLevelForm from './line-attach-to-voltage-level-form';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { buildNewBusbarSections } from 'components/utils/utils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { attachLine } from '../../../../services/study/network-modifications';
import { fetchVoltageLevelsListInfos } from '../../../../services/study/network';
import LineAttachToVoltageLevelIllustration from './line-attach-to-voltage-level-illustration';
import { getNewVoltageLevelOptions } from '../../../utils/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { VoltageLevel } from '../../../utils/equipment-types';
import { DeepNullable } from '../../../utils/ts-utils';
import { FetchStatus } from '../../../../services/utils.type';
import {
    AttachLineInfo,
    ExtendedVoltageLevelCreationInfo,
    LineCreationInfo,
    VoltageLevelCreationInfo,
} from '../../../../services/network-modification-types';

const emptyFormData = {
    [ATTACHMENT_LINE_ID]: '',
    [ATTACHMENT_POINT_ID]: '',
    [ATTACHMENT_POINT_NAME]: '',
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getConnectivityWithoutPositionEmptyFormData(),
    ...getLineToAttachOrSplitEmptyFormData(),
    _dirtyTrigger: '',
};

const formSchema = yup
    .object()
    .shape({
        [ATTACHMENT_LINE_ID]: yup.string().required(),
        [ATTACHMENT_POINT_ID]: yup.string().required(),
        [ATTACHMENT_POINT_NAME]: yup.string().nullable(),
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        [CONNECTIVITY]: yup.object().shape({
            ...getConnectivityPropertiesValidationSchema(false),
        }),
        ...getLineToAttachOrSplitFormValidationSchema(),
        _dirtyTrigger: yup.string(),
    })
    .required();

export type LineAttachToVoltageLevelFormInfos = yup.InferType<typeof formSchema>;

interface LineAttachToVoltageLevelDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: AttachLineInfo;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
    onClose: () => void;
}

/**
 * Dialog to attach line to voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LineAttachToVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: LineAttachToVoltageLevelDialogProps) => {
    const currentNodeUuid = currentNode?.id;

    const [attachmentLine, setAttachmentLine] = useState<LineCreationInfo>();
    const [newVoltageLevel, setNewVoltageLevel] = useState<ExtendedVoltageLevelCreationInfo>();
    const [attachmentPoint, setAttachmentPoint] = useState<ExtendedVoltageLevelCreationInfo>({
        type: ModificationType.VOLTAGE_LEVEL_CREATION,
        studyUuid: studyUuid,
        nodeUuid: currentNodeUuid,
        equipmentId: '',
        properties: null,
        ipMax: null,
        ipMin: null,
    });

    const { snackError } = useSnackMessage();

    const [voltageLevelOptions, setVoltageLevelOptions] = useState<VoltageLevel[]>([]);

    const formMethods = useForm<DeepNullable<LineAttachToVoltageLevelFormInfos>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineAttachToVoltageLevelFormInfos>>(formSchema),
    });

    const { reset, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineAttach: AttachLineInfo) => {
            let formData: LineAttachToVoltageLevelFormInfos = {
                _dirtyTrigger: '',
                [LINE1_ID]: lineAttach.newLine1Id,
                [LINE1_NAME]: lineAttach.newLine1Name ?? '',
                [LINE2_ID]: lineAttach.newLine2Id,
                [LINE2_NAME]: lineAttach.newLine2Name ?? '',
                [ATTACHMENT_LINE_ID]: lineAttach?.attachmentLine?.equipmentId,
                [ATTACHMENT_POINT_ID]: lineAttach?.attachmentPointId,
                [ATTACHMENT_POINT_NAME]: lineAttach?.attachmentPointName ?? '',
                ...getLineToAttachOrSplitFormData({
                    lineToAttachOrSplitId: lineAttach?.lineToAttachToId,
                    percent: lineAttach.percent,
                }),
                [CONNECTIVITY]: getConnectivityPropertiesData({
                    busbarSectionId: lineAttach.bbsOrBusId,
                    voltageLevelId:
                        lineAttach?.existingVoltageLevelId ?? lineAttach?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            };
            const newVoltageLevelInfos = lineAttach?.mayNewVoltageLevelInfos;
            if (newVoltageLevelInfos) {
                formData = {
                    ...formData,
                    [CONNECTIVITY]: {
                        ...formData[CONNECTIVITY],
                        [VOLTAGE_LEVEL]: getNewVoltageLevelData(newVoltageLevelInfos),
                    },
                };
            }
            reset(formData);
            setAttachmentLine(lineAttach?.attachmentLine);
            setAttachmentPoint(lineAttach?.attachmentPointDetailInformation);
            if (newVoltageLevelInfos?.sectionCount && newVoltageLevelInfos?.busbarCount) {
                newVoltageLevelInfos.busbarSections = buildNewBusbarSections(
                    newVoltageLevelInfos?.equipmentId,
                    newVoltageLevelInfos.sectionCount,
                    newVoltageLevelInfos.busbarCount
                );
                setNewVoltageLevel(newVoltageLevelInfos);
            }
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (lineAttach: LineAttachToVoltageLevelFormInfos) => {
            const bbsOrBusId = lineAttach[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID];
            const currentVoltageLevelId = lineAttach[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID];
            if (
                !lineAttach[SLIDER_PERCENTAGE] ||
                !attachmentPoint ||
                !attachmentLine ||
                !currentVoltageLevelId ||
                !bbsOrBusId
            ) {
                return;
            }
            const isNewVoltageLevel = newVoltageLevel?.equipmentId === currentVoltageLevelId;
            attachLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                uuid: editData?.uuid,
                lineToAttachToId: lineAttach[LINE_TO_ATTACH_OR_SPLIT_ID],
                percent: lineAttach[SLIDER_PERCENTAGE],
                attachmentPointId: lineAttach[ATTACHMENT_POINT_ID],
                attachmentPointName: sanitizeString(lineAttach[ATTACHMENT_POINT_NAME]),
                attachmentPointDetailInformation: attachmentPoint,
                mayNewVoltageLevelInfos: isNewVoltageLevel ? newVoltageLevel : undefined,
                existingVoltageLevelId: currentVoltageLevelId,
                bbsOrBusId,
                attachmentLine: attachmentLine,
                newLine1Id: lineAttach[LINE1_ID],
                newLine1Name: sanitizeString(lineAttach[LINE1_NAME]),
                newLine2Id: lineAttach[LINE2_ID],
                newLine2Name: sanitizeString(lineAttach[LINE2_NAME]),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineAttachmentError' });
            });
        },
        [attachmentLine, attachmentPoint, currentNodeUuid, editData, newVoltageLevel, snackError, studyUuid]
    );

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((values) => {
                setVoltageLevelOptions(values.toSorted((a, b) => a?.id?.localeCompare(b?.id)) as VoltageLevel[]);
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onLineCreationDo = useCallback(
        ({ lineCreationInfos }: { lineCreationInfos: LineCreationInfo }) => {
            return new Promise<string>(() => {
                setAttachmentLine(lineCreationInfos);
                setValue(`${ATTACHMENT_LINE_ID}`, lineCreationInfos.equipmentId, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            });
        },
        [setValue]
    );

    const onVoltageLevelCreationDo = useCallback(
        ({
            equipmentId,
            equipmentName,
            substationId,
            substationCreation,
            nominalV,
            lowVoltageLimit,
            highVoltageLimit,
            ipMin,
            ipMax,
            busbarCount,
            sectionCount,
            switchKinds,
            couplingDevices,
            topologyKind,
            properties,
        }: VoltageLevelCreationInfo) => {
            return new Promise<string>(() => {
                const preparedVoltageLevel: ExtendedVoltageLevelCreationInfo = {
                    type: ModificationType.VOLTAGE_LEVEL_CREATION,
                    nodeUuid: currentNodeUuid,
                    studyUuid: studyUuid,
                    equipmentId,
                    equipmentName,
                    substationId: substationId,
                    substationCreation: substationCreation,
                    nominalV: nominalV,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    busbarCount: busbarCount,
                    sectionCount: sectionCount,
                    switchKinds: switchKinds,
                    couplingDevices: couplingDevices,
                    topologyKind: topologyKind,
                    properties: properties,
                    busbarSections:
                        sectionCount && busbarCount
                            ? buildNewBusbarSections(equipmentId, sectionCount, busbarCount)
                            : [],
                };

                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel: VoltageLevel = {
                    id: preparedVoltageLevel.equipmentId,
                    name: preparedVoltageLevel.equipmentName ?? undefined,
                    substationId: preparedVoltageLevel.substationId ?? undefined,
                    nominalV: nominalV ?? 0,
                };

                // we add the new voltage level, (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
                const newVoltageLevelOptions = getNewVoltageLevelOptions(
                    formattedVoltageLevel,
                    oldVoltageLevelId,
                    voltageLevelOptions
                );

                setVoltageLevelOptions(newVoltageLevelOptions);

                setNewVoltageLevel(preparedVoltageLevel);
                setValue(
                    `${CONNECTIVITY}.${VOLTAGE_LEVEL}`,
                    {
                        [ID]: preparedVoltageLevel.equipmentId,
                    },
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );
                setValue(`${CONNECTIVITY}.${BUS_OR_BUSBAR_SECTION}`, null);
            });
        },
        [currentNodeUuid, studyUuid, newVoltageLevel?.equipmentId, voltageLevelOptions, setValue]
    );

    const onAttachmentPointModificationDo = useCallback(
        ({
            equipmentId,
            equipmentName,
            nominalV,
            substationCreation,
            lowVoltageLimit,
            highVoltageLimit,
            busbarCount,
            sectionCount,
            ipMin,
            ipMax,
            topologyKind,
            properties,
        }: VoltageLevelCreationInfo) => {
            return new Promise<string>(() => {
                const attachmentPointData: ExtendedVoltageLevelCreationInfo = {
                    type: ModificationType.VOLTAGE_LEVEL_CREATION,
                    nodeUuid: currentNodeUuid,
                    studyUuid: studyUuid,
                    equipmentId,
                    equipmentName,
                    nominalV: nominalV,
                    substationCreation: substationCreation,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    busbarCount: busbarCount,
                    sectionCount: sectionCount,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    topologyKind: topologyKind,
                    properties: properties,
                };
                setAttachmentPoint(attachmentPointData);
                setValue(`${ATTACHMENT_POINT_ID}`, attachmentPointData.equipmentId, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                setValue(`${ATTACHMENT_POINT_NAME}`, attachmentPointData.equipmentName, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                // this is only used to validate schema if something was changed except ID or NAME and not used elsewhere
                setValue('_dirtyTrigger', JSON.stringify(attachmentPointData), {
                    shouldDirty: true,
                });
            });
        },
        [currentNodeUuid, setValue, studyUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="LineAttachToVoltageLevel"
                subtitle={<LineAttachToVoltageLevelIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LineAttachToVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onLineCreationDo={onLineCreationDo}
                    lineToEdit={attachmentLine}
                    onVoltageLevelCreationDo={onVoltageLevelCreationDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onAttachmentPointModificationDo={onAttachmentPointModificationDo}
                    attachmentPoint={attachmentPoint}
                    setAttachmentPoint={setAttachmentPoint}
                    allVoltageLevelOptions={voltageLevelOptions}
                    isUpdate={isUpdate}
                    editDataFetchStatus={editDataFetchStatus}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineAttachToVoltageLevelDialog;
