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

const getFrequencyRegulationEmptyFormData = () => ({
    [FREQUENCY_REGULATION]: false,
    [DROOP]: null,
});

const getFrequencyRegulationSchema = () => ({
    [FREQUENCY_REGULATION]: yup.bool().required(),
    [DROOP]: yup
        .number()
        .nullable()
        .when([FREQUENCY_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
});

const getVoltageRegulationEmptyFormData = () => ({
    [VOLTAGE_SET_POINT]: null,
    [Q_PERCENT]: null,
    [VOLTAGE_REGULATION_TYPE]: REGULATION_TYPES.LOCAL.id,
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
    ...getRegulatingTerminalEmptyFormData(),
});

const getVoltageRegulationSchema = () => ({
    [VOLTAGE_REGULATION_TYPE]: yup
        .string()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [VOLTAGE_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: true,
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
        .when([VOLTAGE_REGULATION, VOLTAGE_REGULATION_TYPE], {
            is: (voltageRegulation, voltageRegulationType) =>
                voltageRegulation &&
                voltageRegulationType === REGULATION_TYPES.DISTANT.id,
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
            is: (voltageRegulation, voltageRegulationType) =>
                voltageRegulation &&
                voltageRegulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
});

export const getSetPointsEmptyFormData = () => ({
    [VOLTAGE_REGULATION]: false,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getVoltageRegulationEmptyFormData(),
    ...getFrequencyRegulationEmptyFormData(),
});

export const getSetPointsSchema = () => ({
    [VOLTAGE_REGULATION]: yup.bool().nullable().required(),
    [ACTIVE_POWER_SET_POINT]: yup.number().nullable().required(),
    [REACTIVE_POWER_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: false,
            then: (schema) => schema.required(),
        }),
    ...getVoltageRegulationSchema(),
    ...getFrequencyRegulationSchema(),
});
