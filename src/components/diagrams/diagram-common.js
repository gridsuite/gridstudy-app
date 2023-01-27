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
import { equipments } from '../network/network-equipments';

export const LOADING_WIDTH = 150;
export const MAX_WIDTH_VOLTAGE_LEVEL = 800;
export const MAX_HEIGHT_VOLTAGE_LEVEL = 700;
export const MAX_WIDTH_SUBSTATION = 1200;
export const MAX_HEIGHT_SUBSTATION = 700;
export const MAX_WIDTH_NETWORK_AREA_DIAGRAM = 1200;
export const MAX_HEIGHT_NETWORK_AREA_DIAGRAM = 650;

// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
export const MAP_BOTTOM_OFFSET = 80;
export const BORDERS = 2; // we use content-size: border-box so this needs to be included..

export const commonSldStyle = (theme, customStyle) => {
    return {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
            width: '100%',
            height: '100%',
        },
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
        overflow: 'hidden',
        ...customStyle,
    };
};

export const commonNadStyle = (theme, customStyle) => {
    return {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
            width: '100%',
            height: '100%',
        },
        '& .nad-label-box': {
            color: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .nad-text-edges': {
            stroke: theme.palette.text.primary,
        },
        overflow: 'hidden',
        ...customStyle,
    };
};

export const commonDiagramStyle = (theme, customStyle) => {
    return {
        divInvalid: {
            '& .sld-active-power, .sld-reactive-power, .sld-voltage, .sld-angle':
                {
                    opacity: INVALID_LOADFLOW_OPACITY,
                },
            '& .nad-edge-infos': {
                opacity: NAD_INVALID_LOADFLOW_OPACITY,
            },
        },
        paperBorders: {
            borderLeft: '1px solid ' + theme.palette.action.disabled,
            borderBottom:
                '1px solid ' + theme.palette.action.disabledBackground,
            borderRight: '1px solid ' + theme.palette.action.hover,
        },
        ...customStyle,
    };
};

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

export const SvgType = {
    VOLTAGE_LEVEL: 'voltage-level',
    SUBSTATION: 'substation',
    NETWORK_AREA_DIAGRAM: 'network-area-diagram',
};

export function getEquipmentTypeFromFeederType(feederType) {
    switch (feederType) {
        case 'LINE':
            return equipments.lines;
        case 'LOAD':
            return equipments.loads;
        case 'BATTERY':
            return equipments.batteries;
        case 'DANGLING_LINE':
            return equipments.danglingLines;
        case 'GENERATOR':
            return equipments.generators;
        case 'VSC_CONVERTER_STATION':
            return equipments.vscConverterStations;
        case 'LCC_CONVERTER_STATION':
            return equipments.lccConverterStations;
        case 'HVDC_LINE':
            return equipments.hvdcLines;
        case 'CAPACITOR':
        case 'INDUCTOR':
            return equipments.shuntCompensators;
        case 'STATIC_VAR_COMPENSATOR':
            return equipments.staticVarCompensators;
        case 'TWO_WINDINGS_TRANSFORMER':
        case 'TWO_WINDINGS_TRANSFORMER_LEG':
        case 'PHASE_SHIFT_TRANSFORMER':
            return equipments.twoWindingsTransformers;
        case 'THREE_WINDINGS_TRANSFORMER':
        case 'THREE_WINDINGS_TRANSFORMER_LEG':
            return equipments.threeWindingsTransformers;
        default: {
            console.log('bad feeder type ', feederType);
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

export const NoSvg = { svg: null, metadata: null, error: null, svgUrl: null };

// Compute the paper and svg sizes. Returns undefined if the preferred sizes are undefined.
export const computePaperAndSvgSizesIfReady = (
    isFullScreenActive,
    svgType,
    totalWidth,
    totalHeight,
    svgPreferredWidth,
    svgPreferredHeight,
    headerPreferredHeight
) => {
    if (svgPreferredWidth != null && headerPreferredHeight != null) {
        let paperWidth, paperHeight, svgWidth, svgHeight;
        if (isFullScreenActive) {
            paperWidth = totalWidth;
            paperHeight = totalHeight;
            svgWidth = totalWidth - BORDERS;
            svgHeight = totalHeight - headerPreferredHeight - BORDERS;
        } else {
            let tempMaxWidth, tempMaxHeight;
            switch (svgType) {
                case SvgType.VOLTAGE_LEVEL:
                    tempMaxWidth = MAX_WIDTH_VOLTAGE_LEVEL;
                    tempMaxHeight = MAX_HEIGHT_VOLTAGE_LEVEL;
                    break;
                case SvgType.SUBSTATION:
                    tempMaxWidth = MAX_WIDTH_SUBSTATION;
                    tempMaxHeight = MAX_HEIGHT_SUBSTATION;
                    break;
                case SvgType.NETWORK_AREA_DIAGRAM:
                    tempMaxWidth = MAX_WIDTH_NETWORK_AREA_DIAGRAM;
                    tempMaxHeight = MAX_HEIGHT_NETWORK_AREA_DIAGRAM;
                    break;
                default:
                    console.warn(
                        'Unknown type in computePaperAndSvgSizesIfReady'
                    );
                    tempMaxWidth = tempMaxHeight = LOADING_WIDTH;
            }
            svgWidth = Math.min(svgPreferredWidth, totalWidth, tempMaxWidth);
            svgHeight = Math.min(
                svgPreferredHeight,
                totalHeight - MAP_BOTTOM_OFFSET - headerPreferredHeight,
                tempMaxHeight
            );
            paperWidth = svgWidth + BORDERS;
            paperHeight = svgHeight + headerPreferredHeight + BORDERS;
        }
        return { paperWidth, paperHeight, svgWidth, svgHeight };
    }
};
