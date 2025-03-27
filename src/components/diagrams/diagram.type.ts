/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum ViewState {
    PINNED = 'pinned',
    MINIMIZED = 'minimized',
    OPENED = 'opened',
}

export enum SubstationLayout {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
    SMART = 'smart',
    SMARTHORIZONTALCOMPACTION = 'smartHorizontalCompaction',
    SMARTVERTICALCOMPACTION = 'smartVerticalCompaction',
}

export enum DiagramType {
    VOLTAGE_LEVEL = 'voltage-level',
    SUBSTATION = 'substation',
    NETWORK_AREA_DIAGRAM = 'network-area-diagram',
    NAD_FROM_CONFIG = 'nad-from-config',
}

export type NAD = DiagramType.NETWORK_AREA_DIAGRAM | DiagramType.NAD_FROM_CONFIG;

export function isNadType(type: DiagramType): type is NAD {
    return type === DiagramType.NETWORK_AREA_DIAGRAM || type === DiagramType.NAD_FROM_CONFIG;
}

export type SLD = DiagramType.VOLTAGE_LEVEL | DiagramType.SUBSTATION;

export function isSldType(type: DiagramType): type is NAD {
    return type === DiagramType.VOLTAGE_LEVEL || type === DiagramType.SUBSTATION;
}
