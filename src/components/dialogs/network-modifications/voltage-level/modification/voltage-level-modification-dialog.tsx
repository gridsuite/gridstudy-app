/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ModificationDialog } from '../../../commons/modificationDialog';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    convertInputValue,
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    EquipmentWithProperties,
    FieldConstants,
    FieldType,
    getConcatenatedProperties,
    snackWithFallback,
    useSnackMessage,
    VoltageLevelDto,
    VoltageLevelModificationDto,
    VoltageLevelModificationForm,
    VoltageLevelModificationFormData,
    voltageLevelModificationDtoToForm,
    voltageLevelModificationEmptyFormData,
    voltageLevelModificationFormSchema,
    voltageLevelModificationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyVoltageLevel } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';

type FetchStatusType = (typeof FetchStatus)[keyof typeof FetchStatus];

interface VoltageLevelModificationDialogProps {
    editData?: VoltageLevelModificationDto;
    defaultIdValue?: string | null;
    currentNode: CurrentTreeNode | null;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatusType;
    [key: string]: any;
}

const VoltageLevelModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: VoltageLevelModificationDialogProps) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string | null>(defaultIdValue ?? null);
    const [voltageLevelToModify, setVoltageLevelToModify] = useState<VoltageLevelDto | undefined>();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const emptyFormData = useMemo(
        () => ({
            ...voltageLevelModificationEmptyFormData,
            [FieldConstants.HIDE_SUBSTATION_FIELD]: false,
        }),
        []
    );

    const formMethods = useFormWithDirtyTracking<DeepNullable<VoltageLevelModificationFormData>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<VoltageLevelModificationFormData>>(voltageLevelModificationFormSchema),
    });

    const { reset, getValues, subscribe, trigger } = formMethods;

    useEffect(() => {
        const callback = subscribe({
            name: [FieldConstants.HIGH_VOLTAGE_LIMIT],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }) => {
                if (isSubmitted) {
                    trigger(FieldConstants.LOW_VOLTAGE_LIMIT).then();
                }
            },
        });
        return () => callback();
    }, [trigger, subscribe]);

    useEffect(() => {
        if (editData) {
            if (editData.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({ ...voltageLevelModificationDtoToForm(editData), [FieldConstants.HIDE_SUBSTATION_FIELD]: false });
        }
    }, [editData, reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EquipmentType.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((voltageLevel: VoltageLevelDto) => {
                        if (voltageLevel) {
                            //We convert values of low short circuit current limit and high short circuit current limit from A to KA
                            if (voltageLevel.identifiableShortCircuit) {
                                voltageLevel.identifiableShortCircuit.ipMax = convertInputValue(
                                    FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                                    voltageLevel.identifiableShortCircuit?.ipMax
                                );
                                voltageLevel.identifiableShortCircuit.ipMin = convertInputValue(
                                    FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                                    voltageLevel.identifiableShortCircuit?.ipMin
                                );
                            }
                            setVoltageLevelToModify(voltageLevel);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [FieldConstants.EQUIPMENT_ID]: equipmentId,
                                    [FieldConstants.ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                        voltageLevel as EquipmentWithProperties,
                                        getValues
                                    ),
                                    [FieldConstants.SUBSTATION_ID]: voltageLevel.substationId ?? null,
                                }),
                                { keepDirty: true }
                            );
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        reset((formValues) => ({ ...formValues, [FieldConstants.EQUIPMENT_ID]: equipmentId }), {
                            keepDirty: true,
                        });
                        if (editData?.equipmentId !== equipmentId) {
                            setVoltageLevelToModify(undefined);
                        }
                    });
            } else {
                setVoltageLevelToModify(undefined);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset, getValues, editData?.equipmentId, emptyFormData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (voltageLevel: VoltageLevelModificationFormData) => {
            modifyVoltageLevel({
                studyUuid,
                nodeUuid: currentNodeUuid as UUID,
                modificationUuid: editData?.uuid,
                ...voltageLevelModificationFormToDto(voltageLevel),
            }).catch((error: Error) => {
                snackWithFallback(snackError, error, { headerId: 'VoltageLevelModificationError' });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [emptyFormData, reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            validationSchema={voltageLevelModificationFormSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                open={open}
                titleId="ModifyVoltageLevel"
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.VOLTAGE_LEVEL}
                        fillerHeight={4}
                    />
                )}
                {selectedId != null && <VoltageLevelModificationForm voltageLevelToModify={voltageLevelToModify} />}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default VoltageLevelModificationDialog;
