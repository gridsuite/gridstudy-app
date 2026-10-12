/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LOAD_TYPES, UNDEFINED_LOAD_TYPE } from '@gridsuite/commons-ui';

export const FORM_LOADING_DELAY = 200;

// For load tabular creations/modifications, we allow the UNDEFINED value
export const LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION = [
    ...LOAD_TYPES,
    { id: UNDEFINED_LOAD_TYPE, label: 'Undefined' },
] as const;

export const SLD_DISPLAY_MODE = {
    FEEDER_POSITION: 'FEEDER_POSITION',
    STATE_VARIABLE: 'STATE_VARIABLE',
} as const;

export const BRANCH_SIDE = {
    ONE: 'ONE',
    TWO: 'TWO',
} as const;

export const OPERATING_STATUS_ACTION = {
    LOCKOUT: 'LOCKOUT',
    TRIP: 'TRIP',
    ENERGISE_END_ONE: 'ENERGISE_END_ONE',
    ENERGISE_END_TWO: 'ENERGISE_END_TWO',
    SWITCH_ON: 'SWITCH_ON',
} as const;

export const REGULATING_TERMINAL_TYPES = [
    'LINE',
    'TWO_WINDINGS_TRANSFORMER',
    'GENERATOR',
    'LOAD',
    'BATTERY',
    'SHUNT_COMPENSATOR',
    'STATIC_VAR_COMPENSATOR',
    'BOUNDARY_LINE',
    'HVDC_CONVERTER_STATION',
    'BUSBAR_SECTION',
];

export const NUMBER = 'number';
export const ENUM = 'enum';
export const BOOLEAN = 'boolean';
