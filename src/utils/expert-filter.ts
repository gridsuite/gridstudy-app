/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// this function is used to provide topologyKind, particularly 'BUS_BREAKER' for EQUIPMENT_TYPES.BUS
import { FilterEquipmentType, TopologyKind } from '../types/filter-lib';

type TopologyKindResult<T extends FilterEquipmentType> = T extends FilterEquipmentType.BUS
    ? { topologyKind: TopologyKind.BUS_BREAKER }
    : {};
export function getTopologyKindIfNecessary<T extends FilterEquipmentType>(equipmentType: T): TopologyKindResult<T> {
    return (
        equipmentType === FilterEquipmentType.BUS ? { topologyKind: TopologyKind.BUS_BREAKER } : {}
    ) as TopologyKindResult<T>;
}
