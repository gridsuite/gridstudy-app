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
    OPERATIONAL_LIMITS_GROUPS_1,
    OPERATIONAL_LIMITS_GROUPS_2,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { areArrayElementsUnique, formatTemporaryLimits } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { isNodeBuilt } from '../../graph/util/model-functions';

const limitsGroupValidationSchema = () => ({
    [ID]: yup.string().nonNullable().required(),
    [CURRENT_LIMITS]: yup.object().shape(currentLimitsValidationSchema()),
});

const temporaryLimitsValidationSchema = () => {
    return yup.object().shape({
        [TEMPORARY_LIMIT_DURATION]: yup.number().nullable().min(0),
        [TEMPORARY_LIMIT_VALUE]: yup.number().nullable().positive(),
        [TEMPORARY_LIMIT_NAME]: yup
            .string()
            .nullable()
            .when([TEMPORARY_LIMIT_VALUE, TEMPORARY_LIMIT_DURATION], {
                is: (limitValue, limitDuration) => limitValue || limitDuration,
                then: () => yup.string().nullable().required(),
            }),
    });
};

const currentLimitsValidationSchema = () => ({
    [PERMANENT_LIMIT]: yup.number().nullable().positive('permanentCurrentLimitMustBeGreaterThanZero'),
    [TEMPORARY_LIMITS]: yup
        .array()
        .of(temporaryLimitsValidationSchema())
        .test('distinctNames', 'TemporaryLimitNameUnicityError', (array) => {
            const namesArray = array
                .filter((l) => !!l[TEMPORARY_LIMIT_NAME])
                .map((l) => sanitizeString(l[TEMPORARY_LIMIT_NAME]));
            return areArrayElementsUnique(namesArray);
        })
        .test('distinctDurations', 'TemporaryLimitDurationUnicityError', (array) => {
            const durationsArray = array.map((l) => l[TEMPORARY_LIMIT_DURATION]).filter((d) => d); // empty lines are ignored
            return areArrayElementsUnique(durationsArray);
        }),
});

const limitsValidationSchema = (id, onlySelectedLimits) => {
    const currentLimitsSchema = {
        [CURRENT_LIMITS_1]: yup.object().shape(currentLimitsValidationSchema()),
        [CURRENT_LIMITS_2]: yup.object().shape(currentLimitsValidationSchema()),
    };

    const limitsGroupSchema = {
        [OPERATIONAL_LIMITS_GROUPS_1]: yup
            .array(yup.object().shape(limitsGroupValidationSchema()))
            .test('distinctNames', 'LimitSetCreationDuplicateError', (array) => {
                const namesArray = array.filter((o) => !!o[ID]).map((o) => sanitizeString(o[ID]));
                return areArrayElementsUnique(namesArray);
            }),
        [OPERATIONAL_LIMITS_GROUPS_2]: yup
            .array(yup.object().shape(limitsGroupValidationSchema()))
            .test('distinctNames', 'LimitSetCreationDuplicateError', (array) => {
                const namesArray = array.filter((o) => !!o[ID]).map((o) => sanitizeString(o[ID]));
                return areArrayElementsUnique(namesArray);
            }),
        [SELECTED_LIMITS_GROUP_1]: yup.string().nullable(),
        [SELECTED_LIMITS_GROUP_2]: yup.string().nullable(),
    };
    return { [id]: yup.object().shape(onlySelectedLimits ? currentLimitsSchema : limitsGroupSchema) };
};

export const getLimitsValidationSchema = (onlySelectedLimits = true, id = LIMITS) => {
    return limitsValidationSchema(id, onlySelectedLimits);
};

const limitsEmptyFormData = (id, onlySelectedLimits = true) => {
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
        [OPERATIONAL_LIMITS_GROUPS_1]: [],
        [OPERATIONAL_LIMITS_GROUPS_2]: [],
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
    {
        operationalLimitsGroups1 = [],
        operationalLimitsGroups2 = [],
        selectedOperationalLimitsGroup1 = null,
        selectedOperationalLimitsGroup2 = null,
    },
    id = LIMITS
) => {
    return {
        [id]: {
            [OPERATIONAL_LIMITS_GROUPS_1]: operationalLimitsGroups1,
            [OPERATIONAL_LIMITS_GROUPS_2]: operationalLimitsGroups2,
            [SELECTED_LIMITS_GROUP_1]: selectedOperationalLimitsGroup1,
            [SELECTED_LIMITS_GROUP_2]: selectedOperationalLimitsGroup2,
        },
    };
};

/**
 * sanitizes limit names and filters out the empty temporary limits lines
 */
export const sanitizeLimitsGroups = (limitsGroups /*: OperationalLimitsGroup[]*/) =>
    limitsGroups.map(({ currentLimits, ...baseData }) => ({
        ...baseData,
        currentLimits: {
            permanentLimit: currentLimits.permanentLimit,
            temporaryLimits: currentLimits.temporaryLimits
                // completely empty lines should be filtered out (the interface always displays some lines even if empty)
                .filter(({ name }) => name?.trim())
                .map(({ name, ...temporaryLimit }) => ({
                    ...temporaryLimit,
                    name: sanitizeString(name),
                })),
        },
    }));

export const sanitizeLimitNames = (temporaryLimitList /*:TemporaryLimitData[]*/) /*:TemporaryLimitData[]*/ =>
    temporaryLimitList
        ?.filter((limit) => limit?.name?.trim())
        .map(({ name, ...temporaryLimit }) => ({
            ...temporaryLimit,
            name: sanitizeString(name),
        })) || [];

const findTemporaryLimit = (temporaryLimits, limit) =>
    temporaryLimits?.find((l) => l.name === limit.name && l.acceptableDuration === limit.acceptableDuration);

export const updateTemporaryLimits = (modifiedTemporaryLimits, temporaryLimitsToModify) => {
    let updatedTemporaryLimits = modifiedTemporaryLimits ?? [];
    //add temporary limits from previous modifications
    temporaryLimitsToModify?.forEach((limit) => {
        if (findTemporaryLimit(updatedTemporaryLimits, limit) === undefined) {
            updatedTemporaryLimits?.push({
                ...limit,
            });
        }
    });

    //remove deleted temporary limits from current and previous modifications
    updatedTemporaryLimits = updatedTemporaryLimits?.filter(
        (limit) =>
            limit.modificationType !== TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETED &&
            !(
                (limit.modificationType === null ||
                    limit.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED) &&
                findTemporaryLimit(temporaryLimitsToModify, limit) === undefined
            )
    );

    //update temporary limits values
    updatedTemporaryLimits?.forEach((limit) => {
        if (limit.modificationType === null) {
            limit.value = findTemporaryLimit(temporaryLimitsToModify, limit)?.value;
        }
    });
    return updatedTemporaryLimits;
};

export const addModificationTypeToTemporaryLimits = (
    temporaryLimits,
    temporaryLimitsToModify,
    currentModifiedTemporaryLimits,
    currentNode
) => {
    const formattedTemporaryLimitsToModify = formatTemporaryLimits(temporaryLimitsToModify);
    const formattedCurrentModifiedTemporaryLimits = formatTemporaryLimits(currentModifiedTemporaryLimits);
    const updatedTemporaryLimits = temporaryLimits.map((limit) => {
        const limitWithSameName = findTemporaryLimit(formattedTemporaryLimitsToModify, limit);
        if (limitWithSameName) {
            const currentLimitWithSameName = findTemporaryLimit(
                formattedCurrentModifiedTemporaryLimits,
                limitWithSameName
            );
            if (
                (currentLimitWithSameName?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED &&
                    isNodeBuilt(currentNode)) ||
                currentLimitWithSameName?.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
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
                          modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED,
                      };
            }
        } else {
            return {
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED,
            };
        }
    });
    //add deleted limits
    formattedTemporaryLimitsToModify?.forEach((limit) => {
        if (!findTemporaryLimit(temporaryLimits, limit)) {
            updatedTemporaryLimits.push({
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETED,
            });
        }
    });
    //add previously deleted limits
    formattedCurrentModifiedTemporaryLimits?.forEach((limit) => {
        if (
            !findTemporaryLimit(updatedTemporaryLimits, limit) &&
            limit.modificationType === TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETED
        ) {
            updatedTemporaryLimits.push({
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETED,
            });
        }
    });
    return updatedTemporaryLimits;
};

// temporary function to be removed once the migration from selected limits group to complete limits group is over :
// necessary because the network map server return complete operational limits groups but the modification only uses the currently selected (for now)
export const completeCurrentLimitsGroupsToOnlySelected = (
    completeLimitsGroups /*: OperationalLimitsGroup[]*/,
    selectedOperationalLimitsGroup /*: string*/
) => {
    if (selectedOperationalLimitsGroup && completeLimitsGroups) {
        return completeLimitsGroups.find((limitsGroup) => selectedOperationalLimitsGroup === limitsGroup.id);
    }
    return getLimitsEmptyFormData();
};
