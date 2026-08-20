/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeepNullable,
    getConnectivityPropertiesData,
    getConnectivityPropertiesValidationSchema,
    getConnectivityWithoutPositionEmptyFormData,
    getNewVoltageLevelData,
    LineCreationDto,
    ModificationType,
    sanitizeString,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelCreationDto,
    VoltageLevelOption,
} from '@gridsuite/commons-ui';
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
import * as yup from 'yup';
import { ModificationDialog } from '../../commons/modificationDialog';
import LineAttachToVoltageLevelForm from './line-attach-to-voltage-level-form';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { attachLine } from '../../../../services/study/network-modifications';
import { fetchVoltageLevelsListInfos } from '../../../../services/study/network';
import LineAttachToVoltageLevelIllustration from './line-attach-to-voltage-level-illustration';
import { getNewVoltageLevelOptions, mergeVoltageLevelOptions } from '../../../utils/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { FetchStatus } from '../../../../services/utils.type';
import { AttachLineInfo } from '../../../../services/network-modification-types';

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

const emptyAttachmentPoint: VoltageLevelCreationDto = {
    type: ModificationType.VOLTAGE_LEVEL_CREATION,
    equipmentId: '',
    equipmentName: null,
    substationId: null,
    substationCreation: null,
    nominalV: null,
    lowVoltageLimit: null,
    highVoltageLimit: null,
    ipMin: null,
    ipMax: null,
    busbarCount: 1,
    sectionCount: 1,
    switchKinds: [],
    couplingDevices: [],
    properties: null,
};

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

    const [attachmentLine, setAttachmentLine] = useState<LineCreationDto>();
    const [newVoltageLevel, setNewVoltageLevel] = useState<VoltageLevelCreationDto>();
    const [attachmentPoint, setAttachmentPoint] = useState<VoltageLevelCreationDto>(emptyAttachmentPoint);

    const { snackError } = useSnackMessage();

    const [voltageLevelOptions, setVoltageLevelOptions] = useState<VoltageLevelOption[]>([]);

    const formMethods = useForm<DeepNullable<LineAttachToVoltageLevelFormInfos>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineAttachToVoltageLevelFormInfos>>(formSchema),
    });

    const { reset, setValue, getValues, trigger } = formMethods;

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
                setNewVoltageLevel(newVoltageLevelInfos);
                const formattedVoltageLevel = {
                    id: newVoltageLevelInfos.equipmentId,
                    name: newVoltageLevelInfos.equipmentName ?? '',
                    exist: false,
                    busbarCount: newVoltageLevelInfos.busbarCount,
                    sectionCount: newVoltageLevelInfos.sectionCount,
                    switchKinds: newVoltageLevelInfos.switchKinds,
                };
                setVoltageLevelOptions((prev) => getNewVoltageLevelOptions(formattedVoltageLevel, undefined, prev));
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
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((existingVl) => {
                setVoltageLevelOptions((prev) => mergeVoltageLevelOptions(existingVl, prev));
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onLineCreationDo = useCallback(
        ({ lineCreationInfos }: { lineCreationInfos: LineCreationDto }) => {
            return new Promise<string>(() => {
                // clean unused (required) fields by a simple copy with casting
                const {
                    type,
                    equipmentId,
                    equipmentName,
                    r,
                    x,
                    g1,
                    b1,
                    g2,
                    b2,
                    operationalLimitsGroups,
                    selectedOperationalLimitsGroupId1,
                    selectedOperationalLimitsGroupId2,
                    properties,
                } = lineCreationInfos;

                const preparedLine: LineCreationDto = {
                    type,
                    equipmentId,
                    equipmentName,
                    r,
                    x,
                    g1,
                    b1,
                    g2,
                    b2,
                    operationalLimitsGroups,
                    selectedOperationalLimitsGroupId1,
                    selectedOperationalLimitsGroupId2,
                    properties,
                } as LineCreationDto;

                setAttachmentLine(preparedLine);
                setValue(`${ATTACHMENT_LINE_ID}`, preparedLine.equipmentId, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
                // Force the form dirty when attachment line props change but ID does not.
                // The value itself is never read — any non-empty string would work; we use the
                // stringified line for parity with onAttachmentPointModificationDo and for debug visibility.
                setValue('_dirtyTrigger', JSON.stringify(preparedLine), {
                    shouldDirty: true,
                });
            });
        },
        [setValue]
    );

    const onVoltageLevelCreationDo = useCallback(
        (preparedVoltageLevel: VoltageLevelCreationDto) => {
            return new Promise<string>(() => {
                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel = {
                    id: preparedVoltageLevel.equipmentId,
                    name: preparedVoltageLevel.equipmentName ?? '',
                    exist: false,
                    busbarCount: preparedVoltageLevel.busbarCount,
                    sectionCount: preparedVoltageLevel.sectionCount,
                    switchKinds: preparedVoltageLevel.switchKinds,
                };

                // we add the new voltage level, (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
                const newVoltageLevelOptions = getNewVoltageLevelOptions(
                    formattedVoltageLevel,
                    oldVoltageLevelId,
                    voltageLevelOptions
                );

                setVoltageLevelOptions(newVoltageLevelOptions);

                setNewVoltageLevel(preparedVoltageLevel);
                // The connectivity sub-fields cannot be addressed individually: commons-ui builds their schema with
                // FieldConstants enum keys, which react-hook-form's path types resolve to never. Set the whole
                // connectivity instead, then validate the voltage level alone so that emptying the busbar section
                // does not immediately raise its own "required" error.
                setValue(
                    CONNECTIVITY,
                    {
                        ...getValues(CONNECTIVITY),
                        [VOLTAGE_LEVEL]: { [ID]: preparedVoltageLevel.equipmentId },
                        [BUS_OR_BUSBAR_SECTION]: null,
                    },
                    {
                        shouldDirty: true,
                    }
                );
                trigger(`${CONNECTIVITY}.${VOLTAGE_LEVEL}`);
            });
        },
        [newVoltageLevel?.equipmentId, voltageLevelOptions, setValue, getValues, trigger]
    );

    const onAttachmentPointModificationDo = useCallback(
        (attachmentPointData: VoltageLevelCreationDto) => {
            return new Promise<string>(() => {
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
        [setValue]
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
