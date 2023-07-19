/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

const characteristicsValidationSchema = (isModification, additionalFields) => ({
    [CHARACTERISTICS]: yup.object().shape({
        [SERIES_RESISTANCE]: isModification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [SERIES_REACTANCE]: isModification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [MAGNETIZING_CONDUCTANCE]: isModification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [MAGNETIZING_SUSCEPTANCE]: isModification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [RATED_S]: yup
            .number()
            .nullable()
            .positive('RatedNominalPowerGreaterThanZero'),
        [RATED_VOLTAGE_1]: isModification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        [RATED_VOLTAGE_2]: isModification
            ? yup.number().nullable()
            : yup.number().nullable().required(),
        ...additionalFields,
    }),
});

export const getCharacteristicsValidationSchema = (
    isModification = false,
    additionalFields = {}
) => {
    return characteristicsValidationSchema(isModification, additionalFields);
};

const characteristicsEmptyFormData = (additionalFields) => ({
    [CHARACTERISTICS]: {
        [SERIES_RESISTANCE]: null,
        [SERIES_REACTANCE]: null,
        [MAGNETIZING_CONDUCTANCE]: null,
        [MAGNETIZING_SUSCEPTANCE]: null,
        [RATED_S]: null,
        [RATED_VOLTAGE_1]: null,
        [RATED_VOLTAGE_2]: null,
        ...additionalFields,
    },
});

export const getCharacteristicsEmptyFormData = (additionalFields = {}) => {
    return characteristicsEmptyFormData(additionalFields);
};

export const getCharacteristicsFormData = (
    {
        seriesResistance = null,
        seriesReactance = null,
        magnetizingConductance = null,
        magnetizingSusceptance = null,
        ratedS = null,
        ratedVoltage1 = null,
        ratedVoltage2 = null,
    },
    additionalFields = {}
) => {
    return {
        [CHARACTERISTICS]: {
            [SERIES_RESISTANCE]: seriesResistance,
            [SERIES_REACTANCE]: seriesReactance,
            [MAGNETIZING_CONDUCTANCE]: magnetizingConductance,
            [MAGNETIZING_SUSCEPTANCE]: magnetizingSusceptance,
            [RATED_S]: ratedS,
            [RATED_VOLTAGE_1]: ratedVoltage1,
            [RATED_VOLTAGE_2]: ratedVoltage2,
            ...additionalFields,
        },
    };
};
