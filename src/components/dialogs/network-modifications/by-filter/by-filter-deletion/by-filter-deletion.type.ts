/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType } from '@gridsuite/commons-ui';
import { Filter } from '../commons/by-filter.type';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

export interface ByFilterDeletionEditData {
    uuid: string;
    equipmentType: EquipmentType;
    filters: Filter[];
}

export interface ByFilterDeletionFormData {
    type: EquipmentType | null;
    filters: Filter[];
}

export type ByFilterDeletionDialogProps = NetworkModificationDialogProps & {
    editData: ByFilterDeletionEditData;
};
