/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    MAX_P,
    NOMINAL_V,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
    R,
} from '../../../../utils/field-constants';
import { VscConverterStation, VscConverterStationFormInfos } from './converter-station/converter-station-type';
import { Property } from '@gridsuite/commons-ui';

export type VscDialogSchemaBaseForm = {
    [EQUIPMENT_NAME]?: string;
    [HVDC_LINE_TAB]: {
        [NOMINAL_V]: number | null;
        [R]: number | null;
        [MAX_P]: number | null;
        [OPERATOR_ACTIVE_POWER_LIMIT_SIDE1]?: number;
        [OPERATOR_ACTIVE_POWER_LIMIT_SIDE2]?: number;
        [CONVERTERS_MODE]: string;
        [ANGLE_DROOP_ACTIVE_POWER_CONTROL]?: boolean;
        [ACTIVE_POWER_SETPOINT]: number | null;
        [P0]: number | null;
        [DROOP]: number | null;
    };
    [CONVERTER_STATION_1]: VscConverterStation;
    [CONVERTER_STATION_2]: VscConverterStation;
    // Properties
    [ADDITIONAL_PROPERTIES]?: Property[];
};

export type VscCreationDialogSchemaForm = { [EQUIPMENT_ID]: string } & VscDialogSchemaBaseForm;

export interface VscFormInfos {
    id: string;
    name: string;
    nominalV?: number;
    r?: number;
    activePowerSetpoint?: number;
    maxP?: number;
    convertersMode?: string;
    operatingStatus?: string;
    converterStation1?: VscConverterStationFormInfos;
    converterStation2?: VscConverterStationFormInfos;
    hvdcAngleDroopActivePowerControl?: HvdcAngleDroopActivePowerControlInfos;
    hvdcOperatorActivePowerRange?: HvdcOperatorActivePowerRangeInfos;
    properties?: Record<string, string>;
}

export interface HvdcAngleDroopActivePowerControlInfos {
    droop?: number;
    isEnabled?: boolean;
    p0?: number;
}
export interface HvdcOperatorActivePowerRangeInfos {
    oprFromCS1toCS2?: number;
    oprFromCS2toCS1?: number;
}
