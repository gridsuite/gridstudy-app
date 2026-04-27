/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVE_POWER_SET_POINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    ID,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_LEVEL,
} from '../../../utils/field-constants';
import {
    ActivePowerControlInfos,
    ConnectablePositionFormInfos,
    FieldConstants,
    MinMaxReactiveLimitsFormInfos,
    Property,
    ReactiveCapabilityCurvePoints,
    ShortCircuitInfos,
} from '@gridsuite/commons-ui';

export type BatteryDialogSchemaBaseForm = {
    [EQUIPMENT_NAME]?: string;
    [FieldConstants.MAXIMUM_ACTIVE_POWER]: number | null;
    [FieldConstants.MINIMUM_ACTIVE_POWER]: number | null;
    [REACTIVE_POWER_SET_POINT]?: number | null;
    [ACTIVE_POWER_SET_POINT]?: number | null;
    [CONNECTIVITY]: {
        [VOLTAGE_LEVEL]: { [ID]?: string };
        [BUS_OR_BUSBAR_SECTION]: { [ID]?: string };
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
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

export type BatteryCreationDialogSchemaForm = { [EQUIPMENT_ID]: string } & BatteryDialogSchemaBaseForm;

export type BatteryModificationDialogSchemaForm = Partial<BatteryDialogSchemaBaseForm>;

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
    properties: Record<string, string> | undefined;
}
