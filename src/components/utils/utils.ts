/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef } from 'react';
import { getIn } from 'yup';
import { toNumber } from './validation-functions';
import EnumOption from './EnumOption';
import type { FixedLengthArray, UnknownArray } from 'type-fest';
import type { Abs, Divide, Max, Multiply, Pow, Subtract } from 'ts-arithmetic';
import type { Identifiable } from '@gridsuite/commons-ui';
import type { VoltageLevel } from './equipment-types';

export type PI = 3.141592653589793; // Math.PI

export type MaxArray<TArray extends number[]> = TArray extends [
    infer First extends number,
    ...infer Rest extends number[]
]
    ? Rest['length'] extends 0
        ? First
        : Max<First, MaxArray<Rest>>
    : never;

export const UNDEFINED_ACCEPTABLE_DURATION = (Math.pow(2, 31) - 1) as Subtract<Pow<2, 31>, 1>;

// TODO: when NaN become a type in TypeScript, update the definitions functions
//  https://github.com/Microsoft/TypeScript/issues/28682

/**
 * Get the label of an enum value from its id
 * @param {Array} enumValues - The enum values {id: string, label: string} []
 * @param {string} id - The id of the enum value
 * @returns {string | undefined} - The label of the enum value
 */
export function getEnumLabelById(enumValues: EnumOption[], id: string) {
    if (!enumValues || !id) {
        return undefined;
    }
    return enumValues.find((enumValue) => enumValue.id === id)?.label;
}

export function isFieldRequired(fieldName: any, schema: any, values: any) {
    const { schema: fieldSchema, parent: parentValues } = getIn(schema, fieldName, values) || {};
    // @ts-expect-error TODO: look with src/components/utils/rhf-inputs/chip-items-input.jsx for type
    return fieldSchema.describe({ parent: parentValues })?.optional === false;

    //static way, not working when using "when" in schema, but does not need form values
    //return yup.reach(schema, fieldName)?.exclusiveTests?.required === true;
}

export function areArrayElementsUnique(array: UnknownArray) {
    let uniqueAlphaValues = [...new Set(array)];
    return uniqueAlphaValues.length === array.length;
}

/**
 * Returns true if every element of this array is a number and they are ordered (ascending or descending)
 */
export function areNumbersOrdered(array: unknown) {
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
}

export const areIdsEqual = (val1: any, val2: any) => val1.id === val2.id;

export function getObjectId(object: any) {
    return typeof object === 'string' ? object : object?.id ?? null;
}

export function buildNewBusbarSections<NSection extends number, NBusBar extends number>(
    equipmentId: string,
    sectionCount: NSection,
    busbarCount: NBusBar
) {
    const newBusbarSections = new Array<Identifiable>(busbarCount * sectionCount);
    for (let b = 0; b < busbarCount; b++) {
        for (let s = 0; s < sectionCount; s++) {
            newBusbarSections.push({
                id: `${equipmentId}_${b + 1}_${s + 1}`,
                name: '',
            });
        }
    }
    return newBusbarSections as unknown as FixedLengthArray<Identifiable, Multiply<NBusBar, NSection>>;
}

export function toModificationOperation<T>(value: T) {
    return value === 0 || value === false || value ? ({ value: value, op: 'SET' } as const) : null;
}

export function toModificationUnsetOperation<T>(value: T) {
    if (value === null) {
        return null;
    }
    return value === 0 || value === false || value
        ? ({ value: value, op: 'SET' } as const)
        : ({ op: 'UNSET' } as const);
}

export const formatTemporaryLimits = (temporaryLimits: any[]) =>
    temporaryLimits?.map((limit) => ({
        name: limit?.name ?? '',
        value: limit?.value ?? null,
        acceptableDuration: limit?.acceptableDuration ?? null,
        modificationType: limit?.modificationType ?? null,
    }));

export const richTypeEquals = (a: unknown, b: unknown) => a === b;

export function computeHighTapPosition(steps: any[]) {
    const values = steps?.map((step) => step['index']);
    return values?.length > 0 ? Math.max(...values) : null;
}

export function compareStepsWithPreviousValues(tapSteps: any[], previousValues: any[]) {
    if (previousValues === undefined) {
        return false;
    }
    if (tapSteps.length !== previousValues?.length) {
        return false;
    }
    return tapSteps.every((step, index) => {
        const previousStep = previousValues[index];
        return Object.getOwnPropertyNames(previousStep).every((key) => parseFloat(step[key]) === previousStep[key]);
    });
}

export function getTapChangerEquipmentSectionTypeValue(tapChanger: any) {
    if (!tapChanger?.regulatingTerminalConnectableType) {
        return null;
    } else {
        return tapChanger?.regulatingTerminalConnectableType + ' : ' + tapChanger?.regulatingTerminalConnectableId;
    }
}

export function getTapChangerRegulationTerminalValue(tapChanger: any) {
    let regulatingTerminalGeneratorValue = tapChanger?.regulatingTerminalConnectableId ?? '';
    if (tapChanger?.regulatingTerminalVlId) {
        regulatingTerminalGeneratorValue += ' ( ' + tapChanger?.regulatingTerminalVlId + ' )';
    }
    return regulatingTerminalGeneratorValue;
}

export function calculateResistance<TD extends number, TLR extends number>(
    distance: number | undefined,
    linearResistance: number | undefined
) {
    if (distance === undefined || isNaN(distance) || linearResistance === undefined || isNaN(linearResistance)) {
        return 0;
    }
    return (Number(distance) * Number(linearResistance)) as Multiply<TD, TLR>;
}

export function calculateReactance<TD extends number, TLR extends number>(
    distance: TD | undefined,
    linearReactance: TLR | undefined
) {
    if (distance === undefined || isNaN(distance) || linearReactance === undefined || isNaN(linearReactance)) {
        return 0;
    }
    return (Number(distance) * Number(linearReactance)) as Multiply<TD, TLR>;
}

export function computeSwitchedOnValue<TS extends number, TMS extends number, TLSV extends number>(
    sectionCount: TS,
    maximumSectionCount: TMS,
    linkedSwitchedOnValue: TLSV
) {
    return ((linkedSwitchedOnValue / maximumSectionCount) * sectionCount) as Multiply<Divide<TS, TMS>, TLSV>;
}

export function computeMaxQAtNominalV<TS extends number, TV extends number>(maxSusceptance: TS, nominalVoltage: TV) {
    return Math.abs(maxSusceptance * Math.pow(nominalVoltage, 2)) as Abs<Multiply<TS, Pow<TV, 2>>>;
}

export function computeMaxSusceptance<TQ extends number, TV extends number>(maxQAtNominalV: TQ, nominalVoltage: TV) {
    return Math.abs(maxQAtNominalV / Math.pow(nominalVoltage, 2)) as Abs<Divide<TQ, Pow<TV, 2>>>;
}

export function calculateSusceptance<TD extends number, TLC extends number>(
    distance: TD | undefined,
    linearCapacity: TLC | undefined
) {
    if (distance === undefined || isNaN(distance) || linearCapacity === undefined || isNaN(linearCapacity)) {
        return 0;
    }
    return (Number(distance) * Number(linearCapacity) * 2 * Math.PI * 50 * Math.pow(10, 6)) as Multiply<
        TD,
        Multiply<TLC, Multiply<2, Multiply<PI, Multiply<50, Pow<10, 6>>>>>
    >;
}

export function replaceAllDefaultValues<TValue>(arrayParams: any[], oldValue: TValue, newValue: TValue): any[] {
    return arrayParams?.reduce(
        (accumulator, current) => [
            ...accumulator,
            {
                ...current,
                defaultValue: current.defaultValue === oldValue ? newValue : current.defaultValue,
            },
        ],
        []
    );
}

export function getNewVoltageLevelOptions(
    formattedVoltageLevel: VoltageLevel,
    oldVoltageLevelId: VoltageLevel['id'],
    voltageLevelOptions: VoltageLevel[]
) {
    return [
        ...(formattedVoltageLevel.id === oldVoltageLevelId
            ? voltageLevelOptions.filter((vl) => vl.id !== formattedVoltageLevel.id)
            : voltageLevelOptions.filter((vl) => vl.id !== formattedVoltageLevel.id && vl.id !== oldVoltageLevelId)),
        formattedVoltageLevel,
    ];
}

export function usePrevious<T>(value: T): T {
    const ref = useRef<T>(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

/**
 * Remove elementToToggle from list, or add it if it does not exist yet.
 * <br/>Useful when checking/unchecking checkboxes.
 */
export function toggleElementFromList<T, ID>(elementToToggle: T, list: T[], getFieldId: (element: T) => ID) {
    const resultList = [...list];
    const elementToToggleIndex = resultList.findIndex((element) => getFieldId(element) === getFieldId(elementToToggle));
    if (elementToToggleIndex >= 0) {
        resultList.splice(elementToToggleIndex, 1);
    } else {
        resultList.push(elementToToggle);
    }
    return resultList;
}

/**
 * Compare two string ignoring the letter cases
 * @return number {@link String.localeCompare} output: 0 if equals, else 1
 */
export const comparatorStrIgnoreCase = (str1: string, str2: string, ignoreAccent: boolean = false) =>
    str1.localeCompare(str2, undefined, { sensitivity: ignoreAccent ? 'base' : 'accent' });
