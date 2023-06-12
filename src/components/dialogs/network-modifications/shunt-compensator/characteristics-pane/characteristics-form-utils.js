/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_TYPE,
    SHUNT_COMPENSATOR_TYPES,
    SUSCEPTANCE_PER_SECTION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';

const characteristicsValidationSchema = (isModification) => ({
    [CHARACTERISTICS_CHOICE]: yup.string().required(),
    [SUSCEPTANCE_PER_SECTION]: yup
        .number()
        .nullable()
        .when([CHARACTERISTICS_CHOICE], {
            is: CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && !isModification,
            then: (schema) => schema.required(),
        }),
    [SHUNT_COMPENSATOR_TYPE]: yup.string().when([CHARACTERISTICS_CHOICE], {
        is: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && !isModification,
        then: (schema) =>
            schema
                .oneOf([
                    SHUNT_COMPENSATOR_TYPES.CAPACITOR.id,
                    SHUNT_COMPENSATOR_TYPES.REACTOR.id,
                ])
                .required(),
    }),
    [Q_AT_NOMINAL_V]: yup
        .number()
        .nullable()
        .when([CHARACTERISTICS_CHOICE], {
            is: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && !isModification,
            then: (schema) =>
                schema
                    .min(
                        0,
                        'ShuntCompensatorErrorQAtNominalVoltageLessThanZero'
                    )
                    .required(),
        }),
});
export const getCharacteristicsFormValidationSchema = (
    isModification = false
) => {
    return characteristicsValidationSchema(isModification);
};

const characteristicsEmptyFormData = () => ({
    [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [SUSCEPTANCE_PER_SECTION]: null,
    [SHUNT_COMPENSATOR_TYPE]: '',
    [Q_AT_NOMINAL_V]: null,
});

export const getCharacteristicsEmptyFormData = () => {
    return characteristicsEmptyFormData();
};

export const getCharacteristicsFormData = ({
    susceptancePerSection,
    qAtNominalV,
    shuntCompensatorType,
}) => {
    return {
        [CHARACTERISTICS_CHOICE]: qAtNominalV
            ? CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
            : CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
        [SUSCEPTANCE_PER_SECTION]: susceptancePerSection,
        [SHUNT_COMPENSATOR_TYPE]: shuntCompensatorType ?? '',
        [Q_AT_NOMINAL_V]: qAtNominalV,
    };
};

export const getCharacteristicsFormDataFromSearchCopy = ({
    bperSection,
    qatNominalV,
}) => {
    return {
        [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [SUSCEPTANCE_PER_SECTION]: bperSection,
        [SHUNT_COMPENSATOR_TYPE]:
            bperSection > 0
                ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                : SHUNT_COMPENSATOR_TYPES.REACTOR.id,
        [Q_AT_NOMINAL_V]: qatNominalV,
    };
};
