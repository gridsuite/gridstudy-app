/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ConnectablePositionInfos, Connectivity } from '../../../connectivity/connectivity.type';
import { CurrentLimitsData } from '../../../../../services/study/network-map.type';
import {
    ADDITIONAL_PROPERTIES,
    CHARACTERISTICS,
    CONNECTIVITY_1,
    CONNECTIVITY_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    LIMITS,
    OPERATIONAL_LIMITS_GROUPS,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID1,
    SELECTED_OPERATIONAL_LIMITS_GROUP_ID2,
    TAB_HEADER,
} from '../../../../utils/field-constants';
import { OperationalLimitsGroupFormSchema } from '../../../limits/operational-limits-groups-types';
import { LineCharacteristics } from '../modification/line-modification-type';
import { Property } from '@gridsuite/commons-ui';

export interface LineCreationFormSchema {
    [TAB_HEADER]: {
        [EQUIPMENT_ID]: string;
        [EQUIPMENT_NAME]?: string | null;
    };
    [CHARACTERISTICS]: LineCharacteristics & {
        [CONNECTIVITY_1]?: Connectivity;
        [CONNECTIVITY_2]?: Connectivity;
    };
    [LIMITS]: {
        [OPERATIONAL_LIMITS_GROUPS]?: OperationalLimitsGroupFormSchema[];
        [SELECTED_OPERATIONAL_LIMITS_GROUP_ID1]?: string | null;
        [SELECTED_OPERATIONAL_LIMITS_GROUP_ID2]?: string | null;
    };
    [ADDITIONAL_PROPERTIES]?: Property[];
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
    connectablePosition1: ConnectablePositionInfos;
    connectablePosition2: ConnectablePositionInfos;
    currentLimits: CurrentLimitsData[];
    properties: Record<string, string>;
}
