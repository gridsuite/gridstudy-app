/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { CustomColDef } from '../../custom-aggrid/custom-aggrid-header.type';

export type EquipmentFetcher = (studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[]) => Promise<any>;

export interface SpreadsheetTabDefinition {
    index: number;
    name: string;
    type: EQUIPMENT_TYPES | string; // FIXME type issue ex: BATTERY17 on custom col
    fetchers: EquipmentFetcher[];
    columns: CustomColDef[];
    groovyEquipmentGetter?: string;
}
