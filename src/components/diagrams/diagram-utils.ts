/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DiagramState } from '../../redux/reducer';
import { DiagramType } from './diagram.type';
import { DiagramMetadata } from '@powsybl/network-viewer';
import { DiagramConfigPosition } from '../../services/explore';

/**
 * SORTING FUNCTIONS
 */

type DiagramAlignment = 'left' | 'right' | undefined;

const innerSortByAlign = (align: DiagramAlignment): number => {
    if (align === 'left') {
        return 10;
    }
    if (align === 'right') {
        return 20;
    }
    return 30;
};

/*
 * Sorts by the object's "align" parameter. Values equal to "left" will be before "right" values, and others or undefined will be last.
 */
const sortByAlign = (a: { align: DiagramAlignment }, b: { align: DiagramAlignment }) => {
    return innerSortByAlign(a?.align) - innerSortByAlign(b?.align);
};

/*
 * Sort by the order (index) of the objects inside diagramStates.
 * So we keep the same order as in the redux store.
 * We use the ID and type of the objects to identify their indexes.
 */
const sortByIndex = (a: any, b: any, diagramStates: any[]) => {
    return (
        diagramStates.findIndex((diagramState) => diagramState.id === a?.id && diagramState.svgType === a?.svgType) -
        diagramStates.findIndex((diagramState) => diagramState.id === b?.id && diagramState.svgType === b?.svgType)
    );
};

/**
 * Will build a distinctive identifier to differenciate between network area diagram instances
 * @param diagramStates the diagrams array of the redux store
 * @param initNadWithGeoData config parameter specifying if the nad uses geographical data
 * @returns {string}
 */

export const getNadIdentifier = (diagramStates: DiagramState[], initNadWithGeoData: boolean): string => {
    const result =
        diagramStates
            .filter((diagram) => diagram.svgType === DiagramType.NETWORK_AREA_DIAGRAM)
            .map((diagram) => diagram.id)
            .sort((a, b) => a.localeCompare(b))
            .join(',') +
        'geo' +
        initNadWithGeoData;
    return result;
};

/**
 * Create an array sorting function based on two values : first, the alignment, then, the index
 * @param diagramStates the diagrams array of the redux store
 * @returns {(function(*, *): (*))|*} new array sorting function based on diagramStates
 */
export const makeDiagramSorter = (diagramStates: any[]): ((a: any, b: any) => number) => {
    return (a: any, b: any): number => sortByAlign(a, b) || sortByIndex(a, b, diagramStates);
};

// estimate the number of voltage levels for a requested depth
// based on the current depth and the previous number of voltage levels
// this allows the user to increase the depth quickly without having to wait
// for the actual number of voltage levels at each step but
// to avoid increasing the depth too much.
// we want this estimation to be slightly pessimistic to avoid bad UX of going to far
// and not being able to do the same thing step by step.
const VL_DEPTH_GROWTH_RATE = 2;
export function getEstimatedNbVoltageLevels(
    currentDepth: number,
    requestedDepth: number,
    previousVoltagesNB: number
): number {
    // We assume that the number of vl grows exponentially
    // real world example :
    // depth : number of voltage levels
    // 1     : 3
    // 2     : 7
    // 3     : 13
    // 4     : 28
    // 5     : 37
    // 6     : 51
    // 7     : 80
    // 8     : 138
    // 9     : 221
    return previousVoltagesNB * Math.pow(VL_DEPTH_GROWTH_RATE, requestedDepth - currentDepth);
}

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
