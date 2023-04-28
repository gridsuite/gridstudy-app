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
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
    SHUNT_CONDUCTANCE_1,
    SHUNT_CONDUCTANCE_2,
    SHUNT_SUSCEPTANCE_1,
    SHUNT_SUSCEPTANCE_2,
} from 'components/utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../connectivity/connectivity-form-utils';

const characteristicsValidationSchema = (
    id,
    displayConnectivity,
    modification
) => ({
    [id]: yup.object().shape({
        [SERIES_RESISTANCE]: modification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [SERIES_REACTANCE]: modification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [SHUNT_SUSCEPTANCE_1]: yup.number().nullable(),
        [SHUNT_CONDUCTANCE_1]: yup.number().nullable(),
        [SHUNT_SUSCEPTANCE_2]: yup.number().nullable(),
        [SHUNT_CONDUCTANCE_2]: yup.number().nullable(),
        ...(displayConnectivity &&
            getConnectivityWithPositionValidationSchema(CONNECTIVITY_1)),
        ...(displayConnectivity &&
            getConnectivityWithPositionValidationSchema(CONNECTIVITY_2)),
    }),
});

export const getCharacteristicsValidationSchema = (
    id,
    displayConnectivity,
    modification = false
) => {
    return characteristicsValidationSchema(
        id,
        displayConnectivity,
        modification
    );
};

const characteristicsEmptyFormData = (id, displayConnectivity = true) => ({
    [id]: {
        [SERIES_RESISTANCE]: null,
        [SERIES_REACTANCE]: null,
        [SHUNT_SUSCEPTANCE_1]: null,
        [SHUNT_CONDUCTANCE_1]: null,
        [SHUNT_SUSCEPTANCE_2]: null,
        [SHUNT_CONDUCTANCE_2]: null,
        ...(displayConnectivity &&
            getConnectivityWithPositionEmptyFormData(CONNECTIVITY_1)),
        ...(displayConnectivity &&
            getConnectivityWithPositionEmptyFormData(CONNECTIVITY_2)),
    },
});

export const getCharacteristicsEmptyFormData = (
    id = CHARACTERISTICS,
    displayConnectivity = true
) => {
    return characteristicsEmptyFormData(id, displayConnectivity);
};

export const getCharacteristicsFormData = (
    {
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
) => ({
    [id]: {
        [SERIES_RESISTANCE]: seriesResistance,
        [SERIES_REACTANCE]: seriesReactance,
        [SHUNT_CONDUCTANCE_1]: shuntConductance1,
        [SHUNT_SUSCEPTANCE_1]: shuntSusceptance1,
        [SHUNT_CONDUCTANCE_2]: shuntConductance2,
        [SHUNT_SUSCEPTANCE_2]: shuntSusceptance2,
        [CONNECTIVITY_1]: connectivity1,
        [CONNECTIVITY_2]: connectivity2,
    },
});

export const getCharacteristicsWithOutConnectivityFormData = (
    {
        seriesResistance = null,
        seriesReactance = null,
        shuntConductance1 = null,
        shuntSusceptance1 = null,
        shuntConductance2 = null,
        shuntSusceptance2 = null,
    },
    id = CHARACTERISTICS
) => ({
    [id]: {
        [SERIES_RESISTANCE]: seriesResistance,
        [SERIES_REACTANCE]: seriesReactance,
        [SHUNT_CONDUCTANCE_1]: shuntConductance1,
        [SHUNT_SUSCEPTANCE_1]: shuntSusceptance1,
        [SHUNT_CONDUCTANCE_2]: shuntConductance2,
        [SHUNT_SUSCEPTANCE_2]: shuntSusceptance2,
    },
});
