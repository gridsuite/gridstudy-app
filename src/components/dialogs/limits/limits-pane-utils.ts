/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { sanitizeString } from '../dialog-utils';
import {
    APPLICABIlITY,
    CURRENT_LIMITS,
    DELETION_MARK,
    ID,
    LIMIT_SETS_MODIFICATION_TYPE,
    LIMITS,
    MODIFICATION_TYPE,
    NAME,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from 'components/utils/field-constants';
import {
    areArrayElementsUnique,
    formatTemporaryLimits,
    formatToTemporaryLimitsDialogForm,
    toModificationOperation,
} from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import {
    AttributeModification,
    CurrentLimits,
    LineModificationInfos,
    OperationalLimitsGroup,
    OperationType,
    TemporaryLimit,
} from '../../../services/network-modification-types';
import { BranchInfos } from '../../../services/study/network-map.type';
import { areOperationalLimitsGroupUnique, OperationalLimitsId } from './limits-utils';
import {
    LineModificationFormInfos,
    OperationalLimitsGroupDialogForm,
    TemporaryLimitDialogForm,
} from '../network-modifications/line/modification/line-modification-type';

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
    [PERMANENT_LIMIT]: isModification
        ? yup.number().nullable().positive('permanentCurrentLimitMustBeGreaterThanZero')
        : yup.number().positive('permanentCurrentLimitMustBeGreaterThanZero').required(),
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

const limitsValidationSchemaCreation = (id: string, isModification: boolean) => {
    const completeLimitsGroupSchema = {
        [OPERATIONAL_LIMITS_GROUPS]: yup
            .array(yup.object().shape(limitsGroupValidationSchema(isModification)))
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
    return limitsValidationSchemaCreation(id, isModification);
};

const limitsEmptyFormData = (id: string) => {
    const limitsGroup = {
        [OPERATIONAL_LIMITS_GROUPS]: [],
        [SELECTED_LIMITS_GROUP_1]: null,
        [SELECTED_LIMITS_GROUP_2]: null,
    };

    return { [id]: limitsGroup };
};

export const getLimitsEmptyFormData = (id = LIMITS) => {
    return limitsEmptyFormData(id);
};

export const formatOpLimitGroups = (limitGroups: OperationalLimitsGroup[]): OperationalLimitsGroup[] => {
    if (!limitGroups) {
        return [];
    }
    return limitGroups.map((opLimitGroup: OperationalLimitsGroup) => {
        return {
            id: opLimitGroup.id + opLimitGroup.applicability,
            name: opLimitGroup.id,
            applicability: opLimitGroup.applicability,
            modificationType: opLimitGroup.modificationType,
            currentLimits: {
                id: opLimitGroup.currentLimits.id,
                applicability: opLimitGroup.applicability,
                permanentLimit: opLimitGroup.currentLimits.permanentLimit,
                temporaryLimits: formatTemporaryLimits(opLimitGroup.currentLimits.temporaryLimits),
            },
        };
    });
};

export const getAllLimitsFormData = (
    operationalLimitsGroups: OperationalLimitsGroup[] = [],
    selectedOperationalLimitsGroup1: string | null = null,
    selectedOperationalLimitsGroup2: string | null = null,
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
export const sanitizeLimitsGroups = (
    limitsGroups: OperationalLimitsGroupDialogForm[]
): OperationalLimitsGroupDialogForm[] =>
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
                  id: currentLimits.id,
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

export const sanitizeLimitNames = (temporaryLimitList: TemporaryLimitDialogForm[]): TemporaryLimitDialogForm[] =>
    temporaryLimitList
        ?.filter((limit: TemporaryLimitDialogForm) => limit?.name?.trim())
        .map(({ name, ...temporaryLimit }) => ({
            ...temporaryLimit,
            name: sanitizeString(name) ?? '',
        })) || [];

const findTemporaryLimitForm = (temporaryLimits: TemporaryLimitDialogForm[], limit: TemporaryLimit) =>
    temporaryLimits?.find(
        (l: TemporaryLimitDialogForm) => l.name === limit.name && l.acceptableDuration === limit.acceptableDuration
    );

export const updateTemporaryLimits = (
    limitsDialogForm: TemporaryLimitDialogForm[],
    temporaryLimitsToModify: TemporaryLimit[] // from map server
) => {
    let updatedTemporaryLimits = limitsDialogForm ?? [];
    //add temporary limits from from map server that are not in the form values
    temporaryLimitsToModify?.forEach((limit: TemporaryLimit) => {
        if (findTemporaryLimitForm(updatedTemporaryLimits, limit) === undefined) {
            updatedTemporaryLimits?.push(temporaryLimitToTemporaryLimitDialogForm(limit));
        }
    });

    //remove deleted temporary limits from current and previous modifications
    updatedTemporaryLimits = updatedTemporaryLimits?.filter((limit: TemporaryLimitDialogForm) => !limit[DELETION_MARK]);

    return updatedTemporaryLimits;
};

/**
 * extract data loaded from the map server and merge it with local data
 * in order to fill the operational limits groups modification interface
 */
export const combineFormAndMapServerLimitsGroups = (
    formBranchModification: LineModificationFormInfos,
    mapServerBranch: BranchInfos
): OperationalLimitsGroupDialogForm[] => {
    let updatedOpLG: OperationalLimitsGroupDialogForm[] = formBranchModification.limits.operationalLimitsGroups ?? [];

    // updates limit values :
    updatedOpLG.forEach((opLG: OperationalLimitsGroupDialogForm) => {
        const equivalentFromMapServer = mapServerBranch.currentLimits?.find(
            (currentLimit: CurrentLimits) =>
                currentLimit.id === opLG.name && currentLimit.applicability === opLG.applicability
        );
        if (equivalentFromMapServer !== undefined) {
            opLG.currentLimits.temporaryLimits = updateTemporaryLimits(
                opLG.currentLimits.temporaryLimits,
                formatTemporaryLimits(equivalentFromMapServer.temporaryLimits)
            );
        }
    });

    // adds all the operational limits groups from mapServerBranch THAT ARE NOT DELETED by the netmod
    mapServerBranch.currentLimits?.forEach((currentLimit: CurrentLimits) => {
        const equivalentFromNetMod = updatedOpLG.find(
            (opLG: OperationalLimitsGroupDialogForm) =>
                currentLimit.id === opLG.name && currentLimit.applicability === opLG.applicability
        );
        if (equivalentFromNetMod === undefined) {
            updatedOpLG.push({
                id: currentLimit.id + currentLimit.applicability,
                name: currentLimit.id,
                applicability: currentLimit.applicability,
                currentLimits: {
                    id: currentLimit.id,
                    applicability: currentLimit.applicability,
                    permanentLimit: null,
                    temporaryLimits: formatToTemporaryLimitsDialogForm(currentLimit.temporaryLimits),
                },
            });
        }
    });

    return updatedOpLG;
};

export const addModificationTypeToTemporaryLimits = (
    formTemporaryLimits: TemporaryLimitDialogForm[]
): TemporaryLimit[] => {
    return formTemporaryLimits.map((limit: TemporaryLimitDialogForm) => {
        return {
            ...limit,
            modificationType: limit[DELETION_MARK]
                ? TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE
                : TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY_OR_ADD,
        };
    });
};

export function addOperationTypeToSelectedOpLG(
    selectedOpLG: string | null,
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
 * note : for now only MODIFY_OR_ADD are handled, the others have been disabled for various reasons
 *
 * @param limitsGroupsForm current data from the form
 */
export const addModificationTypeToOpLimitsGroups = (
    limitsGroupsForm: OperationalLimitsGroupDialogForm[]
): OperationalLimitsGroup[] => {
    let modificationLimitsGroupsForm: OperationalLimitsGroupDialogForm[] = sanitizeLimitsGroups(limitsGroupsForm);

    return modificationLimitsGroupsForm.map((limitsGroupForm: OperationalLimitsGroupDialogForm) => {
        const modificationType: string = LIMIT_SETS_MODIFICATION_TYPE.MODIFY_OR_ADD;

        const temporaryLimits: TemporaryLimit[] = addModificationTypeToTemporaryLimits(
            sanitizeLimitNames(limitsGroupForm[CURRENT_LIMITS]?.[TEMPORARY_LIMITS])
        );
        const currentLimits: CurrentLimits = {
            id: limitsGroupForm[CURRENT_LIMITS][ID],
            applicability: limitsGroupForm[CURRENT_LIMITS]?.[APPLICABIlITY],
            permanentLimit: limitsGroupForm[CURRENT_LIMITS]?.[PERMANENT_LIMIT] ?? null,
            temporaryLimits: temporaryLimits ?? [],
        };

        return {
            id: limitsGroupForm.id,
            name: limitsGroupForm.name,
            applicability: limitsGroupForm.applicability,
            currentLimits: currentLimits,
            modificationType: modificationType,
        };
    });
};

export const temporaryLimitToTemporaryLimitDialogForm = (temporaryLimit: TemporaryLimit): TemporaryLimitDialogForm => {
    return {
        [TEMPORARY_LIMIT_NAME]: temporaryLimit.name,
        [TEMPORARY_LIMIT_DURATION]: temporaryLimit.acceptableDuration,
        [TEMPORARY_LIMIT_VALUE]: temporaryLimit.value,
        [DELETION_MARK]: false,
    };
};

export const temporaryLimitDialogFormToTemporaryLimit = (temporaryLimit: TemporaryLimitDialogForm): TemporaryLimit => {
    return {
        [TEMPORARY_LIMIT_NAME]: temporaryLimit.name,
        [TEMPORARY_LIMIT_DURATION]: temporaryLimit.acceptableDuration,
        [TEMPORARY_LIMIT_VALUE]: temporaryLimit.value,
        [MODIFICATION_TYPE]: temporaryLimit[DELETION_MARK]
            ? TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE
            : TEMPORARY_LIMIT_MODIFICATION_TYPE.MODIFY_OR_ADD,
    };
};
