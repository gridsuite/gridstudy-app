/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const SUBSTATION_RADIUS = 500;
export const SUBSTATION_RADIUS_MAX_PIXEL = 5;
export const SUBSTATION_RADIUS_MIN_PIXEL = 1;

// Relevant LoadType Powsybl enum values
export const LOAD_TYPES = [
    { id: 'AUXILIARY', label: 'Auxiliary' },
    { id: 'FICTITIOUS', label: 'Fictitious' },
];
// and the undefined/default one (not displayed)
export const UNDEFINED_LOAD_TYPE = 'UNDEFINED';

// Relevant EnergySource Powsybl enum values
export const ENERGY_SOURCES = [
    { id: 'HYDRO', label: 'Hydro' },
    { id: 'NUCLEAR', label: 'Nuclear' },
    { id: 'WIND', label: 'Wind' },
    { id: 'THERMAL', label: 'Thermal' },
    { id: 'SOLAR', label: 'Solar' },
    { id: 'OTHER', label: 'Other' },
];

export const REGULATION_TYPES = {
    DISTANT: { id: 'DISTANT', label: 'Distant' },
    LOCAL: { id: 'LOCAL', label: 'Local' },
};

export const UPDATE_TYPE = [
    'creatingInProgress',
    'updatingInProgress',
    'deletingInProgress',
];

export const REGULATION_MODES = {
    FIXED_TAP: { id: 'FIXED_TAP', label: 'FixedTap' },
    CURRENT_LIMITER: { id: 'CURRENT_LIMITER', label: 'CurrentLimiter' },
    ACTIVE_POWER_CONTROL: {
        id: 'ACTIVE_POWER_CONTROL',
        label: 'PhaseActivePowerControl',
    },
};

export const SIDE = {
    SIDE1: { id: 'SIDE1', label: 'RegulatedSide1' },
    SIDE2: { id: 'SIDE2', label: 'RegulatedSide2' },
};

// Relevant ConnectablePosition.Direction Powsybl enum values
export const CONNECTION_DIRECTIONS = [
    { id: 'TOP', label: 'Top' },
    { id: 'BOTTOM', label: 'Bottom' },
];
// and the undefined/default one (not displayed)
export const UNDEFINED_CONNECTION_DIRECTION = 'UNDEFINED';

export function getEnergySourceLabel(energySourceId) {
    return ENERGY_SOURCES.find(({ id }) => id === energySourceId)?.label;
}

export const REACTIVE_LIMIT_TYPES = [
    { id: 'MINMAX', label: 'ReactiveLimitsKindMinMax' },
    { id: 'CURVE', label: 'ReactiveLimitsKindCurve' },
];

export const ACTIVE_VARIATION_MODE = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    { id: 'REGULAR_DISTRIBUTION', label: 'RegularDistribution' },
    { id: 'VENTILATION', label: 'Ventilation' },
];

export const REACTIVE_VARIATION_MODE = [
    { id: 'CONSTANT_Q', label: 'ConstantQWithoutUnit' },
    // to add later after correcting implementation in the backend (Powsybl)
    // { id: 'TAN_PHI_FIXED', label: 'TanPhiFixed' },
];

export function getLoadTypeLabel(loadTypeId) {
    return LOAD_TYPES.find(({ id }) => id === loadTypeId)?.label;
}

export const SLD_DISPLAY_MODE = {
    FEEDER_POSITION: 'FEEDER_POSITION',
    STATE_VARIABLE: 'STATE_VARIABLE',
};

export const BRANCH_SIDE = {
    ONE: 'ONE',
    TWO: 'TWO',
};

export const BRANCH_STATUS_ACTION = {
    LOCKOUT: 'LOCKOUT',
    TRIP: 'TRIP',
    ENERGISE_END_ONE: 'ENERGISE_END_ONE',
    ENERGISE_END_TWO: 'ENERGISE_END_TWO',
    SWITCH_ON: 'SWITCH_ON',
};

export const MODIFICATION_TYPE = {
    GROOVY_SCRIPT: 'GROOVY_SCRIPT',
    LOAD_CREATION: 'LOAD_CREATION',
    LOAD_MODIFICATION: 'LOAD_MODIFICATION',
    GENERATOR_CREATION: 'GENERATOR_CREATION',
    GENERATOR_MODIFICATION: 'GENERATOR_MODIFICATION',
    LINE_CREATION: 'LINE_CREATION',
    SUBSTATION_CREATION: 'SUBSTATION_CREATION',
    VOLTAGE_LEVEL_CREATION: 'VOLTAGE_LEVEL_CREATION',
    SHUNT_COMPENSATOR_CREATION: 'SHUNT_COMPENSATOR_CREATION',
    TWO_WINDINGS_TRANSFORMER_CREATION: 'TWO_WINDINGS_TRANSFORMER_CREATION',
    EQUIPMENT_DELETION: 'EQUIPMENT_DELETION',
    LINE_SPLIT_WITH_VOLTAGE_LEVEL: 'LINE_SPLIT_WITH_VOLTAGE_LEVEL',
    LINE_ATTACH_TO_VOLTAGE_LEVEL: 'LINE_ATTACH_TO_VOLTAGE_LEVEL',
    LINES_ATTACH_TO_SPLIT_LINES: 'LINES_ATTACH_TO_SPLIT_LINES',
    BRANCH_STATUS_MODIFICATION: 'BRANCH_STATUS_MODIFICATION',
    EQUIPMENT_ATTRIBUTE_MODIFICATION: 'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    GENERATOR_SCALING: 'GENERATOR_SCALING',
    LOAD_SCALING: 'LOAD_SCALING',
    DELETE_VOLTAGE_LEVEL_ON_LINE: 'DELETE_VOLTAGE_LEVEL_ON_LINE',
    DELETE_ATTACHING_LINE: 'DELETE_ATTACHING_LINE',
};

export const VARIATION_TYPE = [
    { id: 'DELTA_P', label: 'DeltaP' },
    { id: 'TARGET_P', label: 'TargetPText' },
];

export const VARIATION_MODE = [
    { id: 'PROPORTIONAL', label: 'Proportional' },
    {
        id: 'PROPORTIONAL_TO_PMAX',
        label: 'ProportionalToPMax',
    },
    {
        id: 'REGULAR_DISTRIBUTION',
        label: 'RegularDistribution',
    },
    { id: 'STACKING_UP', label: 'StackingUp' },
    { id: 'VENTILATION', label: 'Ventilation' },
];
