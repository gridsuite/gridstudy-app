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
    nominalV: number;
    r: number;
    maxP: number;
    convertersMode: string;
    activePowerSetpoint: number;
    converterStation1: LccConverterStationInfos;
    converterStation2: LccConverterStationInfos;
    properties?: Property[];
}

export interface LccConverterStationInfos {
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    terminalConnected: boolean;
    connectablePosition: ConnectablePositionInfos;
    mcsOnSide: FilterMcsTable[];
}

interface ConnectablePositionInfos {
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition?: string | null;
    terminalConnected?: boolean | null;
}

export interface FilterMcsTable {
    shuntCompensatorName?: string | null;
    shuntCompensatorId: string;
    maxQAtNominalV: number;
    connectedToHvdc: boolean;
}

export interface Connectivity {
    voltageLevel: { id?: string };
    busOrBusbarSection: { id?: string; name?: string };
    connectionDirection?: string;
    connectionName?: string;
    connectionPosition?: number;
    terminalConnected?: boolean;
}

export interface McsOnSide {
    id: string;
    name?: string | null;
    maxQAtNominalV: number;
    connectedToHvdc: boolean;
}

export interface LccConverterStationFormInfos {
    id: string;
    name: string | null;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    terminalConnected: boolean;
    connectablePosition: ConnectablePositionInfos;
    mcsOnSide: McsOnSide[];
}

export interface LccFormInfos {
    id: string;
    name: string;
    nominalV: number;
    r: number;
    maxP: number;
    convertersMode: string;
    activePowerSetpoint: number;
    lccConverterStation1: LccConverterStationFormInfos;
    lccConverterStation2: LccConverterStationFormInfos;
    properties: Record<string, string> | undefined;
}
