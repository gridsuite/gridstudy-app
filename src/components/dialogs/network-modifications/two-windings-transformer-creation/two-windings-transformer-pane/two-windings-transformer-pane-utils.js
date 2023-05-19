/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
} from 'components/utils/field-constants';
import yup from '../../../../utils/yup-config';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';

const twoWindingsTransformerValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [SERIES_RESISTANCE]: yup.number().nullable().required(),
        [SERIES_REACTANCE]: yup.number().nullable().required(),
        [MAGNETIZING_CONDUCTANCE]: yup.number().nullable().required(),
        [MAGNETIZING_SUSCEPTANCE]: yup.number().nullable().required(),
        [RATED_S]: yup
            .number()
            .nullable()
            .positive('RatedNominalPowerGreaterThanZero'),
        [RATED_VOLTAGE_1]: yup.number().nullable().required(),
        [RATED_VOLTAGE_2]: yup.number().nullable().required(),
        ...getConnectivityWithPositionValidationSchema(CONNECTIVITY_1),
        ...getConnectivityWithPositionValidationSchema(CONNECTIVITY_2),
    }),
});

export const getTwoWindingsTransformerValidationSchema = (
    id = CHARACTERISTICS
) => {
    return twoWindingsTransformerValidationSchema(id);
};

const twoWindingsTransformerEmptyFormData = (id) => ({
    [id]: {
        [EQUIPMENT_ID]: '',
        [EQUIPMENT_NAME]: '',
        [SERIES_RESISTANCE]: null,
        [SERIES_REACTANCE]: null,
        [MAGNETIZING_CONDUCTANCE]: null,
        [MAGNETIZING_SUSCEPTANCE]: null,
        [RATED_S]: null,
        [RATED_VOLTAGE_1]: null,
        [RATED_VOLTAGE_2]: null,
        ...getConnectivityWithPositionEmptyFormData(CONNECTIVITY_1),
        ...getConnectivityWithPositionEmptyFormData(CONNECTIVITY_2),
    },
});

export const getTwoWindingsTransformerEmptyFormData = (
    id = CHARACTERISTICS
) => {
    return twoWindingsTransformerEmptyFormData(id);
};

export const getTwoWindingsTransformerFormData = (
    {
        equipmentId,
        equipmentName = '',
        seriesResistance = null,
        seriesReactance = null,
        magnetizingConductance = null,
        magnetizingSusceptance = null,
        ratedS = null,
        ratedVoltage1 = null,
        ratedVoltage2 = null,
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
            [MAGNETIZING_CONDUCTANCE]: magnetizingConductance,
            [MAGNETIZING_SUSCEPTANCE]: magnetizingSusceptance,
            [RATED_S]: ratedS,
            [RATED_VOLTAGE_1]: ratedVoltage1,
            [RATED_VOLTAGE_2]: ratedVoltage2,
            [CONNECTIVITY_1]: connectivity1,
            [CONNECTIVITY_2]: connectivity2,
        },
    };
};
