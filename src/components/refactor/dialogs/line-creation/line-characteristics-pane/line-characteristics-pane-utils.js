/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
} from 'components/refactor/utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormValidationSchema,
} from '../../connectivity/connectivity-form-utils';

const lineValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [SERIES_RESISTANCE]: yup.number().nullable().required(),
        [SERIES_REACTANCE]: yup.number().nullable().required(),
        [SHUNT_SUSCEPTANCE_1]: yup.number().nullable(),
        [SHUNT_CONDUCTANCE_1]: yup.number().nullable(),
        [SHUNT_SUSCEPTANCE_2]: yup.number().nullable(),
        [SHUNT_CONDUCTANCE_2]: yup.number().nullable(),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_1),
        ...getConnectivityFormValidationSchema(CONNECTIVITY_2),
    }),
});

export const getLineValidationSchema = (id = CHARACTERISTICS) => {
    return lineValidationSchema(id);
};

const lineEmptyFormData = (id) => ({
    [id]: {
        [EQUIPMENT_ID]: '',
        [EQUIPMENT_NAME]: '',
        [SERIES_RESISTANCE]: null,
        [SERIES_REACTANCE]: null,
        [SHUNT_SUSCEPTANCE_1]: null,
        [SHUNT_CONDUCTANCE_1]: null,
        [SHUNT_SUSCEPTANCE_2]: null,
        [SHUNT_CONDUCTANCE_2]: null,
        ...getConnectivityEmptyFormData(CONNECTIVITY_1),
        ...getConnectivityEmptyFormData(CONNECTIVITY_2),
    },
});

export const getLineEmptyFormData = (id = CHARACTERISTICS) => {
    return lineEmptyFormData(id);
};

export const getLineFormData = (
    {
        equipmentId,
        equipmentName = '',
        seriesResistance = null,
        seriesReactance = null,
        shuntConductance1 = null,
        shuntSusceptance1 = null,
        shuntConductance2 = null,
        shuntSusceptance2 = null,
        connectivity1 = null,
        connectivity2 = null,
    },
    id = CHARACTERISTICS
) => {
    return {
        [id]: {
            [EQUIPMENT_ID]: equipmentId,
            [EQUIPMENT_NAME]: equipmentName,
            [SERIES_RESISTANCE]: seriesResistance,
            [SERIES_REACTANCE]: seriesReactance,
            [SHUNT_CONDUCTANCE_1]: shuntConductance1,
            [SHUNT_SUSCEPTANCE_1]: shuntSusceptance1,
            [SHUNT_CONDUCTANCE_2]: shuntConductance2,
            [SHUNT_SUSCEPTANCE_2]: shuntSusceptance2,
            [CONNECTIVITY_1]: connectivity1,
            [CONNECTIVITY_2]: connectivity2,
        },
    };
};
