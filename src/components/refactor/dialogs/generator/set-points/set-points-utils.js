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
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import { REGULATION_TYPES } from '../../../../network/constants';
import { getRegulatingTerminalEmptyFormData } from '../../regulating-terminal/regulating-terminal-form-utils';
import { getPreviousValueFieldName } from 'components/refactor/utils/utils';
import {
    PREVIOUS_ACTIVE_POWER_SET_POINT, PREVIOUS_EQUIPMENT, PREVIOUS_FREQUENCY_REGULATION, PREVIOUS_VOLTAGE_LEVEL,
    PREVIOUS_VOLTAGE_REGULATION, PREVIOUS_VOLTAGE_SET_POINT
} from "../modification/generator-modification-utils";

const getFrequencyRegulationEmptyFormData = (frequencyRegulation) => ({
    [FREQUENCY_REGULATION]: frequencyRegulation,
    [DROOP]: null,
});

const getFrequencyRegulationSchema = () => ({
    [FREQUENCY_REGULATION]: yup
        .bool()
        .nullable()
        .when([PREVIOUS_FREQUENCY_REGULATION], {
            is: (value) => value == null,
            then: (schema) => schema.required(),
        }),
    [DROOP]: yup
        .number()
        .nullable()
        .when([FREQUENCY_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
});

const getVoltageRegulationEmptyFormData = (voltageRegulationType) => ({
    [VOLTAGE_SET_POINT]: null,
    [Q_PERCENT]: null,
    [VOLTAGE_REGULATION_TYPE]: voltageRegulationType,
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
    ...getRegulatingTerminalEmptyFormData(),
});

const getVoltageRegulationSchema = () => ({
    [VOLTAGE_REGULATION_TYPE]: yup
        .string()
        .nullable()
        .when([VOLTAGE_REGULATION, PREVIOUS_VOLTAGE_REGULATION], {
            is: (value, previousValue) => !value && !previousValue,
            then: (schema) => schema.required(),
        }),
    [VOLTAGE_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION, PREVIOUS_VOLTAGE_SET_POINT], {
            is: (value, previousValue) => value && !previousValue,
            then: (schema) => schema.required(),
        }),
    [Q_PERCENT]: yup
        .number()
        .nullable()
        .max(100, 'NormalizedPercentage')
        .min(0, 'NormalizedPercentage'),
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
        .when(
            [VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE, PREVIOUS_VOLTAGE_LEVEL],
            {
                is: (
                    voltageRegulation,
                    voltageRegulationType,
                    oldVoltageLevel
                ) =>
                    oldVoltageLevel == null &&
                    (voltageRegulation == null || voltageRegulation) &&
                    voltageRegulationType === REGULATION_TYPES.DISTANT.id,
                then: (schema) => schema.required(),
            }
        ),
    [EQUIPMENT]: yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string().nullable(),
            [TYPE]: yup.string(),
        })
        .when(
            [
                VOLTAGE_REGULATION,
                VOLTAGE_REGULATION_TYPE,
                PREVIOUS_EQUIPMENT,
                VOLTAGE_LEVEL,
            ],
            {
                is: (
                    voltageRegulation,
                    voltageRegulationType,
                    oldEquipment,
                    vl
                ) =>
                    (!oldEquipment &&
                        (voltageRegulation == null || voltageRegulation) &&
                        voltageRegulationType ===
                            REGULATION_TYPES.DISTANT.id) ||
                    vl,
                then: (schema) => schema.required(),
            }
        ),
});

export const getSetPointsEmptyFormData = (
    voltageRegulation = false,
    voltageRegulationType = REGULATION_TYPES.LOCAL.id,
    frequencyRegulation = false
                                          ) => ({
    [VOLTAGE_REGULATION]: voltageRegulation,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getVoltageRegulationEmptyFormData(voltageRegulationType),
    ...getFrequencyRegulationEmptyFormData(frequencyRegulation),
});

export const getSetPointsSchema = (isGeneratorModification = false) => ({
    [VOLTAGE_REGULATION]: yup
        .bool()
        .nullable()
        .when([], {
            is: () => !isGeneratorModification,
            then: (schema) => schema.required(),
        }),
    ...getActivePowerSetPointSchema(),
    ...getReactivePowerSetPointSchema(),
    ...getVoltageRegulationSchema(),
    ...getFrequencyRegulationSchema(isGeneratorModification),
});

const getReactivePowerSetPointSchema = () => ({
    [REACTIVE_POWER_SET_POINT]: yup
        .number()
        .nullable()
        .when([PREVIOUS_VOLTAGE_REGULATION], {
            is: (value) => value == null,
            then: (schema) => schema.required(),
        }),
});

const getActivePowerSetPointSchema = () => ({
    [ACTIVE_POWER_SET_POINT]: yup
        .number()
        .nullable()
        .when([PREVIOUS_ACTIVE_POWER_SET_POINT], {
            is: (value) => value == null,
            then: (schema) => schema.required(),
        }),
});
