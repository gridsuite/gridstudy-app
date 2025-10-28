/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { NodePlacement, SecurityGroupMembersMap } from './layout.type';

/**
 * Uses a bidirectional map to match a node ID to a NodePlacement.
 */
export class PlacementGrid {
    private readonly idToPlacement = new Map<string, NodePlacement>();
    private readonly placementToId = new Map<string, string>();

    private nodePlacementToString(placement: NodePlacement): string {
        return `${placement.row}_${placement.column}`;
    }

    setPlacement(nodeId: string, placement: NodePlacement) {
        // Remove any existing mappings to ensure bidirectionality
        if (this.idToPlacement.has(nodeId)) {
            const oldPlacement = this.idToPlacement.get(nodeId);
            this.placementToId.delete(this.nodePlacementToString(oldPlacement));
        }
        const placementString = this.nodePlacementToString(placement);
        if (this.placementToId.has(placementString)) {
            const oldId = this.placementToId.get(placementString);
            this.idToPlacement.delete(oldId);
        }
        // Add the new mappings
        this.idToPlacement.set(nodeId, placement);
        this.placementToId.set(placementString, nodeId);
    }

    getPlacement(nodeId: string): NodePlacement | undefined {
        const placement = this.idToPlacement.get(nodeId);
        // This ensure immutability to prevent external modifications on the returned value
        // from modifying this object's internal values.
        return placement ? { ...placement } : undefined;
    }

    isPlacementTaken(placement: NodePlacement): boolean {
        return this.placementToId.has(this.nodePlacementToString(placement));
    }
}

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
