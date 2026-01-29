/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    FetchStatus,
    FORM_LOADING_DELAY,
    MODIFICATION_TYPES,
    ModificationDialog,
    sanitizeString,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTIVITY,
    ID,
    LEFT_SIDE_PERCENTAGE,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    LINE_TO_ATTACH_OR_SPLIT_ID,
    RIGHT_SIDE_PERCENTAGE,
    SLIDER_PERCENTAGE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import yup from 'components/utils/yup-config';
import {
    getConnectivityData,
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityWithoutPositionValidationSchema,
    getNewVoltageLevelData,
} from '../../connectivity/connectivity-form-utils';
import LineSplitWithVoltageLevelForm, { ExtendedVoltageLevelFormInfos } from './line-split-with-voltage-level-form';
import LineSplitWithVoltageLevelIllustration from './line-split-with-voltage-level-illustration';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { buildNewBusbarSections } from 'components/utils/utils';
import { divideLine } from '../../../../services/study/network-modifications';
import { fetchVoltageLevelsListInfos } from '../../../../services/study/network';
import { getNewVoltageLevelOptions } from '../../../utils/utils';
import { UUID } from 'node:crypto';
import { VoltageLevelFormInfos } from '../voltage-level/voltage-level.type';
import { DeepNullable } from '../../../utils/ts-utils';
import { CurrentTreeNode } from '../../../graph/tree-node.type';
import { VoltageLevelCreationInfo } from '../../../../services/network-modification-types';
import { VoltageLevel } from '../../../utils/equipment-types';

interface ConnectivityData {
    [VOLTAGE_LEVEL]: { [ID]: string };
    [BUS_OR_BUSBAR_SECTION]: { [ID]: string };
    [CONNECTED]: boolean;
}

interface LineSplitWithVoltageLevelFormData {
    [LINE1_ID]: string;
    [LINE1_NAME]: string;
    [LINE2_ID]: string;
    [LINE2_NAME]: string;
    [LINE_TO_ATTACH_OR_SPLIT_ID]: string | null;
    [SLIDER_PERCENTAGE]: number;
    [LEFT_SIDE_PERCENTAGE]: number;
    [RIGHT_SIDE_PERCENTAGE]: number;
    [CONNECTIVITY]: ConnectivityData;
}

const emptyFormData = {
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getLineToAttachOrSplitEmptyFormData(),
    ...getConnectivityWithoutPositionEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        ...getLineToAttachOrSplitFormValidationSchema(),
        ...getConnectivityWithoutPositionValidationSchema(),
    })
    .required() as yup.ObjectSchema<LineSplitWithVoltageLevelFormData>;

export type LineSplitWithVoltageLevelDialogSchemaForm = yup.InferType<typeof formSchema>;

interface LineSplitEditData {
    uuid?: UUID;
    lineToSplitId: string;
    percent: number;
    newLine1Id: string;
    newLine1Name?: string;
    newLine2Id: string;
    newLine2Name?: string;
    bbsOrBusId: string;
    existingVoltageLevelId?: string;
    mayNewVoltageLevelInfos?: VoltageLevelFormInfos;
}

interface LineSplitWithVoltageLevelDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: LineSplitEditData;
    isUpdate: boolean;
    editDataFetchStatus?: FetchStatus;
    onClose: () => void;
}

/**
 * Dialog to create line split with voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineSplitWithVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: LineSplitWithVoltageLevelDialogProps) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState<VoltageLevel[]>([]);

    const currentNodeUuid = currentNode?.id;

    const [newVoltageLevel, setNewVoltageLevel] = useState<ExtendedVoltageLevelFormInfos | null>(null);

    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<LineSplitWithVoltageLevelDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<LineSplitWithVoltageLevelDialogSchemaForm>>(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineSplit: LineSplitEditData) => {
            const connectivityData = getConnectivityData({
                busbarSectionId: lineSplit.bbsOrBusId,
                voltageLevelId: lineSplit?.existingVoltageLevelId ?? lineSplit?.mayNewVoltageLevelInfos?.equipmentId,
            });
            const newVoltageLevel = lineSplit?.mayNewVoltageLevelInfos as ExtendedVoltageLevelFormInfos;

            let formData = {
                [LINE1_ID]: lineSplit.newLine1Id,
                [LINE1_NAME]: lineSplit.newLine1Name,
                [LINE2_ID]: lineSplit.newLine2Id,
                [LINE2_NAME]: lineSplit.newLine2Name,
                ...getLineToAttachOrSplitFormData({
                    lineToAttachOrSplitId: lineSplit.lineToSplitId,
                    percent: lineSplit.percent,
                }),
                ...connectivityData,
                ...(newVoltageLevel && {
                    [CONNECTIVITY]: {
                        ...connectivityData[CONNECTIVITY],
                        [VOLTAGE_LEVEL]: getNewVoltageLevelData(newVoltageLevel),
                    },
                }),
            };

            reset(formData);

            if (newVoltageLevel) {
                newVoltageLevel.busbarSections = buildNewBusbarSections(
                    newVoltageLevel?.equipmentId,
                    newVoltageLevel?.sectionCount,
                    newVoltageLevel?.busbarCount
                );
                setNewVoltageLevel(newVoltageLevel);
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
        (lineSplit: DeepNullable<LineSplitWithVoltageLevelDialogSchemaForm>) => {
            if (
                !lineSplit?.[CONNECTIVITY] ||
                !lineSplit[LINE_TO_ATTACH_OR_SPLIT_ID] ||
                !lineSplit[SLIDER_PERCENTAGE] ||
                !lineSplit[LINE1_ID] ||
                !lineSplit[LINE2_ID]
            ) {
                return;
            }
            const currentVoltageLevelId = lineSplit[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID];
            const isNewVoltageLevel = newVoltageLevel?.equipmentId === currentVoltageLevelId;
            divideLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                lineToSplitId: lineSplit[LINE_TO_ATTACH_OR_SPLIT_ID],
                percent: lineSplit[SLIDER_PERCENTAGE],
                mayNewVoltageLevelInfos: isNewVoltageLevel ? newVoltageLevel : null,
                existingVoltageLevelId: currentVoltageLevelId ?? '',
                bbsOrBusId: lineSplit[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID] ?? '',
                newLine1Id: lineSplit[LINE1_ID],
                newLine1Name: sanitizeString(lineSplit[LINE1_NAME]),
                newLine2Id: lineSplit[LINE2_ID],
                newLine2Name: sanitizeString(lineSplit[LINE2_NAME]),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'LineDivisionError' });
            });
        },
        [currentNodeUuid, editData, newVoltageLevel, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((values) => {
                setVoltageLevelOptions(values.toSorted((a, b) => a?.id?.localeCompare(b?.id)) as VoltageLevel[]);
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

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
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId,
                    equipmentName,
                    substationId: substationId,
                    substationCreation: substationCreation,
                    nominalV: nominalV,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    busbarCount: busbarCount ?? 0,
                    sectionCount: sectionCount ?? 0,
                    switchKinds: switchKinds,
                    couplingDevices: couplingDevices,
                    topologyKind: topologyKind,
                    busbarSections:
                        sectionCount && busbarCount
                            ? buildNewBusbarSections(equipmentId, sectionCount, busbarCount)
                            : [],
                    properties: properties,
                };
                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel = {
                    id: preparedVoltageLevel.equipmentId,
                    name: preparedVoltageLevel.equipmentName ?? '',
                    substationId: preparedVoltageLevel.substationId ?? undefined,
                    nominalV: preparedVoltageLevel.nominalV ?? 0,
                    topologyKind: preparedVoltageLevel.topologyKind,
                };

                // we add the new voltage level (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
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
            });
        },
        [setValue, newVoltageLevel, voltageLevelOptions]
    );

    const onVoltageLevelChange = useCallback(() => {
        const currentVoltageLevelId = getValues(`${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`);
        if (newVoltageLevel && currentVoltageLevelId !== newVoltageLevel?.equipmentId) {
            setNewVoltageLevel(null);
        }
    }, [getValues, newVoltageLevel]);

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
                titleId="LineSplitWithVoltageLevel"
                subtitle={<LineSplitWithVoltageLevelIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LineSplitWithVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onVoltageLevelCreationDo={onVoltageLevelCreationDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onVoltageLevelChange={onVoltageLevelChange}
                    allVoltageLevelOptions={voltageLevelOptions}
                    isUpdate={isUpdate}
                    editDataFetchStatus={editDataFetchStatus}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default LineSplitWithVoltageLevelDialog;
