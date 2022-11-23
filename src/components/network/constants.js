/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const SUBSTATION_RADIUS = 500;
export const SUBSTATION_RADIUS_MAX_PIXEL = 5;
export const SUBSTATION_RADIUS_MIN_PIXEL = 1;

export const LOAD_TYPES = [
    { id: 'UNDEFINED', label: 'UndefinedDefaultValue' },
    { id: 'AUXILIARY', label: 'Auxiliary' },
    { id: 'FICTITIOUS', label: 'Fictitious' },
];

export const ENERGY_SOURCES = [
    { id: 'HYDRO', label: 'Hydro' },
    { id: 'NUCLEAR', label: 'Nuclear' },
    { id: 'WIND', label: 'Wind' },
    { id: 'THERMAL', label: 'Thermal' },
    { id: 'SOLAR', label: 'Solar' },
    { id: 'OTHER', label: 'Other' },
];

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

export const CONNECTION_DIRECTION = [
    { id: '', label: 'None' },
    { id: 'TOP', label: 'Top' },
    { id: 'BOTTOM', label: 'Bottom' },
];

export function getEnergySourceLabel(energySourceId) {
    return ENERGY_SOURCES.find(({ id }) => id === energySourceId)?.label;
}
