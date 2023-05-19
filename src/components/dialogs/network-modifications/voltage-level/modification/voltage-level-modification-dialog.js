/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import React, { useCallback, useEffect, useState } from 'react';
import VoltageLevelModificationForm from './voltage-level-modification-form';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
} from '../../../../utils/field-constants';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    FetchStatus,
    fetchVoltageLevel,
    modifyVoltageLevel,
} from '../../../../../utils/rest-api';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import { kiloUnitToUnit, unitToKiloUnit } from '../../../../../utils/rounding';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [SUBSTATION_ID]: null,
    [NOMINAL_VOLTAGE]: null,
    [LOW_VOLTAGE_LIMIT]: null,
    [HIGH_VOLTAGE_LIMIT]: null,
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
};

const schema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string().nullable(),
    [SUBSTATION_ID]: yup.string().nullable(),
    [NOMINAL_VOLTAGE]: yup.number().nullable(),
    [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
    [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: yup.number().nullable(),
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: yup.number().nullable(),
});

const VoltageLevelModificationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [voltageLevelInfos, setVoltageLevelInfos] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset, setValue } = methods;

    useEffect(() => {
        if (editData) {
            reset(
                {
                    [EQUIPMENT_ID]: editData?.equipmentId ?? '',
                    [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                    [SUBSTATION_ID]: editData?.substationId?.value ?? null,
                    [NOMINAL_VOLTAGE]: editData?.nominalVoltage?.value ?? null,
                    [LOW_VOLTAGE_LIMIT]:
                        editData?.lowVoltageLimit?.value ?? null,
                    [HIGH_VOLTAGE_LIMIT]:
                        editData?.highVoltageLimit?.value ?? null,
                    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]:
                        unitToKiloUnit(editData?.ipMin?.value) ?? null,
                    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]:
                        unitToKiloUnit(editData?.ipMax?.value) ?? null,
                },
                { keepDefaultValues: true }
            );
        }
    }, [editData, reset]);

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchVoltageLevel(studyUuid, currentNodeUuid, equipmentId)
                    .then((voltageLevel) => {
                        if (voltageLevel) {
                            //We convert values of low short circuit current limit and high short circuit current limit from A to KA
                            voltageLevel.ipMax = unitToKiloUnit(
                                voltageLevel?.ipMax
                            );
                            voltageLevel.ipMin = unitToKiloUnit(
                                voltageLevel?.ipMin
                            );
                            setVoltageLevelInfos(voltageLevel);
                            setDataFetchStatus(FetchStatus.SUCCEED);

                            //TODO We display the previous value of the substation id in the substation field because we can't change it
                            // To be removed when it is possible to change the substation of a voltage level in the backend (Powsybl)
                            setValue(SUBSTATION_ID, voltageLevel?.substationId);
                        }
                    })
                    .catch(() => {
                        setVoltageLevelInfos(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setVoltageLevelInfos(null);
                reset(emptyFormData, { keepDefaultValues: true });
            }
        },
        [studyUuid, currentNodeUuid, reset, setValue]
    );

    const onSubmit = useCallback(
        (voltageLevel) => {
            modifyVoltageLevel(
                studyUuid,
                currentNodeUuid,
                voltageLevel[EQUIPMENT_ID],
                voltageLevel[EQUIPMENT_NAME],
                voltageLevel[NOMINAL_VOLTAGE],
                voltageLevel[LOW_VOLTAGE_LIMIT],
                voltageLevel[HIGH_VOLTAGE_LIMIT],
                kiloUnitToUnit(voltageLevel[LOW_SHORT_CIRCUIT_CURRENT_LIMIT]),
                kiloUnitToUnit(voltageLevel[HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]),
                isUpdate,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError, isUpdate]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider
            validationSchema={schema}
            removeOptional={true}
            {...methods}
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
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                <VoltageLevelModificationForm
                    studyUuid={studyUuid}
                    currentNodeUuid={currentNodeUuid}
                    voltageLevelInfos={voltageLevelInfos}
                    onEquipmentIdChange={onEquipmentIdChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default VoltageLevelModificationDialog;
