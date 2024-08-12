/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from './equipment-types';
import { ValueOf } from 'type-fest';

export const FEEDER_TYPES = {
    ...EQUIPMENT_TYPES,
    /**
     * these are ComponentTypeNames from powsybl-single-line-diagram,
     * but we put them here because some ComponentTypeNames are also EquipmentsNames
     */
    CAPACITOR: 'CAPACITOR',
    INDUCTOR: 'INDUCTOR',
    TWO_WINDINGS_TRANSFORMER_LEG: 'TWO_WINDINGS_TRANSFORMER_LEG',
    PHASE_SHIFT_TRANSFORMER: 'PHASE_SHIFT_TRANSFORMER',
    THREE_WINDINGS_TRANSFORMER_LEG: 'THREE_WINDINGS_TRANSFORMER_LEG',
};
export type FeederTypes = ValueOf<typeof FEEDER_TYPES>;
