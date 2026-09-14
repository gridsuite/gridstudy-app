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

const PROPORTIONAL = { id: 'PROPORTIONAL', label: 'Proportional' } as const;
const REGULAR_DISTRIBUTION = {
    id: 'REGULAR_DISTRIBUTION',
    label: 'RegularDistribution',
} as const;
const VENTILATION = { id: 'VENTILATION', label: 'Ventilation' } as const;
export const ACTIVE_VARIATION_MODES = {
    PROPORTIONAL,
    REGULAR_DISTRIBUTION,
    VENTILATION,
} as const;

export const VARIATION_MODES = {
    PROPORTIONAL,
    PROPORTIONAL_TO_PMAX: {
        id: 'PROPORTIONAL_TO_PMAX',
        label: 'ProportionalToPMax',
    },
    REGULAR_DISTRIBUTION,
    STACKING_UP: { id: 'STACKING_UP', label: 'StackingUp' },
    VENTILATION,
} as const;

export const REACTIVE_VARIATION_MODES = {
    CONSTANT_Q: { id: 'CONSTANT_Q', label: 'ConstantQWithoutUnit' },
    TAN_PHI_FIXED: { id: 'TAN_PHI_FIXED', label: 'TanPhiFixed' },
} as const;

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

export const VARIATION_TYPES = {
    DELTA_P: { id: 'DELTA_P', label: 'DeltaP' },
    TARGET_P: { id: 'TARGET_P', label: 'TargetPText' },
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
