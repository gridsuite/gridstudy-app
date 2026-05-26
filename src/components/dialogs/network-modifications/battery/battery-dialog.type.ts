/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ActivePowerControlInfos,
    ConnectablePositionFormInfos,
    FieldConstants,
    MeasurementInfo,
    MinMaxReactiveLimitsFormInfos,
    Property,
    ReactiveCapabilityCurvePoints,
    ShortCircuitInfos,
} from '@gridsuite/commons-ui';

export type BatteryDialogSchemaBaseForm = {
    [FieldConstants.EQUIPMENT_NAME]?: string;
    [FieldConstants.MAXIMUM_ACTIVE_POWER]: number | null;
    [FieldConstants.MINIMUM_ACTIVE_POWER]: number | null;
    [FieldConstants.REACTIVE_POWER_SET_POINT]?: number | null;
    [FieldConstants.ACTIVE_POWER_SET_POINT]?: number | null;
    [FieldConstants.CONNECTIVITY]: {
        [FieldConstants.VOLTAGE_LEVEL]: { [FieldConstants.ID]?: string };
        [FieldConstants.BUS_OR_BUSBAR_SECTION]: { [FieldConstants.ID]?: string };
        [FieldConstants.CONNECTION_DIRECTION]?: string;
        [FieldConstants.CONNECTION_NAME]?: string;
        [FieldConstants.CONNECTION_POSITION]?: number;
        [FieldConstants.CONNECTED]?: boolean;
    };
    [FieldConstants.FREQUENCY_REGULATION]?: boolean | null;
    [FieldConstants.DROOP]?: number | null;
    [FieldConstants.REACTIVE_LIMITS]: {
        [FieldConstants.MINIMUM_REACTIVE_POWER]?: number | null;
        [FieldConstants.MAXIMUM_REACTIVE_POWER]?: number | null;
        [FieldConstants.REACTIVE_CAPABILITY_CURVE_CHOICE]: string | null;
        [FieldConstants.REACTIVE_CAPABILITY_CURVE_TABLE]?: ReactiveCapabilityCurvePoints[];
    };
    // Properties
    [FieldConstants.ADDITIONAL_PROPERTIES]?: Property[];
    [FieldConstants.TRANSFORMER_REACTANCE]?: number | null;
    [FieldConstants.TRANSIENT_REACTANCE]?: number | null;
};

export type BatteryModificationDialogSchemaForm = {
    [FieldConstants.STATE_ESTIMATION]?: {
        [FieldConstants.MEASUREMENT_P]?: MeasurementInfo;
        [FieldConstants.MEASUREMENT_Q]?: MeasurementInfo;
    };
} & Partial<BatteryDialogSchemaBaseForm>;

export interface BatteryFormInfos {
    id: string;
    name: string;
    maxP: number;
    minP: number;
    targetP: number;
    targetQ: number;
    connectablePosition: ConnectablePositionFormInfos;
    minMaxReactiveLimits: MinMaxReactiveLimitsFormInfos;
    activePowerControl: ActivePowerControlInfos;
    batteryShortCircuit: ShortCircuitInfos;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[];
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition: string | null;
    terminalConnected?: boolean | null;
    measurementP: MeasurementInfo | undefined;
    measurementQ: MeasurementInfo | undefined;
    properties: Record<string, string> | undefined;
}
