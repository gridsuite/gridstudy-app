/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AttributeModification, CurrentLimits, OperationalLimitsGroup } from '../network-modification-types';
import { UUID } from 'crypto';
import { Equipment, Property } from '../../components/dialogs/network-modifications/common/properties/property-utils';

export type SwitchInfos = {
    id: string;
    open: boolean;
};

export type LineInfos = Equipment & {
    // TODO might be completed. I only put the data that is directly accessed
    name: string;
    voltageLevelId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId1: string;
    busOrBusbarSectionId2: string;
    currentLimits: CurrentLimits[];
    selectedOperationalLimitsGroup1: string;
    selectedOperationalLimitsGroup2: string;
};

export interface LineModificationEditData {
    // TODO might be moved somewhere more logical (specific file ? line-modification-dialog ?)
    uuid?: string;
    equipmentId?: string;
    equipmentName?: { value: string };
    studyUuid: string;
    nodeUuid: UUID;
    modificationUuid: string;
    lineId: string;
    lineName: string | null;
    r: AttributeModification<number> | null;
    x: AttributeModification<number>;
    g1: AttributeModification<number>;
    b1: AttributeModification<number>;
    g2: AttributeModification<number>;
    b2: AttributeModification<number>;
    operationalLimitsGroups: OperationalLimitsGroup[];
    selectedOperationalLimitsGroup1: AttributeModification<string>;
    selectedOperationalLimitsGroup2: AttributeModification<string>;
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
