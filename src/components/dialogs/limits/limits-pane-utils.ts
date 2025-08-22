/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sanitizeString } from '../dialog-utils';
import {
    CURRENT_LIMITS,
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    ID,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
    APPLICABIlITY,
    NAME,
} from 'components/utils/field-constants';
import { areArrayElementsUnique, formatTemporaryLimits } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { isNodeBuilt } from '../../graph/util/model-functions';
import { OperationalLimitsGroup, TemporaryLimit } from '../../../services/network-modification-types';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import { areOperationalLimitsGroupUnique, OperationalLimitsId } from './limits-utils';

const limitsGroupValidationSchema = (isModification: boolean) => ({
    [ID]: yup.string().nonNullable().required(),
    [NAME]: yup.string().nonNullable().required(),
    [APPLICABIlITY]: yup.string().nonNullable().required(),
    [CURRENT_LIMITS]: yup.object().shape(currentLimitsValidationSchema(isModification)),
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

const currentLimitsValidationSchema = (isModification = false) => ({
    [PERMANENT_LIMIT]: yup
        .number()
        .nullable()
        .positive('permanentCurrentLimitMustBeGreaterThanZero')
        // if there are valid (named) temporary limits, permanent limit is mandatory
        .when([TEMPORARY_LIMITS], {
            is: (temporaryLimits: TemporaryLimit[]) =>
                temporaryLimits?.length > 0 && temporaryLimits.find((limit) => limit.name) && !isModification,
            then: () =>
                yup
                    .number()
                    .required('permanentCurrentLimitMandatory')
                    .positive('permanentCurrentLimitMustBeGreaterThanZero'),
        }),
    [TEMPORARY_LIMITS]: yup
        .array()
        .of(temporaryLimitsValidationSchema())
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

const limitsValidationSchema = (id: string) => {
    const selectedCurrentLimitsSchema = {
        [CURRENT_LIMITS_1]: yup.object().shape(currentLimitsValidationSchema(true)),
        [CURRENT_LIMITS_2]: yup.object().shape(currentLimitsValidationSchema(true)),
    };
    return { [id]: yup.object().shape(selectedCurrentLimitsSchema) };
};

const limitsValidationSchemaCreation = (id: string) => {
    const completeLimitsGroupSchema = {
        [OPERATIONAL_LIMITS_GROUPS]: yup
            .array(yup.object().shape(limitsGroupValidationSchema(false)))
            .test('distinctNames', 'LimitSetApplicabilityError', (array) => {
                const namesArray: OperationalLimitsId[] = !array
                    ? []
                    : array
                          .filter((o) => !!sanitizeString(o[NAME]))
                          .map((o) => {
                              return { name: sanitizeString(o.name) ?? '', applicability: o.applicability };
                          });
                return areOperationalLimitsGroupUnique(namesArray);
            }),
        [SELECTED_LIMITS_GROUP_1]: yup.string().nullable(),
        [SELECTED_LIMITS_GROUP_2]: yup.string().nullable(),
    };
    return { [id]: yup.object().shape(completeLimitsGroupSchema) };
};

export const getLimitsValidationSchema = (isModification: boolean = false, id: string = LIMITS) => {
    return isModification ? limitsValidationSchema(id) : limitsValidationSchemaCreation(id);
};

const limitsEmptyFormData = (id: string, onlySelectedLimits = true) => {
    const currentLimits = {
        [CURRENT_LIMITS_1]: {
            [PERMANENT_LIMIT]: null,
            [TEMPORARY_LIMITS]: [],
        },
        [CURRENT_LIMITS_2]: {
            [PERMANENT_LIMIT]: null,
            [TEMPORARY_LIMITS]: [],
        },
    };
    const limitsGroup = {
        [OPERATIONAL_LIMITS_GROUPS]: [],
        [SELECTED_LIMITS_GROUP_1]: null,
        [SELECTED_LIMITS_GROUP_2]: null,
    };

    return { [id]: onlySelectedLimits ? currentLimits : limitsGroup };
};

export const getLimitsEmptyFormData = (onlySelectedLimits = true, id = LIMITS) => {
    return limitsEmptyFormData(id, onlySelectedLimits);
};

/**
 * used when the limit set data only contain the selected limit sets
 */
export const getSelectedLimitsFormData = (
    { permanentLimit1 = null, permanentLimit2 = null, temporaryLimits1 = [], temporaryLimits2 = [] },
    id = LIMITS
) => ({
    [id]: {
        [CURRENT_LIMITS_1]: {
            [PERMANENT_LIMIT]: permanentLimit1,
            [TEMPORARY_LIMITS]: temporaryLimits1,
        },
        [CURRENT_LIMITS_2]: {
            [PERMANENT_LIMIT]: permanentLimit2,
            [TEMPORARY_LIMITS]: temporaryLimits2,
        },
    },
});

/**
 * used when the limit set data contain all the limit sets data, including the not selected
 */
export const getAllLimitsFormData = (
    { operationalLimitsGroups = [], selectedOperationalLimitsGroup1 = null, selectedOperationalLimitsGroup2 = null },
    id = LIMITS
) => {
    return {
        [id]: {
            [OPERATIONAL_LIMITS_GROUPS]: operationalLimitsGroups,
            [SELECTED_LIMITS_GROUP_1]: selectedOperationalLimitsGroup1,
            [SELECTED_LIMITS_GROUP_2]: selectedOperationalLimitsGroup2,
        },
    };
};

/**
 * sanitizes limit names and filters out the empty temporary limits lines
 */
export const sanitizeLimitsGroups = (limitsGroups: OperationalLimitsGroup[]) =>
    limitsGroups.map(({ currentLimits, ...baseData }) => ({
        ...baseData,
        id: baseData.name,
        currentLimits: !currentLimits
            ? null
            : {
                  permanentLimit: currentLimits.permanentLimit,
                  temporaryLimits: !currentLimits.temporaryLimits
                      ? []
                      : currentLimits.temporaryLimits
                            // completely empty lines should be filtered out (the interface always displays some lines even if empty)
                            .filter(({ name }) => name?.trim())
                            .map(({ name, ...temporaryLimit }) => ({
                                ...temporaryLimit,
                                name: sanitizeString(name),
                            })),
              },
    }));

export const sanitizeLimitNames = (temporaryLimitList: TemporaryLimit[]): TemporaryLimit[] =>
    temporaryLimitList
        ?.filter((limit: TemporaryLimit) => limit?.name?.trim())
        .map(({ name, ...temporaryLimit }) => ({
            ...temporaryLimit,
            name: sanitizeString(name) ?? '',
        })) || [];

const findTemporaryLimit = (temporaryLimits: TemporaryLimit[], limit: TemporaryLimit) =>
    temporaryLimits?.find((l) => l.name === limit.name && l.acceptableDuration === limit.acceptableDuration);

export const updateTemporaryLimits = (
    modifiedTemporaryLimits: TemporaryLimit[],
    temporaryLimitsToModify: TemporaryLimit[]
) => {
    let updatedTemporaryLimits = modifiedTemporaryLimits ?? [];
    //add temporary limits from previous modifications
    temporaryLimitsToModify?.forEach((limit: TemporaryLimit) => {
        if (findTemporaryLimit(updatedTemporaryLimits, limit) === undefined) {
            updatedTemporaryLimits?.push({
                ...limit,
            });
        }
    });

    //remove deleted temporary limits from current and previous modifications
    updatedTemporaryLimits = updatedTemporaryLimits?.filter(
        (limit: TemporaryLimit) =>
            limit.modificationType !== TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE &&
            !(
                (limit.modificationType === null ||
                    limit.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY) &&
                findTemporaryLimit(temporaryLimitsToModify, limit) === undefined
            )
    );

    //update temporary limits values
    updatedTemporaryLimits?.forEach((limit: TemporaryLimit) => {
        if (limit.modificationType === null) {
            limit.value = findTemporaryLimit(temporaryLimitsToModify, limit)?.value ?? null;
        }
    });
    return updatedTemporaryLimits;
};

export const addModificationTypeToTemporaryLimits = (
    temporaryLimits: TemporaryLimit[],
    temporaryLimitsToModify: TemporaryLimit[],
    currentModifiedTemporaryLimits: TemporaryLimit[],
    currentNode: CurrentTreeNode
) => {
    const formattedTemporaryLimitsToModify = formatTemporaryLimits(temporaryLimitsToModify);
    const formattedCurrentModifiedTemporaryLimits = formatTemporaryLimits(currentModifiedTemporaryLimits);
    const updatedTemporaryLimits: TemporaryLimit[] = temporaryLimits.map((limit) => {
        const limitWithSameName = findTemporaryLimit(formattedTemporaryLimitsToModify, limit);
        if (limitWithSameName) {
            const currentLimitWithSameName: TemporaryLimit | undefined = findTemporaryLimit(
                formattedCurrentModifiedTemporaryLimits,
                limitWithSameName
            );
            if (
                (currentLimitWithSameName?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY &&
                    isNodeBuilt(currentNode)) ||
                currentLimitWithSameName?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADD
            ) {
                return {
                    ...limit,
                    modificationType: currentLimitWithSameName.modificationType,
                };
            } else {
                return limitWithSameName.value === limit.value
                    ? {
                          ...limit,
                          modificationType: null,
                      }
                    : {
                          ...limit,
                          modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY,
                      };
            }
        } else {
            return {
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.ADD,
            };
        }
    });
    //add deleted limits
    formattedTemporaryLimitsToModify?.forEach((limit) => {
        if (!findTemporaryLimit(temporaryLimits, limit)) {
            updatedTemporaryLimits.push({
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE,
            });
        }
    });
    //add previously deleted limits
    formattedCurrentModifiedTemporaryLimits?.forEach((limit) => {
        if (
            !findTemporaryLimit(updatedTemporaryLimits, limit) &&
            limit.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE
        ) {
            updatedTemporaryLimits.push({
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE,
            });
        }
    });
    return updatedTemporaryLimits;
};

// temporary function to be removed once the migration from selected limits group to complete limits group is over :
// necessary because the network map server return complete operational limits groups but the modification only uses the currently selected (for now)
export const completeCurrentLimitsGroupsToOnlySelected = (
    completeLimitsGroups: OperationalLimitsGroup[],
    selectedOperationalLimitsGroup: string
) => {
    if (selectedOperationalLimitsGroup && completeLimitsGroups) {
        return completeLimitsGroups.find((limitsGroup) => selectedOperationalLimitsGroup === limitsGroup.id);
    }
    return getLimitsEmptyFormData();
};
