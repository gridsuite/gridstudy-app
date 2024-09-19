/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SHUNT_COMPENSATOR_TYPE,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SWITCHED_ON_SUSCEPTANCE,
    SWITCHED_ON_Q_AT_NOMINAL_V,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { computeSwitchedOnValue } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { SHUNT_COMPENSATOR_TYPES } from '../../../../network/constants';

const characteristicsValidationSchema = (isModification) => ({
    [CHARACTERISTICS_CHOICE]: yup.string().required(),
    [SHUNT_COMPENSATOR_TYPE]: yup.string().when([CHARACTERISTICS_CHOICE], {
        is: (characteristicsChoice) =>
            characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && !isModification,
        then: (schema) =>
            schema.oneOf([SHUNT_COMPENSATOR_TYPES.CAPACITOR.id, SHUNT_COMPENSATOR_TYPES.REACTOR.id]).required(),
        otherwise: (schema) => schema.nullable(),
    }),
    ...(isModification
        ? getCharacteristicsModificationFormValidationSchema()
        : getCharacteristicsCreateFormValidationSchema()),
});

const getCharacteristicsCreateFormValidationSchema = () => {
    return {
        [MAX_Q_AT_NOMINAL_V]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice) => characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                then: (schema) => schema.min(0, 'ShuntCompensatorErrorQAtNominalVoltageLessThanZero').required(),
            }),
        [MAX_SUSCEPTANCE]: yup
            .number()
            .nullable()
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice) => characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
                then: (schema) => schema.required(),
            }),
        [MAXIMUM_SECTION_COUNT]: yup.number().required().min(1, 'MaximumSectionCountMustBeGreaterOrEqualToOne'),
        [SECTION_COUNT]: yup
            .number()
            .required()
            .min(0, 'SectionCountMustBeBetweenZeroAndMaximumSectionCount')
            .max(yup.ref(MAXIMUM_SECTION_COUNT), 'SectionCountMustBeBetweenZeroAndMaximumSectionCount'),
        [SWITCHED_ON_Q_AT_NOMINAL_V]: yup.number().notRequired(),
        [SWITCHED_ON_SUSCEPTANCE]: yup.number().notRequired(),
    };
};

const getCharacteristicsModificationFormValidationSchema = () => {
    return {
        [MAX_Q_AT_NOMINAL_V]: yup.number().nullable().min(0, 'ShuntCompensatorErrorQAtNominalVoltageLessThanZero'),
        [MAX_SUSCEPTANCE]: yup.number().nullable(),
        [MAXIMUM_SECTION_COUNT]: yup.number().min(1, 'MaximumSectionCountMustBeGreaterOrEqualToOne').nullable(),
        [SECTION_COUNT]: yup.number().nullable().min(0, 'SectionCountMustBeBetweenZeroAndMaximumSectionCount'),
        [SWITCHED_ON_Q_AT_NOMINAL_V]: yup.number().nullable(),
        [SWITCHED_ON_SUSCEPTANCE]: yup.number().nullable(),
    };
};

export const getCharacteristicsFormValidationSchema = (isModification = false) => {
    return characteristicsValidationSchema(isModification);
};

const characteristicsEmptyFormData = () => ({
    [MAXIMUM_SECTION_COUNT]: null,
    [SECTION_COUNT]: null,
    [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [MAX_SUSCEPTANCE]: null,
    [SHUNT_COMPENSATOR_TYPE]: null,
    [MAX_Q_AT_NOMINAL_V]: null,
    [SWITCHED_ON_Q_AT_NOMINAL_V]: null,
    [SWITCHED_ON_SUSCEPTANCE]: null,
});

export const getCharacteristicsEmptyFormData = () => {
    return characteristicsEmptyFormData();
};

export const getCharacteristicsFormData = ({
    maxSusceptance,
    maxQAtNominalV,
    shuntCompensatorType,
    sectionCount,
    maximumSectionCount,
}) => {
    return {
        [CHARACTERISTICS_CHOICE]: maxSusceptance
            ? CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
            : CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [MAX_SUSCEPTANCE]: maxSusceptance,
        [SHUNT_COMPENSATOR_TYPE]: shuntCompensatorType,
        [MAX_Q_AT_NOMINAL_V]: maxQAtNominalV,
        [SECTION_COUNT]: sectionCount,
        [MAXIMUM_SECTION_COUNT]: maximumSectionCount,
        [SWITCHED_ON_Q_AT_NOMINAL_V]: maxQAtNominalV
            ? computeSwitchedOnValue(sectionCount, maximumSectionCount, maxQAtNominalV)
            : null,
        [SWITCHED_ON_SUSCEPTANCE]: maxSusceptance
            ? computeSwitchedOnValue(sectionCount, maximumSectionCount, maxSusceptance)
            : null,
    };
};

export const getCharacteristicsCreateFormDataFromSearchCopy = ({
    bperSection,
    qAtNominalV,
    sectionCount,
    maximumSectionCount,
}) => {
    return {
        [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [MAX_SUSCEPTANCE]: bperSection * maximumSectionCount,
        [SHUNT_COMPENSATOR_TYPE]:
            bperSection > 0 ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id : SHUNT_COMPENSATOR_TYPES.REACTOR.id,
        [MAX_Q_AT_NOMINAL_V]: qAtNominalV * maximumSectionCount,
        [SECTION_COUNT]: sectionCount,
        [MAXIMUM_SECTION_COUNT]: maximumSectionCount,
    };
};
