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
            xposition: node.x,
            yposition: node.y,
            xlabelPosition: 0,
            ylabelPosition: 0,
        });
    });
    // Update the map with text node positions
    metadata.textNodes.forEach((textNode) => {
        if (positionsMap.has(textNode.equipmentId)) {
            positionsMap.get(textNode.equipmentId)!.xlabelPosition = textNode.shiftX;
            positionsMap.get(textNode.equipmentId)!.ylabelPosition = textNode.shiftY;
        }
    });
    return Array.from(positionsMap.values());
}
