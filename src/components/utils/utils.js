/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import { getIn } from 'yup';
import { toNumber } from './validation-functions';

export const UNDEFINED_ACCEPTABLE_DURATION = Math.pow(2, 31) - 1;

/**
 * Get the label of an enum value from its id
 * @param {Array} enumValues - The enum values {id: string, label: string} []
 * @param {string} id - The id of the enum value
 * @returns {string | undefined} - The label of the enum value
 */
export const getEnumLabelById = (enumValues, id) => {
    if (!enumValues || !id) {
        return undefined;
    }
    const enumValue = enumValues.find((enumValue) => enumValue.id === id);
    return enumValue?.label;
};

export const isFieldRequired = (fieldName, schema, values) => {
    const { schema: fieldSchema, parent: parentValues } =
        getIn(schema, fieldName, values) || {};
    return fieldSchema.describe({ parent: parentValues })?.optional === false;

    //static way, not working when using "when" in schema, but does not need form values
    //return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
};

export const areArrayElementsUnique = (array) => {
    let uniqueAlphaValues = [...new Set(array)];
    return uniqueAlphaValues.length === array.length;
};

/**
 * Returns true if every element of this array is a number and they are ordered (ascending or descending)
 * @param array or numbers
 * @returns {boolean}
 */
export const areNumbersOrdered = (array) => {
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
        if (
            (order === 'asc' && current > nextOne) ||
            (order === 'desc' && current < nextOne)
        ) {
            return false;
        }
        current = nextOne;
    }
    return true;
};

export const findIndexesOfDuplicateFieldValues = (values, fieldName) => {
    const counts = new Map();
    values.forEach((element, index) => {
        const value = element[fieldName];
        counts.set(value, (counts.get(value) || []).concat(index));
    });
    return [...counts.values()].filter((indexes) => indexes.length > 1).flat();
};

export const areIdsEqual = (val1, val2) => {
    return val1.id === val2.id;
};

export const areUuidsEqual = (val1, val2) => {
    return val1.uuid === val2.uuid;
};

export const getObjectId = (object) => {
    return typeof object === 'string' ? object : object?.id ?? null;
};

export const buildNewBusbarSections = (
    equipmentId,
    sectionCount,
    busbarCount
) => {
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

export function toModificationOperation(value) {
    return value === 0 || value === false || value
        ? { value: value, op: 'SET' }
        : null;
}

export function toModificationUnsetOperation(value) {
    if (value === null) {
        return null;
    }
    return value === 0 || value === false || value
        ? { value: value, op: 'SET' }
        : { op: 'UNSET' };
}

export const formatTemporaryLimits = (temporaryLimits) =>
    temporaryLimits?.map((limit) => {
        return {
            name: limit?.name ?? '',
            value: limit?.value ?? null,
            acceptableDuration: limit?.acceptableDuration ?? null,
            modificationType: limit?.modificationType ?? null,
        };
    });

export const richTypeEquals = (a, b) => a === b;

export const computeHighTapPosition = (steps) => {
    const values = steps?.map((step) => step['index']);
    return values?.length > 0 ? Math.max(...values) : null;
};

export const compareStepsWithPreviousValues = (tapSteps, previousValues) => {
    if (previousValues === undefined) {
        return false;
    }
    if (tapSteps.length !== previousValues?.length) {
        return false;
    }
    return tapSteps.every((step, index) => {
        const previousStep = previousValues[index];
        return Object.getOwnPropertyNames(previousStep).every((key) => {
            return parseFloat(step[key]) === previousStep[key];
        });
    });
};

export const getTapChangerEquipmentSectionTypeValue = (tapChanger) => {
    if (!tapChanger?.regulatingTerminalConnectableType) {
        return null;
    } else {
        return (
            tapChanger?.regulatingTerminalConnectableType +
            ' : ' +
            tapChanger?.regulatingTerminalConnectableId
        );
    }
};

export const getTapChangerRegulationTerminalValue = (tapChanger) => {
    let regulatingTerminalGeneratorValue =
        tapChanger?.regulatingTerminalConnectableId ?? '';
    if (tapChanger?.regulatingTerminalVlId) {
        regulatingTerminalGeneratorValue +=
            ' ( ' + tapChanger?.regulatingTerminalVlId + ' )';
    }
    return regulatingTerminalGeneratorValue;
};

export function calculateResistance(distance, linearResistance) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearResistance === undefined ||
        isNaN(linearResistance)
    ) {
        return 0;
    }
    return Number(distance) * Number(linearResistance);
}

export function calculateReactance(distance, linearReactance) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearReactance === undefined ||
        isNaN(linearReactance)
    ) {
        return 0;
    }
    return Number(distance) * Number(linearReactance);
}

export const computeSwitchedOnValue = (
    sectionCount,
    maximumSectionCount,
    linkedSwitchedOnValue
) => {
    return (linkedSwitchedOnValue / maximumSectionCount) * sectionCount;
};

export const computeMaxQAtNominalV = (maxSucepctance, nominalVoltage) => {
    return Math.abs(maxSucepctance * Math.pow(nominalVoltage, 2));
};

export const computeMaxSusceptance = (maxQAtNominalV, nominalVoltage) => {
    return Math.abs(maxQAtNominalV / Math.pow(nominalVoltage, 2));
};

export function calculateSusceptance(distance, linearCapacity) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearCapacity === undefined ||
        isNaN(linearCapacity)
    ) {
        return 0;
    }
    return (
        Number(distance) *
        Number(linearCapacity) *
        2 *
        Math.PI *
        50 *
        Math.pow(10, 6)
    );
}

export const replaceAllDefaultValues = (arrayParams, oldValue, newValue) => {
    return (
        arrayParams &&
        arrayParams.reduce((accumulator, current) => {
            return [
                ...accumulator,
                {
                    ...current,
                    defaultValue:
                        current.defaultValue === oldValue
                            ? newValue
                            : current.defaultValue,
                },
            ];
        }, [])
    );
};

export function getNewVoltageLevelOptions(
    formattedVoltageLevel,
    oldVoltageLevelId,
    voltageLevelOptions
) {
    const newVoltageLevelOptions =
        formattedVoltageLevel.id === oldVoltageLevelId
            ? voltageLevelOptions.filter(
                  (vl) => vl.id !== formattedVoltageLevel.id
              )
            : voltageLevelOptions.filter(
                  (vl) =>
                      vl.id !== formattedVoltageLevel.id &&
                      vl.id !== oldVoltageLevelId
              );
    newVoltageLevelOptions.push(formattedVoltageLevel);

    return newVoltageLevelOptions;
}

export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
