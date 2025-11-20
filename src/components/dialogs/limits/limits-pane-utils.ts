/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sanitizeString } from '../dialog-utils';
import {
    APPLICABILITY_FIELD,
    CURRENT_LIMITS,
    ENABLE_OLG_MODIFICATION,
    ID,
    LIMIT_SETS_MODIFICATION_TYPE,
    LIMITS,
    LIMITS_PROPERTIES,
    NAME,
    OLG_IS_DUPLICATE,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
    VALUE,
} from 'components/utils/field-constants';
import {
    areArrayElementsUnique,
    formatMapInfosToTemporaryLimitsFormSchema,
    formatToTemporaryLimitsFormSchema,
    toModificationOperation,
} from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import {
    AttributeModification,
    CurrentLimits,
    OperationalLimitsGroup,
    OperationType,
    TemporaryLimit,
} from '../../../services/network-modification-types';
import { CurrentLimitsData } from '../../../services/study/network-map.type';
import { LineModificationFormInfos } from '../network-modifications/line/modification/line-modification-type';
import { OperationalLimitsGroupFormSchema, TemporaryLimitFormSchema } from './operational-limits-groups-types';
import { TestContext } from 'yup';
import { APPLICABILITY } from 'components/network/constants';

const limitsGroupValidationSchema = () => ({
    [ID]: yup.string().nonNullable().required(),
    [NAME]: yup.string().nonNullable().required(),
    [APPLICABILITY_FIELD]: yup.string().nonNullable().required(),
    [OLG_IS_DUPLICATE]: yup.boolean().nullable().test('testDistincts', 'LimitSetApplicabilityError', hasDuplicate),
    [CURRENT_LIMITS]: yup.object().shape(currentLimitsValidationSchema()),
    [LIMITS_PROPERTIES]: yup.array().of(limitsPropertyValidationSchema()),
});

const temporaryLimitsValidationSchema = () => {
    return yup.object().shape({
        [TEMPORARY_LIMIT_DURATION]: yup.number().nullable().min(0),
        [TEMPORARY_LIMIT_VALUE]: yup.number().nullable().positive(),
        [TEMPORARY_LIMIT_NAME]: yup
            .string()
            .nullable()
            .when([TEMPORARY_LIMIT_VALUE, TEMPORARY_LIMIT_DURATION], {
                is: (limitValue: number | null, limitDuration: number | null) => limitValue || limitDuration,
                then: () => yup.string().nullable().required(),
            }),
    });
};
const limitsPropertyValidationSchema = () => {
    return yup.object().shape({
        [NAME]: yup.string().required(),
        [VALUE]: yup.string().required(),
    });
};

const currentLimitsValidationSchema = () => ({
    [PERMANENT_LIMIT]: yup.number().positive('permanentCurrentLimitMustBeGreaterThanZero').required(),
    [TEMPORARY_LIMITS]: yup
        .array()
        .of(temporaryLimitsValidationSchema())
        .required()
        .test('distinctNames', 'TemporaryLimitNameUnicityError', (array) => {
            const namesArray = !array
                ? []
                : array.filter((l) => !!l[TEMPORARY_LIMIT_NAME]).map((l) => sanitizeString(l[TEMPORARY_LIMIT_NAME]));
            return areArrayElementsUnique(namesArray);
        })
        .test('distinctDurations', 'TemporaryLimitDurationUnicityError', (array) => {
            const durationsArray = !array ? [] : array.map((l) => l[TEMPORARY_LIMIT_DURATION]).filter((d) => d); // empty lines are ignored
            return areArrayElementsUnique(durationsArray);
        }),
});

interface OperationalLimitsGroupFormSchemaWithPath extends OperationalLimitsGroupFormSchema {
    path: string;
}

function hasDuplicate(field: boolean | null | undefined, context: TestContext) {
    return hasDuplicateOperationalLimitsGroups(context);
}

function hasDuplicateOperationalLimitsGroups(context: TestContext) {
    const limitsGroup: OperationalLimitsGroupFormSchema = context.parent;
    const operationalLimitsGroups: OperationalLimitsGroupFormSchema[] =
        context.from?.[1]?.value?.[OPERATIONAL_LIMITS_GROUPS];
    const operationalLimitsGroupsWithPath: OperationalLimitsGroupFormSchemaWithPath[] = operationalLimitsGroups.map(
        (item, index) => {
            return { ...item, path: `${LIMITS}.${OPERATIONAL_LIMITS_GROUPS}[${index}]` };
        }
    );

    const limitsGroupName = sanitizeString(limitsGroup[NAME]);
    const filtered = operationalLimitsGroupsWithPath.filter(
        (item: OperationalLimitsGroupFormSchemaWithPath) => sanitizeString(item[NAME]) === limitsGroupName
    );

    if (filtered.length <= 1) {
        return true;
    }

    const applicabilityEquipment: number = filtered.filter(
        (item) => item[APPLICABILITY_FIELD] === APPLICABILITY.EQUIPMENT.id
    ).length;
    const applicabilitySide1: number = filtered.filter(
        (item) => item[APPLICABILITY_FIELD] === APPLICABILITY.SIDE1.id
    ).length;

    const isDuplicate =
        filtered.length > 2 || applicabilityEquipment > 0 || applicabilitySide1 === 0 || applicabilitySide1 > 1;

    return !isDuplicate;
}

const limitsValidationSchemaCreation = (id: string) => {
    const completeLimitsGroupSchema = {
        [OPERATIONAL_LIMITS_GROUPS]: yup.array(yup.object().shape(limitsGroupValidationSchema())).required(),
        [SELECTED_LIMITS_GROUP_1]: yup.string().nullable(),
        [SELECTED_LIMITS_GROUP_2]: yup.string().nullable(),
        [ENABLE_OLG_MODIFICATION]: yup.boolean(),
    };
    return { [id]: yup.object().shape(completeLimitsGroupSchema) };
};

export const getLimitsValidationSchema = (id: string = LIMITS) => {
    return limitsValidationSchemaCreation(id);
};

const limitsEmptyFormData = (isModification: boolean, id: string) => {
    const limitsGroup = {
        [OPERATIONAL_LIMITS_GROUPS]: [],
        [SELECTED_LIMITS_GROUP_1]: null,
        [SELECTED_LIMITS_GROUP_2]: null,
        [ENABLE_OLG_MODIFICATION]: !isModification,
    };

    return { [id]: limitsGroup };
};

export const getLimitsEmptyFormData = (isModification = true, id = LIMITS) => {
    return limitsEmptyFormData(isModification, id);
};

export const formatOpLimitGroupsToFormInfos = (
    limitGroups: OperationalLimitsGroup[]
): OperationalLimitsGroupFormSchema[] => {
    if (!limitGroups) {
        return [];
    }

    return limitGroups
        .filter(
            (opLimitGroup: OperationalLimitsGroup) =>
                opLimitGroup.modificationType !== LIMIT_SETS_MODIFICATION_TYPE.DELETE
        )
        .map((opLimitGroup: OperationalLimitsGroup) => {
            return {
                id: opLimitGroup.id + opLimitGroup.applicability,
                name: opLimitGroup.id,
                applicability: opLimitGroup.applicability,
                limitsProperties: opLimitGroup.limitsProperties,
                currentLimits: {
                    permanentLimit: opLimitGroup.currentLimits.permanentLimit,
                    temporaryLimits: formatToTemporaryLimitsFormSchema(opLimitGroup.currentLimits.temporaryLimits),
                },
            };
        });
};

export const getAllLimitsFormData = (
    operationalLimitsGroups: OperationalLimitsGroupFormSchema[] = [],
    selectedOperationalLimitsGroup1: string | null = null,
    selectedOperationalLimitsGroup2: string | null = null,
    enableOLGModification: boolean | null = true,
    id = LIMITS
) => {
    return {
        [id]: {
            [OPERATIONAL_LIMITS_GROUPS]: operationalLimitsGroups,
            [SELECTED_LIMITS_GROUP_1]: selectedOperationalLimitsGroup1,
            [SELECTED_LIMITS_GROUP_2]: selectedOperationalLimitsGroup2,
            [ENABLE_OLG_MODIFICATION]: !!enableOLGModification,
        },
    };
};

/**
 * sanitizes limit names and filters out the empty temporary limits lines
 */
export const sanitizeLimitsGroups = (
    limitsGroups: OperationalLimitsGroupFormSchema[]
): OperationalLimitsGroupFormSchema[] =>
    limitsGroups.map(({ currentLimits, ...baseData }) => ({
        ...baseData,
        id: baseData.name,
        currentLimits: !currentLimits
            ? {
                  id: '',
                  permanentLimit: null,
                  temporaryLimits: [],
              }
            : {
                  permanentLimit: currentLimits.permanentLimit,
                  temporaryLimits: !currentLimits.temporaryLimits
                      ? []
                      : currentLimits.temporaryLimits
                            // completely empty lines should be filtered out (the interface always displays some lines even if empty)
                            .filter(({ name }) => name?.trim())
                            .map(({ name, ...temporaryLimit }) => ({
                                ...temporaryLimit,
                                name: sanitizeString(name) ?? '',
                            })),
              },
    }));

export const sanitizeLimitNames = (temporaryLimitList: TemporaryLimitFormSchema[]): TemporaryLimitFormSchema[] =>
    temporaryLimitList
        ?.filter((limit: TemporaryLimitFormSchema) => limit?.name?.trim())
        .map(({ name, ...temporaryLimit }) => ({
            ...temporaryLimit,
            name: sanitizeString(name) ?? '',
        })) || [];

const findTemporaryLimitForm = (temporaryLimits: TemporaryLimitFormSchema[], limit: TemporaryLimit) =>
    temporaryLimits?.find(
        (l: TemporaryLimitFormSchema) => l.name === limit.name && l.acceptableDuration === limit.acceptableDuration
    );

export const updateTemporaryLimits = (
    temporaryLimitsForm: TemporaryLimitFormSchema[],
    temporaryLimitsToModify: TemporaryLimit[] // from map server
) => {
    let updatedTemporaryLimits = temporaryLimitsForm ?? [];
    //add temporary limits from map server that are not in the form values
    temporaryLimitsToModify?.forEach((limit: TemporaryLimit) => {
        if (findTemporaryLimitForm(updatedTemporaryLimits, limit) === undefined) {
            updatedTemporaryLimits?.push(temporaryLimitToTemporaryLimitFormSchema(limit));
        }
    });

    return updatedTemporaryLimits;
};

export const mapServerLimitsGroupsToFormInfos = (currentLimits: CurrentLimitsData[]) => {
    return currentLimits?.map((currentLimit: CurrentLimitsData) => {
        return {
            id: currentLimit.id + currentLimit.applicability,
            name: currentLimit.id,
            applicability: currentLimit.applicability,
            limitsProperties: currentLimit.limitsProperties,
            currentLimits: {
                id: currentLimit.id,
                permanentLimit: currentLimit.permanentLimit,
                temporaryLimits: formatMapInfosToTemporaryLimitsFormSchema(currentLimit.temporaryLimits),
            },
        };
    });
};

export const convertToOperationalLimitsGroupFormSchema = (
    currentLimits: CurrentLimitsData[]
): OperationalLimitsGroupFormSchema[] => {
    let updatedOpLG: OperationalLimitsGroupFormSchema[] = [];

    for (const currentLimit of currentLimits) {
        const equivalentFromNetMod = updatedOpLG.find(
            (opLG: OperationalLimitsGroupFormSchema) =>
                currentLimit.id === opLG.name && currentLimit.applicability === opLG[APPLICABILITY_FIELD]
        );
        if (equivalentFromNetMod === undefined) {
            updatedOpLG.push({
                id: currentLimit.id + currentLimit.applicability,
                name: currentLimit.id,
                applicability: currentLimit.applicability,
                limitsProperties: currentLimit.limitsProperties,
                currentLimits: {
                    permanentLimit: currentLimit.permanentLimit,
                    temporaryLimits: formatMapInfosToTemporaryLimitsFormSchema(currentLimit.temporaryLimits),
                },
            });
        }
    }

    return updatedOpLG;
};

export const getOpLimitsGroupInfosFromBranchModification = (
    formBranchModification: LineModificationFormInfos
): OperationalLimitsGroupFormSchema[] => {
    return formBranchModification?.limits?.operationalLimitsGroups ?? [];
};
export const addModificationTypeToTemporaryLimits = (
    formTemporaryLimits: TemporaryLimitFormSchema[]
): TemporaryLimit[] => {
    return formTemporaryLimits.map((limit: TemporaryLimitFormSchema) => {
        return {
            name: limit?.name ?? '',
            acceptableDuration: limit?.acceptableDuration ?? null,
            value: limit?.value ?? null,
            modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY_OR_ADD,
        };
    });
};

export function addOperationTypeToSelectedOpLG(
    selectedOpLG: string | null | undefined,
    noSelectionString: string
): AttributeModification<string> | null {
    return selectedOpLG === noSelectionString
        ? {
              value: selectedOpLG,
              op: OperationType.UNSET,
          }
        : toModificationOperation(selectedOpLG);
}

/**
 * converts the limits groups into a modification limits group
 * ie mostly add the ADD, MODIFY, MODIFY_OR_ADD, DELETE and REPLACE tags to the data using a delta between the form and the network values
 * note : for now only MODIFY_OR_ADD is handled, the others have been disabled for various reasons
 *
 * @param limitsGroupsForm current data from the form
 */
export const addModificationTypeToOpLimitsGroups = (
    limitsGroupsForm: OperationalLimitsGroupFormSchema[]
): OperationalLimitsGroup[] => {
    let modificationLimitsGroupsForm: OperationalLimitsGroupFormSchema[] = sanitizeLimitsGroups(limitsGroupsForm);

    return modificationLimitsGroupsForm.map((limitsGroupForm: OperationalLimitsGroupFormSchema) => {
        const temporaryLimits: TemporaryLimit[] = addModificationTypeToTemporaryLimits(
            sanitizeLimitNames(limitsGroupForm[CURRENT_LIMITS]?.[TEMPORARY_LIMITS])
        );
        const currentLimits: CurrentLimits = {
            permanentLimit: limitsGroupForm[CURRENT_LIMITS]?.[PERMANENT_LIMIT] ?? null,
            temporaryLimits: temporaryLimits ?? [],
        };

        return {
            id: limitsGroupForm.id,
            name: limitsGroupForm.name,
            applicability: limitsGroupForm.applicability,
            limitsProperties: limitsGroupForm.limitsProperties,
            currentLimits: currentLimits,
            modificationType: LIMIT_SETS_MODIFICATION_TYPE.MODIFY_OR_ADD,
            temporaryLimitsModificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.REPLACE,
        };
    });
};

export const temporaryLimitToTemporaryLimitFormSchema = (temporaryLimit: TemporaryLimit): TemporaryLimitFormSchema => {
    return {
        [TEMPORARY_LIMIT_NAME]: temporaryLimit.name,
        [TEMPORARY_LIMIT_DURATION]: temporaryLimit.acceptableDuration,
        [TEMPORARY_LIMIT_VALUE]: temporaryLimit.value,
    };
};
