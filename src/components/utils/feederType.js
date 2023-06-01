/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from './equipment-types';

const equipmentTypesWithTypeOnly = Object.fromEntries(
    Object.entries(EQUIPMENT_TYPES).map(([key, value]) => [
        key,
        { type: value.type },
    ])
);

export const FEEDER_TYPES = {
    ...equipmentTypesWithTypeOnly,
    /**
     * these are ComponentTypeNames from powsybl-single-line-diagram but we put them here because some ComponentTypeNames are also EquipmentsNames
     */
    CAPACITOR: {
        type: 'CAPACITOR',
    },
    INDUCTOR: {
        type: 'INDUCTOR',
    },
    TWO_WINDINGS_TRANSFORMER_LEG: {
        type: 'TWO_WINDINGS_TRANSFORMER_LEG',
    },
    PHASE_SHIFT_TRANSFORMER: {
        type: 'PHASE_SHIFT_TRANSFORMER',
    },
    THREE_WINDINGS_TRANSFORMER_LEG: {
        type: 'THREE_WINDINGS_TRANSFORMER_LEG',
    },
};
