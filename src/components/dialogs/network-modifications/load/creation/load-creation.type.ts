/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import {
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    ID,
    LOAD_TYPE,
    NAME,
    P0,
    Q0,
    VOLTAGE_LEVEL,
} from '../../../../utils/field-constants';
import { Property } from '../../common/properties/property-utils';

export type LoadCreationSchemaForm = {
    [EQUIPMENT_ID]: string;
    [EQUIPMENT_NAME]?: string;
    [LOAD_TYPE]?: string;
    [P0]: number;
    [Q0]: number;
    [CONNECTIVITY]: {
        [VOLTAGE_LEVEL]: { [ID]?: string };
        [BUS_OR_BUSBAR_SECTION]: { [ID]?: string; [NAME]?: string };
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };
    // Properties
    [ADDITIONAL_PROPERTIES]?: Property[];
};

export interface LoadCreationInfos {
    uuid: string;
    equipmentType: EQUIPMENT_TYPES;
    equipmentId: string;
    equipmentName: string;
    loadType: string;
    p0: number;
    q0: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    busbarSectionName?: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: number | null;
    terminalConnected?: boolean | null;
    properties?: Property[];
}

interface ConnectablePositionInfos {
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
}

export interface LoadFormInfos {
    id: string;
    name: string;
    type: string;
    p0: number;
    q0: number;
    voltageLevelId: string;
    connectablePosition: ConnectablePositionInfos;
    busOrBusbarSectionId: string;
    busbarSectionName: string;
    terminalConnected?: boolean | null;
    properties: Record<string, string> | undefined;
}
