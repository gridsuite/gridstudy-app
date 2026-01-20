/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EquipmentType, ModificationType } from '@gridsuite/commons-ui';
import { UUID } from 'node:crypto';

export interface LccShuntCompensatorConnectionInfos {
    id: string;
    connectedToHvdc: boolean;
}

export interface EquipmentDeletionSpecificInfos {
    specificType: string;
    // below is specific to HVDC-LCC deletion (then specificType = HVDC_LINE_LCC_DELETION_SPECIFIC_TYPE)
    mcsOnSide1: LccShuntCompensatorConnectionInfos[];
    mcsOnSide2: LccShuntCompensatorConnectionInfos[];
}

export type EquipmentDeletionInfos = {
    type: ModificationType;
    uuid?: UUID;
    equipmentId: UUID;
    equipmentType: EquipmentType;
    equipmentInfos?: EquipmentDeletionSpecificInfos;
};

// Maps HvdcLccDeletionInfos from modification-server
export interface HvdcLccDeletionInfos extends EquipmentDeletionSpecificInfos {
    id?: UUID;
}
