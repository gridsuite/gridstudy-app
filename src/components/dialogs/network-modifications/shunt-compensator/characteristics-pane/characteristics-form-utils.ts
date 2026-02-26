/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    SWITCHED_ON_Q_AT_NOMINAL_V,
    SWITCHED_ON_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { computeSwitchedOnValue } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { SHUNT_COMPENSATOR_TYPES } from '../../../../network/constants';

export const getCharacteristicsFormValidationSchema = (isModification: boolean) => {
    const baseSchema = {
        [CHARACTERISTICS_CHOICE]: yup.string().required(),
        [SHUNT_COMPENSATOR_TYPE]: yup
            .string()
            .nullable()
            .default(null)
            .when([CHARACTERISTICS_CHOICE], {
                is: (choice: string) => choice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && !isModification,
                then: (schema) =>
                    schema.oneOf([SHUNT_COMPENSATOR_TYPES.CAPACITOR.id, SHUNT_COMPENSATOR_TYPES.REACTOR.id]).required(),
            }),
    };
    const additionalSchema = isModification
        ? getCharacteristicsModificationFormValidationSchema()
        : getCharacteristicsCreateFormValidationSchema();

    return {
        ...baseSchema,
        ...additionalSchema,
    };
};

const getCharacteristicsCreateFormValidationSchema = () => {
    return {
        [MAX_Q_AT_NOMINAL_V]: yup
            .number()
            .nullable()
            .default(null)
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice: string) =>
                    characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
                then: (schema) => schema.min(0, 'ShuntCompensatorErrorQAtNominalVoltageLessThanZero').required(),
            }),
        [MAX_SUSCEPTANCE]: yup
            .number()
            .nullable()
            .default(null)
            .when([CHARACTERISTICS_CHOICE], {
                is: (characteristicsChoice: string) => characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
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
        [MAX_Q_AT_NOMINAL_V]: yup
            .number()
            .min(0, 'ShuntCompensatorErrorQAtNominalVoltageLessThanZero')
            .nullable()
            .default(null),
        [MAX_SUSCEPTANCE]: yup.number().nullable().default(null),
        [MAXIMUM_SECTION_COUNT]: yup
            .number()
            .min(1, 'MaximumSectionCountMustBeGreaterOrEqualToOne')
            .nullable()
            .default(null),
        [SECTION_COUNT]: yup
            .number()
            .min(0, 'SectionCountMustBeBetweenZeroAndMaximumSectionCount')
            .nullable()
            .default(null),
        [SWITCHED_ON_Q_AT_NOMINAL_V]: yup.number().nullable(),
        [SWITCHED_ON_SUSCEPTANCE]: yup.number().nullable(),
    };
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
}: {
    maxSusceptance: number | null;
    maxQAtNominalV: number | null;
    shuntCompensatorType?: string | null;
    sectionCount?: number | null;
    maximumSectionCount?: number | null;
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
        [SWITCHED_ON_Q_AT_NOMINAL_V]:
            maxQAtNominalV && sectionCount && maximumSectionCount
                ? computeSwitchedOnValue(sectionCount, maximumSectionCount, maxQAtNominalV)
                : null,
        [SWITCHED_ON_SUSCEPTANCE]:
            maxSusceptance && sectionCount && maximumSectionCount
                ? computeSwitchedOnValue(sectionCount, maximumSectionCount, maxSusceptance)
                : null,
    };
};

export const getCharacteristicsCreateFormDataFromSearchCopy = ({
    bPerSection,
    qAtNominalV,
    sectionCount,
    maximumSectionCount,
}: {
    bPerSection: number | null;
    qAtNominalV: number | null;
    sectionCount: number | null;
    maximumSectionCount: number | null;
}) => {
    return {
        [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [MAX_SUSCEPTANCE]: bPerSection && maximumSectionCount && bPerSection * maximumSectionCount,
        [SHUNT_COMPENSATOR_TYPE]:
            bPerSection && bPerSection > 0 ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id : SHUNT_COMPENSATOR_TYPES.REACTOR.id,
        [MAX_Q_AT_NOMINAL_V]: qAtNominalV && maximumSectionCount && qAtNominalV * maximumSectionCount,
        [SECTION_COUNT]: sectionCount,
        [MAXIMUM_SECTION_COUNT]: maximumSectionCount,
    };
};
