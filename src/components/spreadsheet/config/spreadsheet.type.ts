/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import type { CustomColDef } from '../../custom-aggrid/custom-aggrid-header.type';
import type { EquipmentFetcher } from './equipment/common-config';

export interface SpreadsheetTabDefinition<TData = any, TValue = any> {
    index: number;
    name: string;
    type: EQUIPMENT_TYPES;
    fetchers: EquipmentFetcher[];
    columns: CustomColDef<TData, TValue>[];
    groovyEquipmentGetter?: string;
}
