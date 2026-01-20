/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { OperationalLimitsGroup } from '../../../../../services/network-modification-types';
import { Property } from '../../common/properties/property-utils';
import {
    ADDITIONAL_PROPERTIES,
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID1,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID2,
    TAB_HEADER,
} from 'components/utils/field-constants';
import { Connectivity } from 'components/dialogs/connectivity/connectivity.type';
import { CurrentLimitsData } from '../../../../../services/study/network-map.type';
import { LineModificationFormInfos } from '../modification/line-modification-type';
import { OperationalLimitsGroupFormSchema } from '../../../limits/operational-limits-groups-types';

export interface LineCreationFormData {
    [TAB_HEADER]: {
        equipmentId: string;
        equipmentName?: string | null;
    };
    [CHARACTERISTICS]: {
        r?: number | null;
        x?: number | null;
        b1?: number | null;
        g1?: number | null;
        b2?: number | null;
        g2?: number | null;
        [CONNECTIVITY_1]?: Connectivity;
        [CONNECTIVITY_2]?: Connectivity;
    };
    [LIMITS]: {
        [OPERATIONAL_LIMITS_GROUPS]?: OperationalLimitsGroupFormSchema[];
        [SELECTED_OPERATIONAL_LIMITS_GROUP_ID1]?: string | null;
        [SELECTED_OPERATIONAL_LIMITS_GROUP_ID2]?: string | null;
    };
    [ADDITIONAL_PROPERTIES]?: Property[];
    [key: string]: any;
}

export interface ConnectablePosition {
    connectionName: string | null;
    connectionDirection: string | null;
    connectionPosition: number | null;
}

export interface Limit {
    id: string;
    name: string;
    applicability: string;
    currentLimits: {
        id: string;
        permanentLimit: number;
        temporaryLimits: {
            name: string;
            acceptableDuration: number;
            value: number;
        }[];
    };
}

export interface LineFormInfos {
    id: string;
    name: string | null;
    voltageLevelId1: string;
    voltageLevelId2: string;
    terminal1Connected: boolean;
    terminal2Connected: boolean;
    p1: number;
    q1: number;
    p2: number;
    q2: number;
    i1: number;
    i2: number;
    r: number;
    x: number;
    g1?: number;
    b1?: number;
    g2?: number;
    b2?: number;
    busOrBusbarSectionId1: string;
    busOrBusbarSectionId2: string;
    selectedOperationalLimitsGroupId1: string;
    selectedOperationalLimitsGroupId2: string;
    connectablePosition1: ConnectablePosition;
    connectablePosition2: ConnectablePosition;
    currentLimits: CurrentLimitsData[];
    properties: Record<string, string>;
}

export interface LineCreationFormInfos extends LineModificationFormInfos {
    tabHeader: {
        equipmentId: string;
        equipmentName?: string;
    };
}
