/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sanitizeString } from '../dialog-utils';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    ID,
    LIMITS,
    PERMANENT_LIMIT,
    SELECTED_LIMIT_GROUP_1,
    SELECTED_LIMIT_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import { areArrayElementsUnique, formatTemporaryLimits } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { isNodeBuilt } from '../../graph/util/model-functions';

const limitGroupValidationSchema = () => ({
    [ID]: yup.string().nullable(),
    [PERMANENT_LIMIT]: yup.number().nullable().positive('permanentCurrentLimitMustBeGreaterThanZero'),
    [TEMPORARY_LIMITS]: yup
        .array()
        .of(
            yup.lazy( (item) => {
                if (item[TEMPORARY_LIMIT_NAME]) {
                    return yup.object().shape({
                        [TEMPORARY_LIMIT_NAME]: yup.string().required(),
                        [TEMPORARY_LIMIT_DURATION]: yup.number().nullable().min(0),
                        [TEMPORARY_LIMIT_VALUE]: yup.number().nullable().positive(),
                    })
                }
                // totally empty lines are fine : they will be ignored later
                // TODO : how to force the case when all are empty ? Or should I drop them before ??
                return yup.object().shape({
                    [TEMPORARY_LIMIT_NAME]: yup.string().nullable(),
                    [TEMPORARY_LIMIT_DURATION]: yup.number().nullable().min(0),
                    [TEMPORARY_LIMIT_VALUE]: yup.number().nullable().positive(),
            })
            })
        )
        .test('distinctNames', 'TemporaryLimitNameUnicityError', (array) => {
            const namesArray = array
                .filter((l) => !!l[TEMPORARY_LIMIT_NAME])
                .map((l) => sanitizeString(l[TEMPORARY_LIMIT_NAME]));
            return areArrayElementsUnique(namesArray);
        })
        /*.test('distinctDurations', 'TemporaryLimitDurationUnicityError', (array) => {
            const durationsArray = array.map((l) => l[TEMPORARY_LIMIT_DURATION]);
            return areArrayElementsUnique(durationsArray); // TODO ignorer les lignes vides et réactiver ça
        }),*/
});

const limitsValidationSchema = (id, onlySelectedLimits = true) =>
    onlySelectedLimits
        ? {
              [id]: yup.object().shape({
                  [CURRENT_LIMITS_1]: yup.object().shape(limitGroupValidationSchema()),
                  [CURRENT_LIMITS_2]: yup.object().shape(limitGroupValidationSchema()),
              }),
          }
        : {
              [id]: yup.object().shape({
                  [CURRENT_LIMITS_1]: yup.array(yup.object().shape(limitGroupValidationSchema())),
                  [CURRENT_LIMITS_2]: yup.array(yup.object().shape(limitGroupValidationSchema())),
                  [SELECTED_LIMIT_GROUP_1]: yup.string(),
                  [SELECTED_LIMIT_GROUP_2]: yup.string(),
              }),
          };

export const getLimitsValidationSchema = (id = LIMITS, onlySelectedLimits = true) => {
    return limitsValidationSchema(id, onlySelectedLimits);
};

const limitsEmptyFormData = (id, onlySelectedLimits = true) =>
    onlySelectedLimits
        ? {
              [id]: {
                  [CURRENT_LIMITS_1]: {
                      [PERMANENT_LIMIT]: null,
                      [TEMPORARY_LIMITS]: [],
                  },
                  [CURRENT_LIMITS_2]: {
                      [PERMANENT_LIMIT]: null,
                      [TEMPORARY_LIMITS]: [],
                  },
              },
          }
        : {
              [id]: {
                  [CURRENT_LIMITS_1]: [],
                  [CURRENT_LIMITS_2]: [],
                  [SELECTED_LIMIT_GROUP_1]: null,
                  [SELECTED_LIMIT_GROUP_2]: null,
              },
          };

export const getLimitsEmptyFormData = (id = LIMITS, onlySelectedLimits = true) => {
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
        currentLimits1 = [
            {
                [ID]: '',
                [PERMANENT_LIMIT]: null,
                [TEMPORARY_LIMITS]: [],
            },
        ],
        currentLimits2 = [
            {
                [ID]: '',
                [PERMANENT_LIMIT]: null,
                [TEMPORARY_LIMITS]: [],
            },
        ],
        selectedOperationalLimitsGroupId1 = null,
        selectedOperationalLimitsGroupId2 = null,
    },
    id = LIMITS
) => ({
    [id]: {
        [CURRENT_LIMITS_1]: currentLimits1,
        [CURRENT_LIMITS_2]: currentLimits2,
        [SELECTED_LIMIT_GROUP_1]: selectedOperationalLimitsGroupId1,
        [SELECTED_LIMIT_GROUP_2]: selectedOperationalLimitsGroupId2,
    },
});

export const sanitizeLimitNames = (temporaryLimitList) =>
    temporaryLimitList.map(({ name, ...temporaryLimit }) => ({
        ...temporaryLimit,
        name: sanitizeString(name),
    }));

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
