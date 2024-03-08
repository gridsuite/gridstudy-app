/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RootNode from '../nodes/root-node';
import NetworkModificationNode from '../nodes/network-modification-node';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';

export const nodeTypes = {
    ROOT: RootNode,
    NETWORK_MODIFICATION: NetworkModificationNode,
};

export const nodeWidth = 180;
export const nodeHeight = 60;
export const rootNodeWidth = 40;
export const rootNodeHeight = 40;

// used to generate translation combined keys with a prefix/suffix for each equipment type
// for example `${EventType.DISCONNECT}${EQUIPMENT_TYPE_LABEL_KEYS[EQUIPMENT_TYPES.BUS]}` => 'DisconnectBus'
export const EQUIPMENT_TYPE_LABEL_KEYS = {
    [EQUIPMENT_TYPES.LINE]: 'Line',
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: '2WTransformer',
    [EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER]: '3WTransformer',
    [EQUIPMENT_TYPES.HVDC_LINE]: 'HvdcLine',
    [EQUIPMENT_TYPES.LOAD]: 'Load',
    [EQUIPMENT_TYPES.GENERATOR]: 'Generator',
    [EQUIPMENT_TYPES.BUS]: 'Bus',
};
