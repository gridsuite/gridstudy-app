/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    ID,
    LOSS_FACTOR,
    REACTIVE_POWER,
    VOLTAGE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_ON,
} from '../../../../../utils/field-constants';
import {
    ConnectablePositionInfos,
    FieldConstants,
    MinMaxReactiveLimitsFormInfos,
    ReactiveCapabilityCurvePoints,
} from '@gridsuite/commons-ui';

export interface VscConverterStationFormInfos {
    id: string;
    name: string | null;
    lossFactor: number;
    voltageSetpoint: number | null;
    reactivePowerSetpoint: number | null;
    voltageRegulatorOn: boolean;
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    nominalV: number;
    terminalConnected: boolean;
    p: number | null;
    q: number | null;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[];
    minMaxReactiveLimits: MinMaxReactiveLimitsFormInfos | null;
    connectablePosition: ConnectablePositionInfos;
    reactivePower?: number;
    voltageRegulationOn?: boolean;
    voltage?: number;
}

// the backend return a converterStationElementInfo.reactiveCapabilityCurvePoints
// but the form define rename is to reactiveCapabilityCurveTable
// may be we should refactor the forms in Battery , generator and converter station to use the same name
export type ConverterStationElementModificationInfos = Omit<
    VscConverterStationFormInfos,
    'reactiveCapabilityCurvePoints'
> & { reactiveCapabilityCurveTable: ReactiveCapabilityCurvePoints[] };

export type VscConverterStation = {
    [CONVERTER_STATION_ID]: string | null;
    [CONVERTER_STATION_NAME]?: string;
    [LOSS_FACTOR]: number | null;
    [VOLTAGE_REGULATION_ON]?: boolean;
    [REACTIVE_POWER]: number | null;
    [VOLTAGE]: number | null;
    [CONNECTIVITY]?: {
        [VOLTAGE_LEVEL]: { [ID]?: string };
        [BUS_OR_BUSBAR_SECTION]: { [ID]?: string };
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };
    [FieldConstants.REACTIVE_LIMITS]?: {
        [FieldConstants.MINIMUM_REACTIVE_POWER]?: number;
        [FieldConstants.MAXIMUM_REACTIVE_POWER]?: number;
        [FieldConstants.REACTIVE_CAPABILITY_CURVE_CHOICE]: string;
        [FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE]?: ReactiveCapabilityCurvePoints[];
    };
};
