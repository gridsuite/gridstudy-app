/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import {
    ACTIVE_POWER_SETPOINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_NAME,
    ID,
    LOAD_TYPE,
    MEASUREMENT_P,
    MEASUREMENT_Q,
    REACTIVE_POWER_SET_POINT,
    STATE_ESTIMATION,
    VOLTAGE_LEVEL,
} from '../../../../utils/field-constants';
import { MeasurementInfo } from '../../common/measurements/measurement.type';
import { AttributeModification, FieldConstants, Property } from '@gridsuite/commons-ui';

export type LoadModificationSchemaForm = {
    [EQUIPMENT_NAME]?: string;
    [LOAD_TYPE]?: string | null;
    [ACTIVE_POWER_SETPOINT]?: number | null;
    [REACTIVE_POWER_SET_POINT]?: number | null;
    [CONNECTIVITY]: {
        [VOLTAGE_LEVEL]: { [ID]?: string };
        [BUS_OR_BUSBAR_SECTION]: { [ID]?: string };
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };
    [STATE_ESTIMATION]?: {
        [MEASUREMENT_P]?: MeasurementInfo;
        [MEASUREMENT_Q]?: MeasurementInfo;
    };
    // Properties
    [FieldConstants.ADDITIONAL_PROPERTIES]?: Property[];
};

export interface LoadModificationInfos {
    uuid: string;
    equipmentType: EQUIPMENT_TYPES;
    equipmentId: string;
    equipmentName: AttributeModification<string>;
    loadType: AttributeModification<string>;
    p0: AttributeModification<number>;
    q0: AttributeModification<number>;
    voltageLevelId: AttributeModification<string>;
    busOrBusbarSectionId: AttributeModification<string>;
    connectionDirection: AttributeModification<string>;
    connectionName?: AttributeModification<string>;
    connectionPosition?: AttributeModification<number>;
    terminalConnected?: AttributeModification<boolean>;
    properties?: Property[];
}
