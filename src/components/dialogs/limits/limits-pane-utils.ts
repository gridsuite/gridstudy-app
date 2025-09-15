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
    NAME,
    LIMIT_SETS_MODIFICATION_TYPE,
} from 'components/utils/field-constants';
import { areArrayElementsUnique, formatTemporaryLimits, toModificationOperation } from 'components/utils/utils';
import yup from 'components/utils/yup-config';
import { isNodeBuilt } from '../../graph/util/model-functions';
import {
    AttributeModification,
    CurrentLimits,
    OperationalLimitsGroup,
    OperationType,
    TemporaryLimit,
} from '../../../services/network-modification-types';
import { CurrentTreeNode } from '../../graph/tree-node.type';
import { BranchInfos } from '../../../services/study/network-map.type';
import { areOperationalLimitsGroupUnique, OperationalLimitsId } from './limits-utils';
import { LineModificationEditData } from '../network-modifications/line/modification/line-modification-type';

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
export const sanitizeLimitsGroups = (limitsGroups: OperationalLimitsGroup[]): OperationalLimitsGroup[] =>
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
    modifiedTemporaryLimits: TemporaryLimit[], // from the form (ie network modification values)
    temporaryLimitsToModify: TemporaryLimit[] // from map server
) => {
    let updatedTemporaryLimits = modifiedTemporaryLimits ?? [];
    //add temporary limits from from map server that are not in the form values
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

/**
 * extract data loaded from the map server and merge it with local data in order to fill the operaitonal liits groups modification interface
 */
export const updateOpLimitsGroups = (
    formBranchModification: LineModificationEditData,
    mapServerBranch: BranchInfos
): OperationalLimitsGroup[] => {
    let updatedOpLG: OperationalLimitsGroup[] = formBranchModification.limits.operationalLimitsGroups ?? [];

    // updates limit values :
    updatedOpLG.forEach((opLG: OperationalLimitsGroup) => {
        const equivalentFromMapServer = mapServerBranch.currentLimits?.find(
            (currentLimit: CurrentLimits) =>
                currentLimit.id === opLG.name && currentLimit.applicability === opLG.applicability
        );
        if (equivalentFromMapServer !== undefined) {
            opLG.currentLimits.temporaryLimits = updateTemporaryLimits(
                formatTemporaryLimits(opLG.currentLimits.temporaryLimits),
                formatTemporaryLimits(equivalentFromMapServer.temporaryLimits)
            );
        }
    });

    // adds all the operational limits groups from mapServerBranch THAT ARE NOT DELETED by the netmod
    mapServerBranch.currentLimits.forEach((currentLimit: CurrentLimits) => {
        const equivalentFromNetMod = updatedOpLG.find(
            (opLG: OperationalLimitsGroup) =>
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
                    temporaryLimits: formatTemporaryLimits(currentLimit.temporaryLimits),
                },
            });
        }
    });

    //remove deleted operational limits groups
    updatedOpLG = updatedOpLG?.filter(
        (opLG: OperationalLimitsGroup) => opLG.modificationType !== TEMPORARY_LIMIT_MODIFICATION_TYPE.DELETE
    );

    return updatedOpLG;
};

export const addModificationTypeToTemporaryLimits = (
    temporaryLimits: TemporaryLimit[],
    temporaryLimitsToModify: TemporaryLimit[],
    networkTemporaryLimits: TemporaryLimit[],
    currentNode: CurrentTreeNode
): TemporaryLimit[] => {
    const formattedTemporaryLimitsToModify = formatTemporaryLimits(temporaryLimitsToModify);
    const formattedNetworkTemporaryLimits = formatTemporaryLimits(networkTemporaryLimits);
    const updatedTemporaryLimits: TemporaryLimit[] = temporaryLimits.map((limit) => {
        const limitWithSameName = findTemporaryLimit(formattedTemporaryLimitsToModify, limit);
        if (limitWithSameName) {
            const currentLimitWithSameName: TemporaryLimit | undefined = findTemporaryLimit(
                formattedNetworkTemporaryLimits,
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
    formattedNetworkTemporaryLimits?.forEach((limit) => {
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

export function addOperationTypeToSelectedOpLG(
    selectedOpLG: string,
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
 * note : for now only ADD and MODIFY_OR_ADD are handled, the others have been disabled for various reasons
 *
 * @param limitsGroups current data from the form
 * @param networkLine data of the line modified by the network modification
 * @param editData data from the existing network modification, if the user is editing a netmod already stored in database
 * @param currentNode
 */
export const addModificationTypeToOpLimitsGroups = (
    limitsGroups: OperationalLimitsGroup[],
    networkLine: BranchInfos | null,
    editData: LineModificationEditData | null | undefined,
    currentNode: CurrentTreeNode
) => {
    let modificationLimitsGroups: OperationalLimitsGroup[] = sanitizeLimitsGroups(limitsGroups);

    modificationLimitsGroups = modificationLimitsGroups.map((formLimitsGroup: OperationalLimitsGroup) => {
        const modificationType: string = LIMIT_SETS_MODIFICATION_TYPE.MODIFY_OR_ADD;
        const networkCurrentLimits = networkLine?.currentLimits.find(
            (lineOpLimitGroup: CurrentLimits) =>
                lineOpLimitGroup.id === formLimitsGroup.name &&
                lineOpLimitGroup.applicability === formLimitsGroup.applicability
        );

        const temporaryLimits: TemporaryLimit[] = addModificationTypeToTemporaryLimits(
            sanitizeLimitNames(formLimitsGroup.currentLimits?.[TEMPORARY_LIMITS]),
            networkCurrentLimits?.temporaryLimits ?? [],
            editData?.operationalLimitsGroups?.find(
                (editDataOpLimitGroup: OperationalLimitsGroup) =>
                    editDataOpLimitGroup.id === formLimitsGroup.name &&
                    editDataOpLimitGroup.applicability === formLimitsGroup.applicability
            )?.currentLimits?.temporaryLimits ?? [],
            currentNode
        );
        let currentLimits = formLimitsGroup.currentLimits;
        if (formLimitsGroup.currentLimits?.[PERMANENT_LIMIT] || temporaryLimits.length > 0) {
            currentLimits.permanentLimit = formLimitsGroup.currentLimits?.[PERMANENT_LIMIT];
            currentLimits.temporaryLimits = temporaryLimits;
        }

        return {
            id: formLimitsGroup.id,
            name: formLimitsGroup.name,
            applicability: formLimitsGroup.applicability,
            currentLimits: currentLimits,
            modificationType: modificationType,
        };
    });

    return modificationLimitsGroups;
};
