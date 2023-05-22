/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    closeDiagram,
    closeDiagrams,
    minimizeDiagram,
    openDiagram,
    togglePinDiagram,
} from '../../redux/actions';
import {
    INVALID_LOADFLOW_OPACITY,
    NAD_INVALID_LOADFLOW_OPACITY,
} from '../../utils/colors';
import { FEEDER_TYPES } from 'components/utils/feederType';
import makeStyles from '@mui/styles/makeStyles';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

export const LOADING_WIDTH = 300;
export const LOADING_HEIGHT = 300;
export const MIN_WIDTH = 150;
export const MIN_HEIGHT = 150;
export const MAX_WIDTH_VOLTAGE_LEVEL = 800;
export const MAX_HEIGHT_VOLTAGE_LEVEL = 700;
export const MAX_WIDTH_SUBSTATION = 1200;
export const MAX_HEIGHT_SUBSTATION = 700;
export const MAX_WIDTH_NETWORK_AREA_DIAGRAM = 1200;
export const MAX_HEIGHT_NETWORK_AREA_DIAGRAM = 650;
// To prevent increasing the network area diagram depth when the number of voltage levels in the diagram exceeds this value
export const NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS = 200;

export const DEFAULT_WIDTH_VOLTAGE_LEVEL = 400;
export const DEFAULT_HEIGHT_VOLTAGE_LEVEL = 400;
export const DEFAULT_WIDTH_SUBSTATION = 700;
export const DEFAULT_HEIGHT_SUBSTATION = 400;
export const DEFAULT_WIDTH_NETWORK_AREA_DIAGRAM = 400;
export const DEFAULT_HEIGHT_NETWORK_AREA_DIAGRAM = 400;

// Height (in pixels) reserved to allow elements that are in the bottom of the map
// to not be hidden in normal mode (but they are still hidden in fullscreen mode)
export const MAP_BOTTOM_OFFSET = 80;

// Percentage of the diagram pane's total height that correspond to the minimum
// height of opened diagrams : diagrams should not be smaller than 25% of the
// diagram pane's height.
export const DIAGRAM_MAP_RATIO_MIN_PERCENTAGE = 0.25;

export const useDiagramStyles = makeStyles((theme) => ({
    divDiagram: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
            width: '100%',
            height: '100%',
        },
        overflow: 'hidden',
    },
    divNetworkAreaDiagram: {
        '& .nad-label-box': {
            color: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .nad-text-edges': {
            stroke: theme.palette.text.primary,
        },
    },
    divSingleLineDiagram: {
        '& polyline': {
            pointerEvents: 'none',
        },
        '& .sld-label, .sld-graph-label, .sld-legend': {
            fill: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .sld-disconnector:not(.sld-fictitious), :not(.sld-breaker):not(.sld-disconnector):not(.sld-load-break-switch).sld-disconnected, .sld-feeder-disconnected, .sld-feeder-disconnected-connected':
            {
                stroke: theme.palette.text.primary,
            },
        '& .sld-flash, .sld-lock': {
            stroke: 'none',
            fill: theme.palette.text.primary,
        },
        '& .arrow': {
            fill: theme.palette.text.primary,
        },
    },
    divDiagramReadOnly: {
        '& .sld-in .sld-label': {
            display: 'none',
        },
        '& .sld-out .sld-label': {
            display: 'none',
        },
        '& .sld-arrow-in': {
            display: 'none',
        },
        '& .sld-arrow-out': {
            display: 'none',
        },
        '& .arrow': {
            pointerEvents: 'none',
        },
    },
    divDiagramInvalid: {
        '& .sld-active-power, .sld-reactive-power, .sld-voltage, .sld-angle': {
            opacity: INVALID_LOADFLOW_OPACITY,
        },
        '& .nad-edge-infos': {
            opacity: NAD_INVALID_LOADFLOW_OPACITY,
        },
    },
    paperBorders: {
        borderLeft: '1px solid ' + theme.palette.action.disabled,
        borderBottom: '1px solid ' + theme.palette.action.disabledBackground,
        borderRight: '1px solid ' + theme.palette.action.hover,
    },
}));

export const ViewState = {
    PINNED: 'pinned',
    MINIMIZED: 'minimized',
    OPENED: 'opened',
};

export const SubstationLayout = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    SMART: 'smart',
    SMARTHORIZONTALCOMPACTION: 'smartHorizontalCompaction',
    SMARTVERTICALCOMPACTION: 'smartVerticalCompaction',
};

export const DiagramType = {
    VOLTAGE_LEVEL: 'voltage-level',
    SUBSTATION: 'substation',
    NETWORK_AREA_DIAGRAM: 'network-area-diagram',
};

export function getEquipmentTypeFromFeederType(feederType) {
    switch (feederType) {
        case FEEDER_TYPES.LINE.type:
            return EQUIPMENT_TYPES.LINE.name;
        case FEEDER_TYPES.LOAD.type:
            return EQUIPMENT_TYPES.LOAD.name;
        case FEEDER_TYPES.BATTERY.type:
            return EQUIPMENT_TYPES.BATTERY.name;
        case FEEDER_TYPES.DANGLING_LINE.type:
            return EQUIPMENT_TYPES.DANGLING_LINE.name;
        case FEEDER_TYPES.GENERATOR.type:
            return EQUIPMENT_TYPES.GENERATOR.name;
        case FEEDER_TYPES.VSC_CONVERTER_STATION.type:
            return EQUIPMENT_TYPES.VSC_CONVERTER_STATION.name;
        case FEEDER_TYPES.LCC_CONVERTER_STATION.type:
            return EQUIPMENT_TYPES.LCC_CONVERTER_STATION.name;
        case FEEDER_TYPES.HVDC_LINE.type:
            return EQUIPMENT_TYPES.HVDC_LINE.name;
        case FEEDER_TYPES.CAPACITOR.type:
        case FEEDER_TYPES.INDUCTOR.type:
            return EQUIPMENT_TYPES.SHUNT_COMPENSATOR.name;
        case FEEDER_TYPES.STATIC_VAR_COMPENSATOR.type:
            return EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.name;
        case FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER.type:
        case FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER_LEG.type:
        case FEEDER_TYPES.PHASE_SHIFT_TRANSFORMER.type:
            return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.name;
        case FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER.type:
        case FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER_LEG.type:
            return EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.name;
        default: {
            console.log('bad feeder type ', feederType);
            return null;
        }
    }
}

export function getFeederTypeFromEquipmentType(equipmentType) {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION.name:
            return FEEDER_TYPES.SUBSTATION.type;
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL.name:
            return FEEDER_TYPES.VOLTAGE_LEVEL.type;
        case EQUIPMENT_TYPES.LINE.name:
            return FEEDER_TYPES.LINE.type;
        case EQUIPMENT_TYPES.LOAD.name:
            return FEEDER_TYPES.LOAD.type;
        case EQUIPMENT_TYPES.BATTERY.name:
            return FEEDER_TYPES.BATTERY.type;
        case EQUIPMENT_TYPES.DANGLING_LINE.name:
            return FEEDER_TYPES.DANGLING_LINE.type;
        case EQUIPMENT_TYPES.GENERATOR.name:
            return FEEDER_TYPES.GENERATOR.type;
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION.name:
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION.name:
            return FEEDER_TYPES.HVDC_CONVERTER_STATION.type;
        case EQUIPMENT_TYPES.HVDC_LINE.name:
            return FEEDER_TYPES.HVDC_LINE.type;
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR.name:
            return FEEDER_TYPES.SHUNT_COMPENSATOR.type;
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR.name:
            return FEEDER_TYPES.STATIC_VAR_COMPENSATOR.type;
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.name:
            return FEEDER_TYPES.TWO_WINDINGS_TRANSFORMER.type;
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.name:
            return FEEDER_TYPES.THREE_WINDINGS_TRANSFORMER.type;
        default: {
            console.log('bad equipment type ', equipmentType);
            return null;
        }
    }
}

export const useDiagram = () => {
    const dispatch = useDispatch();

    const openDiagramView = useCallback(
        (id, type) => {
            dispatch(openDiagram(id, type));
        },
        [dispatch]
    );

    const togglePinDiagramView = useCallback(
        (id, type) => {
            dispatch(togglePinDiagram(id, type));
        },
        [dispatch]
    );

    const minimizeDiagramView = useCallback(
        (id, type) => {
            dispatch(minimizeDiagram(id, type));
        },
        [dispatch]
    );

    const closeDiagramView = useCallback(
        (id, type) => {
            dispatch(closeDiagram(id, type));
        },
        [dispatch]
    );

    const closeDiagramViews = useCallback(
        (idsToRemove) => {
            dispatch(closeDiagrams(idsToRemove));
        },
        [dispatch]
    );

    return {
        openDiagramView,
        minimizeDiagramView,
        togglePinDiagramView,
        closeDiagramView,
        closeDiagramViews,
    };
};

export const NoSvg = {
    svg: null,
    metadata: null,
    additionalMetadata: null,
    error: null,
};
