/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import RootNode from '../nodes/root-node';
import NetworkModificationNode from '../nodes/network-modification-node';
import { EquipmentType } from '@gridsuite/commons-ui';
import { LabeledGroupNode } from '../nodes/labeled-group-node';
import { LABELED_GROUP_TYPE } from '../nodes/labeled-group-node.type';

export const nodeTypes = {
    ROOT: RootNode,
    NETWORK_MODIFICATION: NetworkModificationNode,
    [LABELED_GROUP_TYPE]: LabeledGroupNode,
};

// used to generate translation combined keys with a prefix/suffix for each equipment type
// for example `${EventType.DISCONNECT}${EQUIPMENT_TYPE_LABEL_KEYS[EquipmentType.BUS]}` => 'DisconnectBus'
export const EQUIPMENT_TYPE_LABEL_KEYS: Record<EquipmentType, string> = {
    [EquipmentType.LINE]: 'Line',
    [EquipmentType.TWO_WINDINGS_TRANSFORMER]: '2WTransformer',
    [EquipmentType.THREE_WINDINGS_TRANSFORMER]: '3WTransformer',
    [EquipmentType.HVDC_LINE]: 'HvdcLine',
    [EquipmentType.LOAD]: 'Load',
    [EquipmentType.GENERATOR]: 'Generator',
    [EquipmentType.BUS]: 'Bus',
    [EquipmentType.SUBSTATION]: 'Substation',
    [EquipmentType.SWITCH]: 'Switch',
    [EquipmentType.DISCONNECTOR]: 'Disconnector',
    [EquipmentType.BREAKER]: 'Breaker',
    [EquipmentType.VOLTAGE_LEVEL]: 'VoltageLevel',
    [EquipmentType.BUSBAR_SECTION]: 'BusbarSection',
    [EquipmentType.BATTERY]: 'Battery',
    [EquipmentType.STATIC_VAR_COMPENSATOR]: 'StaticVarCompensator',
    [EquipmentType.DANGLING_LINE]: 'DanglingLine',
    [EquipmentType.HVDC_CONVERTER_STATION]: 'HvdcConverterStation',
    [EquipmentType.VSC_CONVERTER_STATION]: 'VscConverterStation',
    [EquipmentType.LCC_CONVERTER_STATION]: 'LccConverterStation',
    [EquipmentType.TIE_LINE]: 'TieLine',
    [EquipmentType.SHUNT_COMPENSATOR]: 'ShuntCompensator',
};
