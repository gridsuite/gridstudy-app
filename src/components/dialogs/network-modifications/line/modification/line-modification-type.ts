/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import { LimitsProperty, OperationalLimitsGroup } from '../../../../../services/network-modification-types';
import type { UUID } from 'node:crypto';
import { Property } from '../../common/properties/property-utils';
import {
    APPLICABIlITY,
    CURRENT_LIMITS,
    DELETION_MARK,
    ENABLE_OLG_MODIFICATION,
    ID,
    LIMITS_PROPERTIES,
    NAME,
    OPERATIONAL_LIMITS_GROUPS,
    PERMANENT_LIMIT,
    SELECTED_LIMITS_GROUP_1,
    SELECTED_LIMITS_GROUP_2,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS,
} from '../../../../utils/field-constants';

export interface LineModificationFormInfos {
    equipmentId?: string;
    equipmentName?: string;
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: string;
    lineId: string;
    lineName: string | null;
    r: number;
    x: number;
    g1: number;
    b1: number;
    g2: number;
    b2: number;
    operationalLimitsGroups: OperationalLimitsGroup[];
    selectedOperationalLimitsGroup1: string | null;
    selectedOperationalLimitsGroup2: string | null;
    voltageLevelId1: string;
    busOrBusbarSectionId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId2: string;
    connectionName1: string | null;
    connectionName2: string | null;
    connectionDirection1: string | null;
    connectionDirection2: string | null;
    connectionPosition1: string | null;
    connectionPosition2: string | null;
    connected1: boolean;
    connected2: boolean;
    properties: Property[] | null | undefined;
    p1MeasurementValue: number | null;
    p1MeasurementValidity: boolean | null;
    q1MeasurementValue: number | null;
    q1MeasurementValidity: boolean | null;
    p2MeasurementValue: number | null;
    p2MeasurementValidity: boolean | null;
    q2MeasurementValue: number | null;
    q2MeasurementValidity: boolean | null;
    connectivity: any;
    AdditionalProperties: any;
    characteristics: any;
    stateEstimation: any;
    limits: LimitsDialogFormInfos;
}

export interface LimitsDialogFormInfos {
    [SELECTED_LIMITS_GROUP_1]: string | null;
    [SELECTED_LIMITS_GROUP_2]: string | null;
    [OPERATIONAL_LIMITS_GROUPS]: OperationalLimitsGroupFormInfos[];
    // if true OperationalLimitsGroupFormInfos[] are used and sent to the back, otherwise they are ignored
    [ENABLE_OLG_MODIFICATION]: boolean;
}

export interface OperationalLimitsGroupFormInfos {
    // here 'id' is a concatenation of NAME and APPLICABIlITY because 2 limits sets on side1 and 2 may have the same name
    // "ID" from the map server is stored as NAME in the form because of this
    [ID]: string;
    [APPLICABIlITY]?: string;
    [LIMITS_PROPERTIES]?: LimitsProperty[];
    [NAME]: string;
    [CURRENT_LIMITS]: CurrentLimitsFormInfos;
}

export interface CurrentLimitsFormInfos {
    [ID]: string;
    [PERMANENT_LIMIT]: number | null;
    [TEMPORARY_LIMITS]: TemporaryLimitFormInfos[];
}

export interface TemporaryLimitFormInfos {
    [TEMPORARY_LIMIT_NAME]: string;
    [TEMPORARY_LIMIT_DURATION]: number | null;
    [TEMPORARY_LIMIT_VALUE]: number | null;
    [DELETION_MARK]: boolean;
}
