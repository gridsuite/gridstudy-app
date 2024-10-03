/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import { Filter } from '../commons/by-filter.type';

export interface ByFilterDeletionEditData {
    uuid: string;
    equipmentType: keyof typeof EQUIPMENT_TYPES;
    filters: Filter[];
}

export interface ByFilterDeletionFormData {
    type: keyof typeof EQUIPMENT_TYPES | null;
    filters: Filter[];
}

export interface ByFilterDeletionDialogProps {
    studyUuid: string;
    currentNode: { id: string };
    editData: ByFilterDeletionEditData;
    isUpdate: boolean;
    editDataFetchStatus: string;
    onClose: () => void;
}
