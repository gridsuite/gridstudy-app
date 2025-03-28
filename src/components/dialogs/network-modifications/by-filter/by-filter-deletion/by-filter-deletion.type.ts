/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { Filter } from '../commons/by-filter.type';
import { DefaultCreationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

export interface ByFilterDeletionEditData {
    uuid: string;
    equipmentType: keyof typeof EQUIPMENT_TYPES;
    filters: Filter[];
}

export interface ByFilterDeletionFormData {
    type: keyof typeof EQUIPMENT_TYPES | null;
    filters: Filter[];
}

export type ByFilterDeletionDialogProps = DefaultCreationDialogProps & {
    editData: ByFilterDeletionEditData;
};
