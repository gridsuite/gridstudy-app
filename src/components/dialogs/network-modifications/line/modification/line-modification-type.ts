/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { OperationalLimitsGroup } from '../../../../../services/network-modification-types';
import type { UUID } from 'node:crypto';
import { Property } from '../../common/properties/property-utils';
import { OperationalLimitsGroupsFormSchema } from '../../../limits/operational-limits-groups-types';

export interface LineCharacteristics {
    r: number | null;
    x: number | null;
    g1: number | null;
    b1: number | null;
    g2: number | null;
    b2: number | null;
}

export interface LineModificationFormInfos {
    equipmentId?: string;
    equipmentName?: string;
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: string;
    lineId: string;
    lineName: string | null;
    r: number | null;
    x: number | null;
    g1: number | null;
    b1: number | null;
    g2: number | null;
    b2: number | null;
    operationalLimitsGroups: OperationalLimitsGroup[];
    selectedOperationalLimitsGroupId1: string | null;
    selectedOperationalLimitsGroupId2: string | null;
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
    limits: OperationalLimitsGroupsFormSchema;
}
