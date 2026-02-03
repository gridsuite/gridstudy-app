/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CHARACTERISTICS_CHOICE,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    ID,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    SWITCHED_ON_Q_AT_NOMINAL_V,
    SWITCHED_ON_SUSCEPTANCE,
    VOLTAGE_LEVEL,
} from '../../../utils/field-constants';
import { ConnectablePositionFormInfos } from '../../connectivity/connectivity.type';
import { Property } from '@gridsuite/commons-ui';

export type ShuntCompensatorDialogSchemaBaseForm = {
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
    [ADDITIONAL_PROPERTIES]?: Property[];
};
export type ShuntCompensatorCreationDialogSchemaForm = {
    [EQUIPMENT_ID]: string;
} & ShuntCompensatorDialogSchemaBaseForm;

export type ShuntCompensatorModificationDialogSchemaForm = Partial<ShuntCompensatorDialogSchemaBaseForm>;

export interface ShuntCompensatorFormInfos {
    id: string;
    name: string;
    voltageLevelId: string;
    terminalConnected: boolean | null;
    busOrBusbarSectionId?: string;
    connectablePosition: ConnectablePositionFormInfos;
    q?: number;
    targetV?: number;
    targetDeadband?: number;
    sectionCount: number;
    bPerSection?: number;
    qAtNominalV?: number;
    maximumSectionCount: number;
    isLinear?: boolean;
    properties: Record<string, string> | undefined;
}
