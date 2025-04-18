/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Property } from '../../../common/properties/property-utils';
import { EQUIPMENT_TYPES } from '../../../../../utils/equipment-types';
import { ConnectablePositionInfos } from '../../../../connectivity/connectivity.type';

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
    converterStation1: LccConverterStationCreationInfos;
    converterStation2: LccConverterStationCreationInfos;
    properties?: Property[];
}

export interface LccConverterStationCreationInfos {
    equipmentId: string;
    equipmentName: string | null;
    lossFactor: number;
    powerFactor: number;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    terminalConnected: boolean;
    connectionDirection: string | null;
    connectionName: string | null;
    connectionPosition: number | null;
    shuntCompensatorsOnSide: ShuntCompensatorInfos[];
}

export interface ShuntCompensatorInfos {
    id: string;
    name?: string | null;
    maxQAtNominalV: number;
    connectedToHvdc?: boolean;
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
    shuntCompensatorsOnSide: ShuntCompensatorInfos[];
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
    properties?: Record<string, string>;
}

// this type used instead of ShuntCompensatorInfos because RHF uses 'id' to manage array, see useFieldArray
export interface ShuntCompensatorFormSchema {
    shuntCompensatorId: string;
    shuntCompensatorName?: string | null;
    maxQAtNominalV: number;
    connectedToHvdc?: boolean;
}
