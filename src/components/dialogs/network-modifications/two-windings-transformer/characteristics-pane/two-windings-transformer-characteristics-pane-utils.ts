/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CHARACTERISTICS, G, B, RATED_S, RATED_U1, RATED_U2, R, X } from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

export interface CharacteristicsValues {
    [R]?: number | null;
    [X]?: number | null;
    [G]?: number | null;
    [B]?: number | null;
    [RATED_S]?: number | null;
    [RATED_U1]?: number | null;
    [RATED_U2]?: number | null;
}

type AdditionalValidationFields = Record<string, yup.AnySchema>;
type AdditionalDataFields = Record<string, unknown>;

const characteristicsValidationSchema = (isModification: boolean, additionalFields: AdditionalValidationFields) => ({
    [CHARACTERISTICS]: yup.object().shape({
        [R]: isModification
            ? yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero')
            : yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero').required(),
        [X]: isModification ? yup.number().nullable() : yup.number().nullable().required(),
        [G]: isModification
            ? yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero')
            : yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero').required(),
        [B]: isModification ? yup.number().nullable() : yup.number().nullable().required(),
        [RATED_S]: yup.number().nullable().positive('RatedNominalPowerMustBeGreaterThanZero'),
        [RATED_U1]: isModification
            ? yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero')
            : yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero').required(),
        [RATED_U2]: isModification
            ? yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero')
            : yup.number().nullable().min(0, 'mustBeGreaterOrEqualToZero').required(),
        ...additionalFields,
    }),
});

export const getCharacteristicsValidationSchema = (isModification = false, additionalFields = {}) => {
    return characteristicsValidationSchema(isModification, additionalFields);
};

const characteristicsEmptyFormData = (additionalFields: AdditionalDataFields) => ({
    [CHARACTERISTICS]: {
        [R]: null,
        [X]: null,
        [G]: null,
        [B]: null,
        [RATED_S]: null,
        [RATED_U1]: null,
        [RATED_U2]: null,
        ...additionalFields,
    },
});

export const getCharacteristicsEmptyFormData = (additionalFields = {}) => {
    return characteristicsEmptyFormData(additionalFields);
};

export const getCharacteristicsFormData = (
    { r = null, x = null, g = null, b = null, ratedS = null, ratedU1 = null, ratedU2 = null }: CharacteristicsValues,
    additionalFields = {}
) => {
    return {
        [CHARACTERISTICS]: {
            [R]: r,
            [X]: x,
            [G]: g,
            [B]: b,
            [RATED_S]: ratedS,
            [RATED_U1]: ratedU1,
            [RATED_U2]: ratedU2,
            ...additionalFields,
        },
    };
};
