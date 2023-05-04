/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import React, { useCallback, useMemo, useState } from 'react';
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
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    fetchVoltageLevel,
    modifyVoltageLevel,
} from '../../../../utils/rest-api';

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
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [voltageLevelInfos, setVoltageLevelInfos] = useState(null);
    const formDataFromEditData = useMemo(
        () =>
            editData
                ? {
                      [EQUIPMENT_ID]: editData.equipmentId,
                      [EQUIPMENT_NAME]: editData.equipmentName?.value ?? '',
                      [SUBSTATION_ID]: editData?.substationId?.value,
                      [NOMINAL_VOLTAGE]: editData?.nominalVoltage?.value,
                      [LOW_VOLTAGE_LIMIT]: editData?.lowVoltageLimit?.value,
                      [HIGH_VOLTAGE_LIMIT]: editData?.highVoltageLimit?.value,
                      [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]:
                          editData?.lowShortCircuitCurrentLimit?.value,
                      [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]:
                          editData?.highShortCircuitCurrentLimit?.value,
                  }
                : null,
        [editData]
    );

    const defaultValues = useMemo(
        () => (editData ? formDataFromEditData : emptyFormData),
        [editData, formDataFromEditData]
    );

    const methods = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                fetchVoltageLevel(studyUuid, currentNodeUuid, equipmentId).then(
                    (voltageLevel) => {
                        if (voltageLevel) {
                            setVoltageLevelInfos(voltageLevel);
                        }
                    }
                );
            } else {
                setVoltageLevelInfos(null);
                reset(emptyFormData, { keepDefaultValues: false });
            }
        },
        [studyUuid, currentNodeUuid, reset]
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
                voltageLevel[LOW_SHORT_CIRCUIT_CURRENT_LIMIT],
                voltageLevel[HIGH_SHORT_CIRCUIT_CURRENT_LIMIT],
                !!editData,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelModificationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

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
                titleId="ModifyVoltageLevel"
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
