/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getIn, SchemaDescription } from 'yup';
import { isNotBlankOrEmpty, toNumber } from './validation-functions';
import { CurrentLimits, OperationalLimitsGroup, TemporaryLimit } from 'services/network-modification-types';
import { VoltageLevel } from './equipment-types';
import { Option } from '@gridsuite/commons-ui';
import { CURRENT_LIMITS, ID, SELECTED } from './field-constants';
import { AttributeModification } from '../dialogs/network-modifications/hvdc-line/vsc/converter-station/converter-station-type';

export const UNDEFINED_ACCEPTABLE_DURATION = Math.pow(2, 31) - 1;

export const isFieldRequired = (fieldName: string, schema: any, values: unknown) => {
    const { schema: fieldSchema, parent: parentValues } = getIn(schema, fieldName, values) || {};
    return (fieldSchema.describe({ parent: parentValues }) as SchemaDescription)?.optional === false;

    // static way, not working when using "when" in schema, but does not need form values
    // return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
};

export const areArrayElementsUnique = (array: unknown[]) => {
    let uniqueAlphaValues = [...new Set(array)];
    return uniqueAlphaValues.length === array.length;
};

/**
 * Returns true if every element of this array is a number and they are ordered (ascending or descending)
 * @param array or numbers
 * @returns {boolean}
 */
export const areNumbersOrdered = (array?: unknown) => {
    if (!Array.isArray(array)) {
        return false;
    }
    if (array.length === 0) {
        return true;
    }
    if (array.length === 1) {
        return !isNaN(toNumber(array[0]));
    }

    let current = toNumber(array[0]);
    if (isNaN(current)) {
        return false;
    }
    let order = null;

    for (let i = 1; i < array.length; i++) {
        const nextOne = toNumber(array[i]);
        if (isNaN(nextOne)) {
            return false;
        }
        if (current === nextOne) {
            continue;
        }
        if (order === null) {
            order = current < nextOne ? 'asc' : 'desc';
        }
        if ((order === 'asc' && current > nextOne) || (order === 'desc' && current < nextOne)) {
            return false;
        }
        current = nextOne;
    }
    return true;
};

export const areIdsEqual = (val1: Option, val2: Option) => {
    if (typeof val1 !== 'string' && typeof val2 !== 'string') {
        return val1.id === val2.id;
    } else {
        return val1 === val2;
    }
};

export const getObjectId = (object: string | { id: string }) => {
    return typeof object === 'string' ? object : object?.id ?? null;
};

export const buildNewBusbarSections = (equipmentId: string, sectionCount: number, busbarCount: number) => {
    const newBusbarSections = [];
    for (let i = 0; i < busbarCount; i++) {
        for (let j = 0; j < sectionCount; j++) {
            newBusbarSections.push({
                id: equipmentId + '_' + (i + 1) + '_' + (j + 1),
                name: '',
            });
        }
    }
    return newBusbarSections;
};

export function toModificationOperation<T>(value: T): AttributeModification<T> | null {
    return value === 0 || value === false || value ? { value: value, op: 'SET' } : null;
}

export function toModificationUnsetOperation<T>(value: T): AttributeModification<T> | null {
    if (value === null) {
        return null;
    }
    return value === 0 || value === false || value ? { value: value, op: 'SET' } : { op: 'UNSET' };
}

export const formatTemporaryLimits = (temporaryLimits: TemporaryLimit[]) =>
    temporaryLimits?.map((limit) => {
        return {
            name: limit?.name ?? '',
            value: limit?.value ?? null,
            acceptableDuration: limit?.acceptableDuration ?? null,
            modificationType: limit?.modificationType ?? null,
        };
    });

export const formatCompleteCurrentLimit = (completeLimitsGroups: CurrentLimits[]) => {
    const formattedCompleteLimitsGroups: OperationalLimitsGroup[] = [];
    if (completeLimitsGroups) {
        completeLimitsGroups.forEach((elt) => {
            if (isNotBlankOrEmpty(elt.id)) {
                formattedCompleteLimitsGroups.push({
                    [ID]: elt.id,
                    [CURRENT_LIMITS]: {
                        permanentLimit: elt.permanentLimit,
                        temporaryLimits: addSelectedFieldToRows(formatTemporaryLimits(elt.temporaryLimits)),
                    },
                });
            }
        });
    }
    return formattedCompleteLimitsGroups;
};

export const richTypeEquals = (a: unknown, b: unknown) => a === b;

export const computeHighTapPosition = (steps: { index: number }[]) => {
    const values = steps?.map((step) => step['index']);
    return values?.length > 0 ? Math.max(...values) : null;
};

export const compareStepsWithPreviousValues = (
    tapSteps: Record<string, number>[],
    previousValues: Record<string, number>[]
) => {
    if (previousValues === undefined) {
        return false;
    }
    if (tapSteps.length !== previousValues?.length) {
        return false;
    }
    return tapSteps.every((step, index) => {
        const previousStep = previousValues[index];
        return Object.getOwnPropertyNames(previousStep).every((key) => {
            return step[key] === previousStep[key];
        });
    });
};

interface TapChangerInfos {
    regulatingTerminalConnectableType: string;
    regulatingTerminalConnectableId: string;
    regulatingTerminalVlId: string;
}

export const getTapChangerEquipmentSectionTypeValue = (tapChanger: TapChangerInfos) => {
    if (!tapChanger?.regulatingTerminalConnectableType) {
        return null;
    } else {
        return tapChanger?.regulatingTerminalConnectableType + ' : ' + tapChanger?.regulatingTerminalConnectableId;
    }
};

export const getTapChangerRegulationTerminalValue = (tapChanger: TapChangerInfos) => {
    let regulatingTerminalGeneratorValue = tapChanger?.regulatingTerminalConnectableId ?? '';
    if (tapChanger?.regulatingTerminalVlId) {
        regulatingTerminalGeneratorValue += ' ( ' + tapChanger?.regulatingTerminalVlId + ' )';
    }
    return regulatingTerminalGeneratorValue;
};

export function calculateResistance(distance: number, linearResistance: number) {
    if (distance === undefined || isNaN(distance) || linearResistance === undefined || isNaN(linearResistance)) {
        return 0;
    }
    return Number(distance) * Number(linearResistance);
}

export function calculateReactance(distance: number, linearReactance: number) {
    if (distance === undefined || isNaN(distance) || linearReactance === undefined || isNaN(linearReactance)) {
        return 0;
    }
    return Number(distance) * Number(linearReactance);
}

export const computeSwitchedOnValue = (
    sectionCount: number,
    maximumSectionCount: number,
    linkedSwitchedOnValue: number
) => {
    return (linkedSwitchedOnValue / maximumSectionCount) * sectionCount;
};

export const computeQAtNominalV = (susceptance: number, nominalVoltage: number) => {
    return Math.abs(susceptance * Math.pow(nominalVoltage, 2));
};

export const computeMaxQAtNominalV = (maxSucepctance: number, nominalVoltage: number) => {
    return Math.abs(maxSucepctance * Math.pow(nominalVoltage, 2));
};

export const computeMaxSusceptance = (maxQAtNominalV: number, nominalVoltage: number) => {
    return Math.abs(maxQAtNominalV / Math.pow(nominalVoltage, 2));
};

export function calculateSusceptance(distance: number, linearCapacity: number) {
    if (distance === undefined || isNaN(distance) || linearCapacity === undefined || isNaN(linearCapacity)) {
        return 0;
    }
    return Number(distance) * Number(linearCapacity) * 2 * Math.PI * 50 * Math.pow(10, 6);
}

export function getNewVoltageLevelOptions(
    formattedVoltageLevel: VoltageLevel,
    oldVoltageLevelId: string,
    voltageLevelOptions: VoltageLevel[]
) {
    const newVoltageLevelOptions =
        formattedVoltageLevel.id === oldVoltageLevelId
            ? voltageLevelOptions.filter((vl) => vl.id !== formattedVoltageLevel.id)
            : voltageLevelOptions.filter((vl) => vl.id !== formattedVoltageLevel.id && vl.id !== oldVoltageLevelId);
    newVoltageLevelOptions.push(formattedVoltageLevel);

    return newVoltageLevelOptions;
}

// remove elementToToggle from list, or add it if it does not exist yet
// useful when checking/unchecking checkboxex
export function toggleElementFromList<T>(elementToToggle: T, list: T[], getFieldId: (element: T) => string) {
    const resultList = [...list];
    const elementToToggleIndex = resultList.findIndex((element) => getFieldId(element) === getFieldId(elementToToggle));
    if (elementToToggleIndex >= 0) {
        resultList.splice(elementToToggleIndex, 1);
    } else {
        resultList.push(elementToToggle);
    }
    return resultList;
}

export const comparatorStrIgnoreCase = (str1: string, str2: string) => {
    return str1.toLowerCase().localeCompare(str2.toLowerCase());
};

export function arrayFrom(start = 0.0, stop = 0.0, step = 1.0) {
    const length = (stop - start) / step + 1;
    return Array.from({ length }, (_, index) => start + index * step);
}

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
    RESULTS: 'Results',
    LOGS: 'Logs',
    PARAMETERS: 'Parameters',
};

export type StudyViewType = (typeof StudyView)[keyof typeof StudyView];

export const addSelectedFieldToRows = <T>(rows: T[]): (T & { selected: boolean })[] => {
    return rows?.map((row) => {
        return { ...row, [SELECTED]: false };
    });
};
