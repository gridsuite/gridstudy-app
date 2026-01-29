/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import VoltageLevelModificationForm from './voltage-level-modification-form';
import {
    ADDITIONAL_PROPERTIES,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_V,
    SUBSTATION_ID,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    EquipmentInfosTypes,
    EquipmentType,
    fetchNetworkElementInfos,
    FetchStatus,
    FieldType,
    ModificationDialog,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyVoltageLevel } from '../../../../../services/study/network-modifications';
import {
    emptyProperties,
    Equipment,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';

type FetchStatusType = (typeof FetchStatus)[keyof typeof FetchStatus];

interface EditData {
    uuid?: UUID;
    equipmentId?: string;
    equipmentName?: { value: string };
    substationId?: { value: string };
    nominalV?: { value: number };
    lowVoltageLimit?: { value: number };
    highVoltageLimit?: { value: number };
    ipMin?: { value: number };
    ipMax?: { value: number };
    properties?: any;
}

interface VoltageLevelModificationDialogProps {
    editData?: EditData;
    defaultIdValue?: string | null;
    currentNode: CurrentTreeNode | null;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatusType;
    [key: string]: any;
}

interface VoltageLevelFormData {
    [EQUIPMENT_NAME]?: string;
    [SUBSTATION_ID]?: string;
    [NOMINAL_V]?: number;
    [LOW_VOLTAGE_LIMIT]?: number;
    [HIGH_VOLTAGE_LIMIT]?: number;
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]?: number;
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]?: number;
    [ADDITIONAL_PROPERTIES]?: any;
    [key: string]: any;
}

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [SUBSTATION_ID]: null,
    [NOMINAL_V]: null,
    [LOW_VOLTAGE_LIMIT]: null,
    [HIGH_VOLTAGE_LIMIT]: null,
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [SUBSTATION_ID]: yup.string().nullable(),
        [NOMINAL_V]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        [LOW_VOLTAGE_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'mustBeGreaterOrEqualToZero')
            .when([HIGH_VOLTAGE_LIMIT], {
                is: (highVoltageLimit: number) => highVoltageLimit != null,
                then: (schema) => schema.max(yup.ref(HIGH_VOLTAGE_LIMIT), 'voltageLevelNominalVoltageMaxValueError'),
            }),
        [HIGH_VOLTAGE_LIMIT]: yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero'),
        [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero')
            .when([HIGH_SHORT_CIRCUIT_CURRENT_LIMIT], {
                is: (highShortCircuitCurrentLimit: number) => highShortCircuitCurrentLimit != null,
                then: (schema) =>
                    schema.max(yup.ref(HIGH_SHORT_CIRCUIT_CURRENT_LIMIT), 'ShortCircuitCurrentLimitMinMaxError'),
            }),
        [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero'),
    })
    .concat(modificationPropertiesSchema);
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
    const [voltageLevelInfos, setVoltageLevelInfos] = useState<VoltageLevelFormData | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useFormWithDirtyTracking({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, subscribe, trigger } = formMethods;

    useEffect(() => {
        const callback = subscribe({
            name: [`${HIGH_VOLTAGE_LIMIT}`],
            formState: {
                values: true,
            },
            callback: ({ isSubmitted }) => {
                if (isSubmitted) {
                    trigger(`${LOW_VOLTAGE_LIMIT}`).then();
                }
            },
        });
        return () => callback();
    }, [trigger, subscribe]);

    useEffect(() => {
        if (editData) {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                [SUBSTATION_ID]: editData?.substationId?.value ?? null,
                [NOMINAL_V]: editData?.nominalV?.value ?? null,
                [LOW_VOLTAGE_LIMIT]: editData?.lowVoltageLimit?.value ?? null,
                [HIGH_VOLTAGE_LIMIT]: editData?.highVoltageLimit?.value ?? null,
                [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]:
                    convertInputValue(FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT, editData?.ipMin?.value) ?? null,
                [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]:
                    convertInputValue(FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT, editData?.ipMax?.value) ?? null,
                ...getPropertiesFromModification(editData.properties),
            });
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
                    EquipmentInfosTypes.FORM.type,
                    equipmentId as UUID,
                    true
                )
                    .then((voltageLevel: VoltageLevelFormData) => {
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
                            setVoltageLevelInfos(voltageLevel);
                            setDataFetchStatus(FetchStatus.SUCCEED);
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                        voltageLevel as Equipment,
                                        getValues
                                    ),
                                    [SUBSTATION_ID]: voltageLevel?.substationId,
                                }),
                                { keepDirty: true }
                            );
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setVoltageLevelInfos(null);
                        }
                    });
            } else {
                setVoltageLevelInfos(null);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, currentRootNetworkUuid, reset, getValues, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (voltageLevel: VoltageLevelFormData) => {
            if (selectedId != null) {
                modifyVoltageLevel({
                    studyUuid: studyUuid,
                    nodeUuid: currentNodeUuid as UUID,
                    modificationUuid: editData?.uuid,
                    equipmentId: selectedId,
                    equipmentName: voltageLevel[EQUIPMENT_NAME],
                    nominalV: voltageLevel[NOMINAL_V],
                    lowVoltageLimit: voltageLevel[LOW_VOLTAGE_LIMIT],
                    highVoltageLimit: voltageLevel[HIGH_VOLTAGE_LIMIT],
                    lowShortCircuitCurrentLimit: convertOutputValue(
                        FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
                        voltageLevel[LOW_SHORT_CIRCUIT_CURRENT_LIMIT]
                    ),
                    highShortCircuitCurrentLimit: convertOutputValue(
                        FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
                        voltageLevel[HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]
                    ),
                    properties: toModificationProperties(voltageLevel),
                }).catch((error: Error) => {
                    snackWithFallback(snackError, error, { headerId: 'VoltageLevelModificationError' });
                });
            }
        },
        [editData, studyUuid, currentNodeUuid, selectedId, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider
            validationSchema={formSchema}
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
                {selectedId != null && (
                    <VoltageLevelModificationForm voltageLevelInfos={voltageLevelInfos} equipmentId={selectedId} />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default VoltageLevelModificationDialog;
