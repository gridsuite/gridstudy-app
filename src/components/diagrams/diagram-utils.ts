/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DiagramMetadata } from '@powsybl/network-viewer';
import { DiagramConfigPosition } from '../../services/explore';

/**
 * Get the nodes and textNodes positions from the NAD's metadata and transform them in an array
 * of DiagramConfigPosition, to be saved in the backend.
 * @param metadata from a Network Area Diagram
 */
export function buildPositionsFromNadMetadata(metadata: DiagramMetadata): DiagramConfigPosition[] {
    const positionsMap = new Map<string, DiagramConfigPosition>();
    // Initialize the map with nodes
    metadata.nodes.forEach((node) => {
        positionsMap.set(node.equipmentId, {
            voltageLevelId: node.equipmentId,
            xPosition: node.x,
            yPosition: node.y,
            xLabelPosition: 0,
            yLabelPosition: 0,
        });
    });
    // Update the map with text node positions
    metadata.textNodes.forEach((textNode) => {
        if (positionsMap.has(textNode.equipmentId)) {
            positionsMap.get(textNode.equipmentId)!.xLabelPosition = textNode.shiftX;
            positionsMap.get(textNode.equipmentId)!.yLabelPosition = textNode.shiftY;
        }
    });
    return Array.from(positionsMap.values());
}

/**
 * Adds to existingPositions the positions from the NAD metadata that are
 * not already defined.
 *
 * @param existingPositions The existing positions array (can be empty)
 * @param nadMetadata The network area diagram metadata containing new positions
 * @returns A new array with merged positions
 */
export function mergePositions(
    existingPositions: DiagramConfigPosition[],
    nadMetadata: DiagramMetadata | undefined
): DiagramConfigPosition[] {
    if (!nadMetadata) {
        return [...existingPositions];
    }

    const positionsMap = new Map<string, DiagramConfigPosition>();
    // Add existing positions to the map
    existingPositions.forEach((pos) => {
        positionsMap.set(pos.voltageLevelId, pos);
    });

    const nadMetadataPositions = buildPositionsFromNadMetadata(nadMetadata);

    // Update map with new positions
    nadMetadataPositions.forEach((position) => {
        if (!positionsMap.has(position.voltageLevelId)) {
            positionsMap.set(position.voltageLevelId, position);
        }
    });

    // Convert map back to array
    return Array.from(positionsMap.values());
}
