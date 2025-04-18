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
    [EQUIPMENT_TYPES.SUBSTATION]: 'Substation',
    [EQUIPMENT_TYPES.SWITCH]: 'Switch',
    [EQUIPMENT_TYPES.DISCONNECTOR]: 'Disconnector',
    [EQUIPMENT_TYPES.BREAKER]: 'Breaker',
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: 'VoltageLevel',
    [EQUIPMENT_TYPES.BUSBAR_SECTION]: 'BusbarSection',
    [EQUIPMENT_TYPES.BATTERY]: 'Battery',
    [EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR]: 'StaticVarCompensator',
    [EQUIPMENT_TYPES.DANGLING_LINE]: 'DanglingLine',
    [EQUIPMENT_TYPES.HVDC_CONVERTER_STATION]: 'HvdcConverterStation',
    [EQUIPMENT_TYPES.VSC_CONVERTER_STATION]: 'VscConverterStation',
    [EQUIPMENT_TYPES.LCC_CONVERTER_STATION]: 'LccConverterStation',
    [EQUIPMENT_TYPES.TIE_LINE]: 'TieLine',
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: 'ShuntCompensator',
};
