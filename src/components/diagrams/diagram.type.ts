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
}
