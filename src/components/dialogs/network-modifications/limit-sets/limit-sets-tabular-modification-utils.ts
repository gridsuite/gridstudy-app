/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Modification } from '../tabular-modification/tabular-modification-utils';
import {
    AMOUNT_TEMPORARY_LIMITS,
    EQUIPMENT_ID,
    LIMIT_GROUP_NAME,
    MODIFICATION_TYPE,
    MODIFICATIONS_TABLE,
    PERMANENT_LIMIT,
    SIDE,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS_MODIFICATION_TYPE,
    TYPE,
} from '../../../utils/field-constants';
import { BranchSide } from '../../../utils/constants';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import yup from '../../../utils/yup-config';

const formatTemporaryLimitsFrontToBack = (modification: Modification, amountMaxTemporaryLimits: number) => {
    const temporaryLimits = [];
    for (let i = 1; i <= amountMaxTemporaryLimits; i++) {
        if (modification[TEMPORARY_LIMIT_NAME + i]) {
            temporaryLimits.push({
                name: modification[TEMPORARY_LIMIT_NAME + i],
                value: modification[TEMPORARY_LIMIT_VALUE + i],
                acceptableDuration: modification[TEMPORARY_LIMIT_DURATION + i],
                modificationType: modification[TEMPORARY_LIMITS_MODIFICATION_TYPE],
            });
        }
    }
    return temporaryLimits;
};
export const formatOperationalLimitGroupsFrontToBack = (
    modification: Modification,
    amountMaxTemporaryLimits: number,
    side: BranchSide
) => {
    return {
        id: modification[LIMIT_GROUP_NAME],
        side: side,
        modificationType: modification[MODIFICATION_TYPE],
        temporaryLimitsModificationType: modification[TEMPORARY_LIMITS_MODIFICATION_TYPE],
        currentLimits: {
            permanentLimit: modification[PERMANENT_LIMIT],
            temporaryLimits: formatTemporaryLimitsFrontToBack(modification, amountMaxTemporaryLimits),
        },
    };
};
const formatTemporaryLimitsBackToFront = (
    temporaryLimits: {
        name: string;
        value: number;
        acceptableDuration: number;
        modificationType: string;
    }[]
) => {
    const modification: Modification = {};
    for (let i = 0; i < temporaryLimits.length; i++) {
        const index = i + 1; // Fields are 1-indexed
        const tempLimit = temporaryLimits[i];

        modification[TEMPORARY_LIMIT_NAME + index] = tempLimit.name;
        modification[TEMPORARY_LIMIT_VALUE + index] = tempLimit.value;
        modification[TEMPORARY_LIMIT_DURATION + index] = tempLimit.acceptableDuration;
    }
    return modification;
};
export const formatBackToFront = (editData: Modification) => {
    const operationalLimitGroups = formatOperationalLimitGroupsBackToFront(editData);
    const type = operationalLimitGroups.find((operationalLimitGroup) => operationalLimitGroup.type !== undefined)?.type;
    return {
        [TYPE]: type,
        [AMOUNT_TEMPORARY_LIMITS]: operationalLimitGroups.length,
        [MODIFICATIONS_TABLE]: operationalLimitGroups,
    };
};
const formatOperationalLimitGroupsBackToFront = (group: Modification): Modification[] => {
    const modifications: Modification[] = [];
    for (let modification of group.modifications) {
        for (let operationalLimitGroup of modification.operationalLimitsGroup1) {
            let row: Modification = {};
            row[EQUIPMENT_ID] = modification[EQUIPMENT_ID];
            row[SIDE] = operationalLimitGroup[SIDE];
            row[LIMIT_GROUP_NAME] = operationalLimitGroup.id;
            row[MODIFICATION_TYPE] = operationalLimitGroup.modificationType;
            row[TEMPORARY_LIMITS_MODIFICATION_TYPE] = operationalLimitGroup.temporaryLimitsModificationType;
            row[PERMANENT_LIMIT] = operationalLimitGroup.currentLimits.permanentLimit;

            const tempLimitFields = formatTemporaryLimitsBackToFront(
                operationalLimitGroup.currentLimits.temporaryLimits
            );
            modifications.push({
                ...row,
                ...tempLimitFields,
            });
        }
    }

    return modifications;
};
export const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [AMOUNT_TEMPORARY_LIMITS]: yup.number().positive().max(50).required(),
        [MODIFICATIONS_TABLE]: yup.array().min(1, 'ModificationsRequiredTabError').required(),
    })
    .required();
export type SchemaType = yup.InferType<typeof formSchema>;
export const emptyFormData: SchemaType = {
    [TYPE]: EQUIPMENT_TYPES.LINE,
    [AMOUNT_TEMPORARY_LIMITS]: 1,
    [MODIFICATIONS_TABLE]: [],
};
export type LimitSetsTabularModification = {
    [key: string]: any;
};
