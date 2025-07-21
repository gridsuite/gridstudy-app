/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { DiagramMetadata } from '@powsybl/network-viewer';
import { DiagramConfigPosition } from '../../../../services/explore';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentType } from '@gridsuite/commons-ui';
import { FEEDER_TYPES, FeederTypes } from 'components/utils/feederType';
import { Svg } from './diagram.type';

export const MIN_WIDTH = 150;
export const MIN_HEIGHT = 150;
export const MAX_WIDTH_VOLTAGE_LEVEL = 800;
export const MAX_HEIGHT_VOLTAGE_LEVEL = 700;
export const MAX_WIDTH_SUBSTATION = 1200;
export const MAX_HEIGHT_SUBSTATION = 700;
export const MAX_WIDTH_NETWORK_AREA_DIAGRAM = 1200;
export const MAX_HEIGHT_NETWORK_AREA_DIAGRAM = 650;

// Array of zoom levels used to determine level-of-detail rendering by applying in the network-viewer the
// corresponding css class 'nad-zoom-{level}' to the NAD's SVG.
export const NAD_ZOOM_LEVELS = [0, 2000, 3500, 6000, 9000, 12000, 15000];

// be careful when using this method because there are treatments made on purpose
export function getEquipmentTypeFromFeederType(feederType: FeederTypes | null): EQUIPMENT_TYPES | null {
    switch (feederType) {
        case FEEDER_TYPES.LINE:
            return EQUIPMENT_TYPES.LINE;
        case FEEDER_TYPES.LOAD:
            return EQUIPMENT_TYPES.LOAD;
        case FEEDER_TYPES.BATTERY:
            return EQUIPMENT_TYPES.BATTERY;
        case FEEDER_TYPES.TIE_LINE:
            return EQUIPMENT_TYPES.TIE_LINE;
        case FEEDER_TYPES.DANGLING_LINE:
            return EQUIPMENT_TYPES.DANGLING_LINE;
        case FEEDER_TYPES.GENERATOR:
            return EQUIPMENT_TYPES.GENERATOR;
        case FEEDER_TYPES.LCC_CONVERTER_STATION: // return EQUIPMENT_TYPES.LCC_CONVERTER_STATION; TODO : to be reactivated in the next powsybl version
        case FEEDER_TYPES.VSC_CONVERTER_STATION: // return EQUIPMENT_TYPES.VSC_CONVERTER_STATION; TODO : to be reactivated in the next powsybl version
        case FEEDER_TYPES.HVDC_LINE:
            return EQUIPMENT_TYPES.HVDC_LINE;
        case FEEDER_TYPES.CAPACITOR:
        case FEEDER_TYPES.INDUCTOR:
            return EQUIPMENT_TYPES.SHUNT_COMPENSATOR;
        case FEEDER_TYPES.STATIC_VAR_COMPENSATOR:
            return EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR;
        case FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER:
        case FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER_LEG:
        case FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER:
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
        case FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER:
        case FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER_LEG:
            return EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER;
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
