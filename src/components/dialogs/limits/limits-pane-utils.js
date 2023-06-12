/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sanitizeString } from 'components/dialogs/dialogUtils';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    LIMITS,
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import {
    areArrayElementsUnique,
    formatTemporaryLimits,
} from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { isNodeBuilt } from '../../graph/util/model-functions';

const temporaryLimitsTableValidationSchema = () => ({
    [PERMANENT_LIMIT]: yup
        .number()
        .nullable()
        .positive('permanentCurrentLimitGreaterThanZero'),
    [TEMPORARY_LIMITS]: yup
        .array()
        .of(
            yup.object().shape({
                [TEMPORARY_LIMIT_NAME]: yup.string().required(),
                [TEMPORARY_LIMIT_DURATION]: yup.number().nullable().min(0),
                [TEMPORARY_LIMIT_VALUE]: yup.number().nullable().positive(),
            })
        )
        .test('distinctNames', 'TemporaryLimitNameUnicityError', (array) => {
            const namesArray = array
                .filter((l) => !!l[TEMPORARY_LIMIT_NAME])
                .map((l) => sanitizeString(l[TEMPORARY_LIMIT_NAME]));
            return areArrayElementsUnique(namesArray);
        })
        .test(
            'distinctDurations',
            'TemporaryLimitDurationUnicityError',
            (array) => {
                const durationsArray = array.map(
                    (l) => l[TEMPORARY_LIMIT_DURATION]
                );
                return areArrayElementsUnique(durationsArray);
            }
        ),
});

const limitsValidationSchema = (id) => ({
    [id]: yup.object().shape({
        [CURRENT_LIMITS_1]: yup
            .object()
            .shape(temporaryLimitsTableValidationSchema()),
        [CURRENT_LIMITS_2]: yup
            .object()
            .shape(temporaryLimitsTableValidationSchema()),
    }),
});

export const getLimitsValidationSchema = (id = LIMITS) => {
    return limitsValidationSchema(id);
};

const limitsEmptyFormData = (id) => ({
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
});

export const getLimitsEmptyFormData = (id = LIMITS) => {
    return limitsEmptyFormData(id);
};

export const getLimitsFormData = (
    {
        permanentLimit1 = null,
        permanentLimit2 = null,
        temporaryLimits1 = [],
        temporaryLimits2 = [],
    },
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

export const sanitizeLimitNames = (temporaryLimitList) =>
    temporaryLimitList.map(({ name, ...temporaryLimit }) => ({
        ...temporaryLimit,
        name: sanitizeString(name),
    }));

export const addModificationTypeToTemporaryLimits = (
    temporaryLimits,
    temporaryLimitsToModify,
    currentModifiedTemporaryLimits,
    currentNode
) => {
    return temporaryLimits.map((limit) => {
        const limitWithSameName = formatTemporaryLimits(
            temporaryLimitsToModify
        )?.find((limitToModify) => limitToModify.name === limit.name);
        if (limitWithSameName) {
            const currentLimitWithSameName = formatTemporaryLimits(
                currentModifiedTemporaryLimits
            )?.find(
                (limitToModify) =>
                    limitToModify?.name === limitWithSameName?.name
            );
            if (
                (currentLimitWithSameName?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED &&
                    isNodeBuilt(currentNode)) ||
                currentLimitWithSameName?.modificationType ===
                    TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED
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
                          modificationType:
                              TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFIED,
                      };
            }
        } else {
            return {
                ...limit,
                modificationType: TEMPORARY_LIMIT_MODIFICATION_TYPE.ADDED,
            };
        }
    });
};
