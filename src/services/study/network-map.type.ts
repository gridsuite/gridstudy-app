/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { CurrentLimits } from '../network-modification-types';
import { Equipment } from '../../components/dialogs/network-modifications/common/properties/property-utils';

export type SwitchInfos = {
    id: string;
    open: boolean;
};

export type LineInfos = Equipment & {
    name: string;
    voltageLevelId1: string;
    voltageLevelId2: string;
    busOrBusbarSectionId1: string;
    busOrBusbarSectionId2: string;
    currentLimits: CurrentLimits[];
    selectedOperationalLimitsGroup1: string;
    selectedOperationalLimitsGroup2: string;
};
