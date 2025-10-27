/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SecurityGroupMembersMap } from './layout.type';
import { PlacementGrid } from './layout';

export function addMember(map: SecurityGroupMembersMap, key: string, member: string) {
    const group = map.get(key);
    if (group) {
        group.push(member);
    } else {
        map.set(key, [member]);
    }
}

export function getSecurityGroupRows(
    securityGroupId: string,
    map: SecurityGroupMembersMap,
    placements: PlacementGrid
): Set<number> {
    const rows = new Set<number>();
    const members = map.get(securityGroupId) ?? [];
    for (const member of members) {
        const row = placements.getPlacement(member)?.row;
        if (row !== undefined) {
            rows.add(row);
        }
    }
    return rows;
}
