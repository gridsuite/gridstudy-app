/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DiagramConfigPosition } from '../../../../services/explore';
import { DiagramMetadata } from '@powsybl/network-viewer';
import { FEEDER_TYPES, FeederTypes } from 'components/utils/feederType';
import { EquipmentType, ExtendedEquipmentType } from '@gridsuite/commons-ui';
import { Diagram, DiagramType, Svg } from './diagram.type';
import type { UUID } from 'node:crypto';

export const MIN_WIDTH = 150;
export const MIN_HEIGHT = 150;
export const MAX_WIDTH_VOLTAGE_LEVEL = Infinity;
export const MAX_HEIGHT_VOLTAGE_LEVEL = Infinity;
export const MAX_WIDTH_SUBSTATION = Infinity;
export const MAX_HEIGHT_SUBSTATION = Infinity;
export const MAX_WIDTH_NETWORK_AREA_DIAGRAM = Infinity;
export const MAX_HEIGHT_NETWORK_AREA_DIAGRAM = Infinity;

// Array of zoom levels used to determine level-of-detail rendering by applying in the network-viewer the
// corresponding css class 'nad-zoom-{level}' to the NAD's SVG.
export const NAD_ZOOM_LEVELS = [0, 2000, 3500, 6000, 9000, 12000, 15000];

// be careful when using this method because there are treatments made on purpose
export function getEquipmentTypeFromFeederType(feederType: FeederTypes | null): {
    equipmentType: EquipmentType | null;
    equipmentSubtype?: ExtendedEquipmentType;
} | null {
    switch (feederType) {
        case FEEDER_TYPES.LINE:
            return { equipmentType: EquipmentType.LINE };
        case FEEDER_TYPES.LOAD:
            return { equipmentType: EquipmentType.LOAD };
        case FEEDER_TYPES.BATTERY:
            return { equipmentType: EquipmentType.BATTERY };
        case FEEDER_TYPES.TIE_LINE:
            return { equipmentType: EquipmentType.TIE_LINE };
        case FEEDER_TYPES.DANGLING_LINE:
            return { equipmentType: EquipmentType.DANGLING_LINE };
        case FEEDER_TYPES.GENERATOR:
            return { equipmentType: EquipmentType.GENERATOR };
        case FEEDER_TYPES.LCC_CONVERTER_STATION:
            return {
                equipmentType: EquipmentType.HVDC_LINE,
                equipmentSubtype: ExtendedEquipmentType.HVDC_LINE_LCC,
            };
        case FEEDER_TYPES.VSC_CONVERTER_STATION:
            return {
                equipmentType: EquipmentType.HVDC_LINE,
                equipmentSubtype: ExtendedEquipmentType.HVDC_LINE_VSC,
            };
        case FEEDER_TYPES.HVDC_LINE_VSC:
            return { equipmentType: EquipmentType.HVDC_LINE, equipmentSubtype: ExtendedEquipmentType.HVDC_LINE_VSC };
        case FEEDER_TYPES.HVDC_LINE_LCC:
            return { equipmentType: EquipmentType.HVDC_LINE, equipmentSubtype: ExtendedEquipmentType.HVDC_LINE_LCC };
        case FEEDER_TYPES.CAPACITOR:
        case FEEDER_TYPES.INDUCTOR:
            return { equipmentType: EquipmentType.SHUNT_COMPENSATOR };
        case FEEDER_TYPES.STATIC_VAR_COMPENSATOR:
            return { equipmentType: EquipmentType.STATIC_VAR_COMPENSATOR };
        case FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER:
        case FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER_LEG:
        case FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER:
        case FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER_LEG:
            return { equipmentType: EquipmentType.TWO_WINDINGS_TRANSFORMER };
        case FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER:
        case FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER_LEG:
            return { equipmentType: EquipmentType.THREE_WINDINGS_TRANSFORMER };
        case FEEDER_TYPES.VOLTAGE_LEVEL:
            return { equipmentType: EquipmentType.VOLTAGE_LEVEL };
        default: {
            console.log('bad feeder type ', feederType);
            return null;
        }
    }
}

export function getCommonEquipmentType(equipmentType: EquipmentType): EquipmentType | null {
    switch (equipmentType) {
        case EquipmentType.SUBSTATION:
        case EquipmentType.VOLTAGE_LEVEL:
        case EquipmentType.LINE:
        case EquipmentType.LOAD:
        case EquipmentType.BATTERY:
        case EquipmentType.TIE_LINE:
        case EquipmentType.DANGLING_LINE:
        case EquipmentType.GENERATOR:
        case EquipmentType.HVDC_LINE:
        case EquipmentType.SHUNT_COMPENSATOR:
        case EquipmentType.STATIC_VAR_COMPENSATOR:
        case EquipmentType.TWO_WINDINGS_TRANSFORMER:
        case EquipmentType.THREE_WINDINGS_TRANSFORMER:
            return equipmentType;

        case EquipmentType.VSC_CONVERTER_STATION:
        case EquipmentType.LCC_CONVERTER_STATION:
            return EquipmentType.HVDC_CONVERTER_STATION;
        default: {
            console.info('Unrecognized equipment type encountered ', equipmentType);
            return null;
        }
    }
}

// Initialization object
export const NoSvg: Svg = {
    svg: null,
    metadata: null,
    additionalMetadata: null,
    error: undefined,
    svgUrl: undefined,
};

export const equipmentsWithPopover = [
    FEEDER_TYPES.LINE,
    FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER,
    FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER,
    FEEDER_TYPES.VOLTAGE_LEVEL,
];

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

const MAX_NUMBER_OF_NAD_DIAGRAMS = 3;

export const isThereTooManyOpenedNadDiagrams = (diagrams: Record<UUID, Diagram>) => {
    return (
        Object.values(diagrams).filter((diagram) => diagram?.type === DiagramType.NETWORK_AREA_DIAGRAM).length >=
        MAX_NUMBER_OF_NAD_DIAGRAMS
    );
};
