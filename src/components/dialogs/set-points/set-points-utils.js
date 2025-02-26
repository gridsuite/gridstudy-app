/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVE_POWER_SET_POINT,
    DROOP,
    EQUIPMENT,
    FREQUENCY_REGULATION,
    ID,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    NAME,
    NOMINAL_VOLTAGE,
    Q_PERCENT,
    REACTIVE_POWER_SET_POINT,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TYPE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import { REGULATION_TYPES } from 'components/network/constants';
import { getRegulatingTerminalEmptyFormData } from '../regulating-terminal/regulating-terminal-form-utils';

export const getFrequencyRegulationEmptyFormData = (isEquipmentModification) => ({
    [FREQUENCY_REGULATION]: isEquipmentModification ? null : false,
    [DROOP]: null,
});

export const getFrequencyRegulationSchema = (isEquipmentModification) => ({
    [FREQUENCY_REGULATION]: yup
        .bool()
        .nullable()
        .when([], {
            is: () => !isEquipmentModification,
            then: (schema) => schema.required(),
        }),
    [DROOP]: yup
        .number()
        .nullable()
        .when([FREQUENCY_REGULATION], {
            is: (frequencyRegulation) => !isEquipmentModification && frequencyRegulation,
            then: (schema) => schema.required(),
        }),
});

const getVoltageRegulationEmptyFormData = (isEquipmentModification) => ({
    [VOLTAGE_SET_POINT]: null,
    [Q_PERCENT]: null,
    [VOLTAGE_REGULATION_TYPE]: isEquipmentModification ? null : REGULATION_TYPES.LOCAL.id,
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
    ...getRegulatingTerminalEmptyFormData(),
});

export const getVoltageRegulationSchema = (isEquipmentModification = false) => ({
    [VOLTAGE_REGULATION_TYPE]: yup.string().nullable(),

    [VOLTAGE_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: (value) => !isEquipmentModification && value,
            then: (schema) => schema.required(),
        }),
    [Q_PERCENT]: yup.number().nullable().max(100, 'NormalizedPercentage').min(0, 'NormalizedPercentage'),
    [VOLTAGE_LEVEL]: yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string(),
            [SUBSTATION_ID]: yup.string(),
            [NOMINAL_VOLTAGE]: yup.string(),
            [TOPOLOGY_KIND]: yup.string().nullable(),
        })
        .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
            is: (voltageRegulation, voltageRegulationType) =>
                !isEquipmentModification && voltageRegulation && voltageRegulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
    [EQUIPMENT]: yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string().nullable(),
            [TYPE]: yup.string(),
        })
        .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
            is: (voltageRegulation, voltageRegulationType, vl) =>
                !isEquipmentModification && voltageRegulation && voltageRegulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
});

export const getSetPointsEmptyFormData = (isEquipmentModification = false) => ({
    [VOLTAGE_REGULATION]: isEquipmentModification ? null : false,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getVoltageRegulationEmptyFormData(isEquipmentModification),
    ...getFrequencyRegulationEmptyFormData(isEquipmentModification),
});

export const getSetPointsSchema = (isEquipmentModification = false) => ({
    ...getVoltageRegulationSchema(isEquipmentModification),
});

export const getReactivePowerSetPointSchema = (isEquipmentModification = false) =>
    yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: (value) => !isEquipmentModification && !value,
            then: (schema) => schema.required(),
        });

export const getActivePowerSetPointSchema = (isEquipmentModification = false) =>
    yup
        .number()
        .when([], {
            is: () => isEquipmentModification,
            then: (schema) => {
                return schema.nullable();
            },
        })
        .when([], {
            is: () => !isEquipmentModification,
            then: (schema) => {
                return schema
                    .required()
                    .nonNullable('FieldIsRequired')
                    .test(
                        'activePowerSetPoint',
                        'ActivePowerMustBeZeroOrBetweenMinAndMaxActivePower',
                        (value, context) => {
                            const minActivePower = context.parent[MINIMUM_ACTIVE_POWER];
                            const maxActivePower = context.parent[MAXIMUM_ACTIVE_POWER];
                            if (value === 0) {
                                return true;
                            }
                            if (minActivePower === null || maxActivePower === null) {
                                return false;
                            }
                            return value >= minActivePower && value <= maxActivePower;
                        }
                    );
            },
        });
