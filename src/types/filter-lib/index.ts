/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

//TODO to deduplicate with commons-ui types
import type { IdentifierListFilter } from './identifier-list-filter';
import type { ExpertFilter } from './expert-filter';
import type { UUID } from 'crypto';
import type { EQUIPMENT_TYPES } from '../../components/utils/equipment-types';
import type { FilterEquipmentType } from './filter';

export * from './filter';
export * from './identifier-list-filter';
export * from './expert-filter';

export type Filter = IdentifierListFilter | ExpertFilter;

export type IdentifiableAttributes = {
    id: string;
    type: FilterEquipmentType;
    distributionKey: number;
};

export type FilterEquipments = {
    filterId: UUID;
    identifiableAttributes: IdentifiableAttributes[];
    notFoundEquipments: string[];
};
