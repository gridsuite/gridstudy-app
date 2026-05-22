/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS_CHOICE,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_NAME,
    ID,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MEASUREMENT_Q,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    STATE_ESTIMATION,
    SWITCHED_ON_Q_AT_NOMINAL_V,
    SWITCHED_ON_SUSCEPTANCE,
    VOLTAGE_LEVEL,
} from '../../../utils/field-constants';
import { FieldConstants, MeasurementInfo, Property } from '@gridsuite/commons-ui';

type ShuntCompensatorDialogSchemaBaseForm = {
    [EQUIPMENT_NAME]?: string;
    [CONNECTIVITY]: {
        [VOLTAGE_LEVEL]: { [ID]?: string };
        [BUS_OR_BUSBAR_SECTION]: { [ID]?: string };
        [CONNECTION_DIRECTION]?: string;
        [CONNECTION_NAME]?: string;
        [CONNECTION_POSITION]?: number;
        [CONNECTED]?: boolean;
    };
    [CHARACTERISTICS_CHOICE]: string;
    [SHUNT_COMPENSATOR_TYPE]: string | null;
    [MAX_Q_AT_NOMINAL_V]: number | null;
    [MAX_SUSCEPTANCE]: number | null;
    [MAXIMUM_SECTION_COUNT]: number;
    [SECTION_COUNT]: number;
    [SWITCHED_ON_Q_AT_NOMINAL_V]?: number;
    [SWITCHED_ON_SUSCEPTANCE]?: number;
    [FieldConstants.ADDITIONAL_PROPERTIES]?: Property[];
};

export type ShuntCompensatorModificationDialogSchemaForm = {
    [STATE_ESTIMATION]?: {
        [MEASUREMENT_Q]?: MeasurementInfo;
    };
} & Partial<ShuntCompensatorDialogSchemaBaseForm>;
