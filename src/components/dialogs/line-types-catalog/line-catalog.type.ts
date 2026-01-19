/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

type AerialLineTypeInfo = {
    conductorsNumber: number;
    circuitsNumber: number;
    groundWiresNumber: number;
};
type UndergroundLineTypeInfo = {
    insulator: string;
    screen: string;
};
// DTO received from back-end
export type LineTypeInfo = {
    id: string;
    type: string;
    category: 'AERIAL' | 'UNDERGROUND';
    voltage: number;
    conductorType: string;
    section: number;
    linearResistance: number;
    linearReactance: number;
    linearCapacity: number;
    limitsForLineType: CurrentLimitsInfo[];
    shapeFactors: number[];
} & (AerialLineTypeInfo | UndergroundLineTypeInfo);

// Interface with Line creation/modification
export type ComputedLineCharacteristics = {
    totalResistance: number;
    totalReactance: number;
    totalSusceptance: number;
    finalCurrentLimits: CurrentLimitsInfo[];
};

export type CurrentLimitsInfo = {
    limitSetName: string;
    permanentLimit: number;
    temporaryLimitValue: number;
    temporaryLimitAcceptableDuration: number;
    temporaryLimitName: string;
    area: string;
    temperature: string;
};

export const CATEGORIES_TABS = {
    AERIAL: { id: 0, name: 'AERIAL' },
    UNDERGROUND: { id: 1, name: 'UNDERGROUND' },
} as const;
