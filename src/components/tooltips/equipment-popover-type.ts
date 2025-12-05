/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentInfos } from '@gridsuite/commons-ui';
import { Property } from 'components/dialogs/network-modifications/common/properties/property-utils';
import { CurrentLimits } from 'services/network-modification-types';

export interface BranchEquipmentInfos extends EquipmentInfos {
    i1: number;
    i2: number;
    p1: number;
    q1: number;
    p2: number;
    q2: number;
    ratioTapChanger: any;
    phaseTapChanger: any;
    currentLimits1: CurrentLimits;
    currentLimits2: CurrentLimits;
    selectedOperationalLimitsGroup1?: string;
    selectedOperationalLimitsGroup2?: string;
}
export interface LoadEquipmentInfos {
    properties?: Property[];
    p0: number;
    q0: number;
}

export type GenericEquipmentInfos = BranchEquipmentInfos | LoadEquipmentInfos;
