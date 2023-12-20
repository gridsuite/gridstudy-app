/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';

export interface Filter {
    id: string;
    name: string;
    specificMetadata: {
        type?: string;
    };
}

export interface EditData {
    uuid: string;
    equipmentType: keyof typeof EQUIPMENT_TYPES;
    filters: Filter[];
}

export interface FormData {
    type: keyof typeof EQUIPMENT_TYPES | null;
    filters: Filter[];
}

export interface ByFilterDeletionDialogProps {
    studyUuid: string;
    currentNode: { id: string };
    editData: EditData;
    isUpdate: boolean;
    editDataFetchStatus: string;
    onClose: () => void;
}
