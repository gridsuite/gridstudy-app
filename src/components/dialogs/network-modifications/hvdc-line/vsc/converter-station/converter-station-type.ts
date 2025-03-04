/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface AttributeModification<T> {
    value?: T;
    op: string;
}

interface MinMaxReactiveLimitsData {
    minQ: number | null;
    maxQ: number | null;
}

interface ConnectablePositionInfos {
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: number | null;
}

export interface ReactiveCapabilityCurvePointsData {
    p?: number | null;
    maxQ?: number | null;
    minQ?: number | null;
}

export interface ConverterStationElementInfos {
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
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePointsData[];
    minMaxReactiveLimits: MinMaxReactiveLimitsData | null;
    connectablePositionInfos: ConnectablePositionInfos;
    reactivePower?: number;
    voltageRegulationOn?: boolean;
    voltage?: number;
}

// the backend return a converterStationElementInfo.reactiveCapabilityCurvePoints
// but the form define rename is to reactiveCapabilityCurveTable
// may be we should refactor the forms in Battery , generator and converter station to use the same name
export type ConverterStationElementModificationInfos = Omit<
    ConverterStationElementInfos,
    'reactiveCapabilityCurvePoints'
> & { reactiveCapabilityCurveTable: ReactiveCapabilityCurvePointsData[] };

export interface ReactiveCapabilityCurvePoint {
    p: number | null;
    oldP: number | null;
    minQ: number | null;
    oldMinQ: number | null;
    maxQ: number | null;
    oldMaxQ: number | null;
}
