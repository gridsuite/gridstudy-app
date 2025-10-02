/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { AbstractFilter, FilterType } from './filter';

export type IdentifierListFilterEquipmentAttributes = { equipmentID: string; distributionKey?: number };

export type IdentifierListFilter = AbstractFilter & {
    readonly type: FilterType.IDENTIFIER_LIST;
    filterEquipmentsAttributes: IdentifierListFilterEquipmentAttributes[];
};
