/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    AMOUNT_TEMPORARY_LIMITS,
    CSV_FILENAME,
    EQUIPMENT_ID,
    IS_ACTIVE,
    LIMIT_GROUP_NAME,
    LIMIT_SETS_MODIFICATION_TYPE,
    MODIFICATION_TYPE,
    MODIFICATIONS_TABLE,
    PERMANENT_LIMIT,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID,
    SIDE,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS_MODIFICATION_TYPE,
    TYPE,
} from '../../../utils/field-constants';
import { BranchSide } from '../../../utils/constants';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import yup from '../../../utils/yup-config';
import { UUID } from 'crypto';
import { LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS } from '../tabular/tabular-modification-utils';

type TemporaryLimit = {
    name: string;
    value: number;
    acceptableDuration: number;
};

type CurrentLimits = {
    permanentLimit: number;
    temporaryLimits: TemporaryLimit[];
};

type OperationalLimitGroup = {
    id: string;
    modificationType: string;
    temporaryLimitsModificationType: string;
    selectedOperationalLimitsGroupId: string;
    side: string;
    currentLimits: CurrentLimits;
    type: string;
};

type LimitSetModification = {
    uuid: string;
    type: string;
    activated: boolean;
    date: string;
    equipmentId: string;
    operationalLimitsGroup1: OperationalLimitGroup[];
    operationalLimitsGroup2: OperationalLimitGroup[];
    stashed: boolean;
};

export type LimitSetModificationMetadata = {
    activated: boolean;
    date: string;
    modificationType: string;
    modifications: LimitSetModification[];
    stashed: boolean;
    type: string;
    uuid: UUID;
    csvFilename: string;
};

const getAmountTemporaryLimits = (editData: LimitSetModificationMetadata) => {
    let maxLength = 0;
    for (const mod of editData.modifications) {
        for (const limit of mod?.operationalLimitsGroup1 ?? []) {
            const temporaryLimitsLength = limit.currentLimits?.temporaryLimits?.length ?? 0;
            maxLength = Math.max(maxLength, temporaryLimitsLength);
        }
        for (const limit of mod?.operationalLimitsGroup2 ?? []) {
            const temporaryLimitsLength = limit.currentLimits?.temporaryLimits?.length ?? 0;
            maxLength = Math.max(maxLength, temporaryLimitsLength);
        }
    }
    return maxLength;
};

const formatTemporaryLimitsFrontToBack = (modification: ModificationRow, amountMaxTemporaryLimits: number) => {
    const temporaryLimits = [];
    for (let i = 1; i <= amountMaxTemporaryLimits; i++) {
        if (modification[TEMPORARY_LIMIT_NAME + i]) {
            temporaryLimits.push({
                name: modification[TEMPORARY_LIMIT_NAME + i],
                value: modification[TEMPORARY_LIMIT_VALUE + i],
                acceptableDuration: modification[TEMPORARY_LIMIT_DURATION + i],
                //If we aren't modifying an existing limit set, temporary limits modification is necessarily of ADDED type
                modificationType:
                    modification[MODIFICATION_TYPE] === LIMIT_SETS_MODIFICATION_TYPE.MODIFY
                        ? modification[TEMPORARY_LIMITS_MODIFICATION_TYPE]
                        : TEMPORARY_LIMIT_MODIFICATION_TYPE.ADD,
            });
        }
    }
    return temporaryLimits;
};
export const formatOperationalLimitGroupsFrontToBack = (
    modification: ModificationRow,
    amountMaxTemporaryLimits: number,
    side: BranchSide
) => {
    return {
        id: modification[LIMIT_GROUP_NAME],
        side: side,
        selectedOperationalLimitsGroupId: modification[IS_ACTIVE] ? modification[LIMIT_GROUP_NAME] : null,
        modificationType: modification[MODIFICATION_TYPE],
        temporaryLimitsModificationType: modification[TEMPORARY_LIMITS_MODIFICATION_TYPE],
        currentLimits: {
            permanentLimit: modification[PERMANENT_LIMIT],
            temporaryLimits: formatTemporaryLimitsFrontToBack(modification, amountMaxTemporaryLimits),
        },
    };
};
const formatTemporaryLimitsBackToFront = (temporaryLimits: TemporaryLimit[]) => {
    const modification: ModificationRow = {};
    for (let i = 0; i < temporaryLimits.length; i++) {
        const index = i + 1; // Fields are 1-indexed
        const tempLimit = temporaryLimits[i];

        modification[TEMPORARY_LIMIT_NAME + index] = tempLimit.name;
        modification[TEMPORARY_LIMIT_VALUE + index] = tempLimit.value;
        modification[TEMPORARY_LIMIT_DURATION + index] = tempLimit.acceptableDuration;
    }
    return modification;
};

const getEquipmentTypeFromLimitSetModificationType = (type: string) => {
    return Object.keys(LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS).find(
        (key) => LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS[key] === type
    );
};

export const formatBackToFront = (editData: LimitSetModificationMetadata) => {
    const operationalLimitGroups = formatOperationalLimitGroupsBackToFront(editData);
    return {
        [TYPE]: getEquipmentTypeFromLimitSetModificationType(editData.modificationType),
        [AMOUNT_TEMPORARY_LIMITS]: getAmountTemporaryLimits(editData),
        [MODIFICATIONS_TABLE]: operationalLimitGroups,
        [CSV_FILENAME]: editData.csvFilename,
    };
};

const mapOperationalLimitGroupBackToFront = (
    modification: LimitSetModification,
    group: OperationalLimitGroup
): ModificationRow => {
    let row: ModificationRow = {};
    row[EQUIPMENT_ID] = modification[EQUIPMENT_ID];
    row[IS_ACTIVE] = group[SELECTED_OPERATIONAL_LIMITS_GROUP_ID] === group.id;
    row[SIDE] = group[SIDE];
    row[LIMIT_GROUP_NAME] = group.id;
    row[MODIFICATION_TYPE] = group.modificationType;
    row[TEMPORARY_LIMITS_MODIFICATION_TYPE] = group.temporaryLimitsModificationType;
    row[PERMANENT_LIMIT] = group.currentLimits.permanentLimit;

    const tempLimitFields = formatTemporaryLimitsBackToFront(group.currentLimits.temporaryLimits);
    return {
        ...row,
        ...tempLimitFields,
    };
};

const formatOperationalLimitGroupsBackToFront = (group: LimitSetModificationMetadata): OperationalLimitGroup[] => {
    const modifications: OperationalLimitGroup[] = [];
    for (let modification of group.modifications) {
        for (let operationalLimitGroup of modification?.operationalLimitsGroup1 ?? []) {
            modifications.push(mapOperationalLimitGroupBackToFront(modification, operationalLimitGroup));
        }
        for (let operationalLimitGroup of modification?.operationalLimitsGroup2 ?? []) {
            modifications.push(mapOperationalLimitGroupBackToFront(modification, operationalLimitGroup));
        }
    }

    return modifications;
};
export const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [AMOUNT_TEMPORARY_LIMITS]: yup
            .number()
            .min(1, 'amountTemporaryLimitsError')
            .max(50, 'amountTemporaryLimitsError')
            .required(),
        [MODIFICATIONS_TABLE]: yup.array().min(1, 'ModificationsRequiredTabError').required(),
        [CSV_FILENAME]: yup.string().nullable().required(),
    })
    .required();
export type SchemaType = yup.InferType<typeof formSchema>;
export type ModificationRow = SchemaType[typeof MODIFICATIONS_TABLE][number];

export const emptyFormData: SchemaType = {
    [TYPE]: EQUIPMENT_TYPES.LINE,
    [AMOUNT_TEMPORARY_LIMITS]: 1,
    [MODIFICATIONS_TABLE]: [],
    [CSV_FILENAME]: '',
};
