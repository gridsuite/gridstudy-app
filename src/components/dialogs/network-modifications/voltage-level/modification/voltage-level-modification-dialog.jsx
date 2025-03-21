/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
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
    FieldType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyVoltageLevel } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions.ts';

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
        [NOMINAL_V]: yup.number().nullable(),
        [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
        [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
        [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: yup
            .number()
            .nullable()
            .min(0, 'ShortCircuitCurrentLimitMustBeGreaterOrEqualToZero')
            .when([HIGH_SHORT_CIRCUIT_CURRENT_LIMIT], {
                is: (highShortCircuitCurrentLimit) => highShortCircuitCurrentLimit != null,
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
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [voltageLevelInfos, setVoltageLevelInfos] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues } = formMethods;

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
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.VOLTAGE_LEVEL,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((voltageLevel) => {
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
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(voltageLevel, getValues),
                                [SUBSTATION_ID]: voltageLevel?.substationId,
                            }));
                        }
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setVoltageLevelInfos(null);
                            reset(emptyFormData);
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
        (voltageLevel) => {
            modifyVoltageLevel({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                voltageLevelId: selectedId,
                voltageLevelName: voltageLevel[EQUIPMENT_NAME],
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
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelModificationError',
                });
            });
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
                aria-labelledby="dialog-modify-voltage-level"
                maxWidth={'md'}
                open={open}
                titleId="ModifyVoltageLevel"
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL}
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
