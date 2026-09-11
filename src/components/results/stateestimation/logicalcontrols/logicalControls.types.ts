/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum MeasurementType {
    ACTIVE_TRANSIT = 'ACTIVE_TRANSIT',
    ACTIVE_TRANSIT_ORIGIN = 'ACTIVE_TRANSIT_ORIGIN',
    ACTIVE_TRANSIT_EXTREMITY = 'ACTIVE_TRANSIT_EXTREMITY',
    REACTIVE_TRANSIT = 'REACTIVE_TRANSIT',
    REACTIVE_TRANSIT_ORIGIN = 'REACTIVE_TRANSIT_ORIGIN',
    REACTIVE_TRANSIT_EXTREMITY = 'REACTIVE_TRANSIT_EXTREMITY',
    ACTIVE_PRODUCTION = 'ACTIVE_PRODUCTION',
    REACTIVE_PRODUCTION = 'REACTIVE_PRODUCTION',
    ACTIVE_LOAD = 'ACTIVE_LOAD',
    REACTIVE_LOAD = 'REACTIVE_LOAD',
}

export enum StatusType {
    SWITCHING_DEVICE = 'SWITCHING_DEVICE',
    HVDC_POLES_COUNT = 'HVDC_POLES_COUNT',
}

export enum LimitType {
    PMIN = 'PMIN',
    PMAX = 'PMAX',
    QMIN = 'QMIN',
    QMAX = 'QMAX',
}

export interface BoucherotBalance {
    activeBalance: number;
    reactiveBalance: number;
    activeValidity: boolean;
    reactiveValidity: boolean;
    voltageLevelName: string;
    nominalVoltage: number;
}

export interface InvalidMeasurement {
    measurementType: MeasurementType;
    value: number;
    voltageLevelName: string;
    nominalVoltage: number;
    statusType: StatusType;
}

export interface OriginExtremityDeviation {
    measurementType: MeasurementType;
    originMeasurement: number;
    extremityMeasurement: number;
    deviation: number;
    voltageLevelName: string;
    nominalVoltage: number;
}

export interface OutOfBoundsMeasurement {
    limitType: LimitType;
    threshold: number;
    value: number;
    deviation: number;
    voltageLevelName: string;
    nominalVoltage: number;
}

export interface VoltageDeviation {
    minBusbarSection: string;
    minBusbarSectionValue: number;
    maxBusbarSection: string;
    maxBusbarSectionValue: number;
    deviation: number;
    voltageLevelName: string;
    nominalVoltage: number;
}

// maps the back-end DTO
export interface LogicalControlsResult {
    balances: Record<string, BoucherotBalance>;
    nonZeroMeasurementsOnDisconnected: Record<string, InvalidMeasurement[]>;
    zeroMeasurementsOnConnected: Record<string, InvalidMeasurement[]>;
    originExtremityDeviations: Record<string, OriginExtremityDeviation[]>;
    outOfBoundsMeasurements: Record<string, OutOfBoundsMeasurement[]>;
    voltageDeviations: Record<string, VoltageDeviation>;
}
