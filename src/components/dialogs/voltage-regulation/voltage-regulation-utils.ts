/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    EQUIPMENT,
    ID,
    NAME,
    NOMINAL_VOLTAGE,
    Q_PERCENT,
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

export const getVoltageRegulationEmptyFormData = (isEquipmentModification = false) => ({
    [VOLTAGE_REGULATION]: isEquipmentModification ? null : false,
    [VOLTAGE_SET_POINT]: null,
    [Q_PERCENT]: null,
    [VOLTAGE_REGULATION_TYPE]: isEquipmentModification ? null : REGULATION_TYPES.LOCAL.id,
    ...getRegulatingTerminalEmptyFormData(),
});

export const getVoltageRegulationSchema = (isEquipmentModification = false) => ({
    [VOLTAGE_REGULATION]: yup
        .bool()
        .nullable()
        .when([], {
            is: () => !isEquipmentModification,
            then: (schema) => schema.required(),
        }),
    [VOLTAGE_REGULATION_TYPE]: yup.string().nullable(),

    [VOLTAGE_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION], {
            is: (value: string) => !isEquipmentModification && value,
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
            is: (voltageRegulation: number, voltageRegulationType: string) =>
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
            is: (voltageRegulation: number, voltageRegulationType: string) =>
                !isEquipmentModification && voltageRegulation && voltageRegulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
});
