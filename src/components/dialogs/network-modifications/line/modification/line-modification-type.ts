/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { OperationalLimitsGroup } from '../../../../../services/network-modification-types';
import { Property } from '../../common/properties/property-utils';

export interface LineModificationDialogForm {
    uuid?: string;
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
    limits: any;
}
