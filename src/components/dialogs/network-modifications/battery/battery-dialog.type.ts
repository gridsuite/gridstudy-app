/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ACTIVE_POWER_SET_POINT,
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FREQUENCY_REGULATION,
    ID,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
} from '../../../utils/field-constants';
import { Property } from '../common/properties/property-utils';
import { ConnectablePositionFormInfos } from '../../connectivity/connectivity.type';
import {
    MinMaxReactiveLimitsFormInfos,
    ReactiveCapabilityCurvePoints,
} from '../../reactive-limits/reactive-limits.type';
import { ActivePowerControlInfos } from '../../active-power-control/active-power-control.type';
import { ShortCircuitFormInfos } from '../../short-circuit/short-circuit-utils';

export type BatteryDialogSchemaBaseForm = {
    [EQUIPMENT_NAME]?: string;
    [MAXIMUM_ACTIVE_POWER]: number | null;
    [MINIMUM_ACTIVE_POWER]: number | null;
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
    [FREQUENCY_REGULATION]?: boolean | null;
    [DROOP]?: number | null;
    [REACTIVE_LIMITS]: {
        [MINIMUM_REACTIVE_POWER]?: number | null;
        [MAXIMUM_REACTIVE_POWER]?: number | null;
        [REACTIVE_CAPABILITY_CURVE_CHOICE]: string | null;
        [REACTIVE_CAPABILITY_CURVE_TABLE]?: ReactiveCapabilityCurvePoints[];
    };
    // Properties
    [ADDITIONAL_PROPERTIES]?: Property[];
    [TRANSFORMER_REACTANCE]?: number | null;
    [TRANSIENT_REACTANCE]?: number | null;
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
    batteryShortCircuit: ShortCircuitFormInfos;
    reactiveCapabilityCurvePoints: ReactiveCapabilityCurvePoints[];
    voltageLevelId: string;
    busOrBusbarSectionId: string;
    connectionDirection: string | null;
    connectionName?: string | null;
    connectionPosition: string | null;
    terminalConnected?: boolean | null;
    properties: Record<string, string> | undefined;
}
