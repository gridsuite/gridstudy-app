/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Property } from '../../../common/properties/property-utils';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';

export const LccCreationDialogTab = {
    HVDC_LINE_TAB: 0,
    CONVERTER_STATION_1: 1,
    CONVERTER_STATION_2: 2,
};

export interface LccCreationInfos {
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
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
    properties?: Property[];
}

interface ConnectablePositionInfos {
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
}

export interface LccFormInfos {
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
