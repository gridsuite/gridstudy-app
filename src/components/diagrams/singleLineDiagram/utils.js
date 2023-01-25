/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    closeSld,
    minimizeSld,
    openSld,
    togglePinSld,
} from '../../../redux/actions';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { syncSldStateWithSessionStorage } from '../../../redux/session-storage';
import { EQUIPMENT_TYPES } from '../../util/equipment-types';

export const LOADING_WIDTH = 150;
export const MAX_WIDTH_VOLTAGE_LEVEL = 800;
export const MAX_HEIGHT_VOLTAGE_LEVEL = 700;
export const MAX_WIDTH_SUBSTATION = 1200;
export const MAX_HEIGHT_SUBSTATION = 700;

// To allow controls that are in the corners of the map to not be hidden in normal mode
// (but they are still hidden in fullscreen mode)
export const MAP_RIGHT_OFFSET = 120;
export const MAP_BOTTOM_OFFSET = 80;
export const BORDERS = 2; // we use content-size: border-box so this needs to be included..

export const commonSldStyle = (theme, customSldStyle) => {
    return {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
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
        ...customSldStyle,
    };
};

export const commonStyle = (theme, customStyle) => {
    return {
        close: {
            padding: 0,
            borderRight: theme.spacing(1),
        },
        header: {
            padding: 5,
            display: 'flex',
            flexDirection: 'row',
            wordBreak: 'break-all',
            backgroundColor: theme.palette.background.default,
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

export function getArray(value) {
    if (value === undefined) return [];
    return !Array.isArray(value) ? [value] : value;
}

export const useSingleLineDiagram = () => {
    const dispatch = useDispatch();
    const sldState = useSelector((state) => state.sldState);
    const studyUuid = useSelector((state) => state.studyUuid);

    useEffect(() => {
        syncSldStateWithSessionStorage(sldState, studyUuid);
    }, [sldState, studyUuid]);

    const openSldView = useCallback(
        (type, id) => {
            dispatch(openSld(id, type));
        },
        [dispatch]
    );

    const togglePinSldView = useCallback(
        (id) => {
            dispatch(togglePinSld(id));
        },
        [dispatch]
    );

    const minimizeSldView = useCallback(
        (id) => {
            dispatch(minimizeSld(id));
        },
        [dispatch]
    );

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            openSldView(EQUIPMENT_TYPES.VOLTAGE_LEVEL.type, voltageLevelId);
        },
        [openSldView]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            openSldView(EQUIPMENT_TYPES.SUBSTATION.type, substationId);
        },
        [openSldView]
    );

    const closeDiagram = useCallback(
        (idsToRemove) => {
            const toRemove = Array.isArray(idsToRemove)
                ? idsToRemove
                : [idsToRemove];

            dispatch(closeSld(toRemove));
        },
        [dispatch]
    );

    return [
        closeDiagram,
        showVoltageLevelDiagram,
        showSubstationDiagram,
        togglePinSldView,
        minimizeSldView,
    ];
};

export const SubstationLayout = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    SMART: 'smart',
    SMARTHORIZONTALCOMPACTION: 'smartHorizontalCompaction',
    SMARTVERTICALCOMPACTION: 'smartVerticalCompaction',
};

export const NoSvg = { svg: null, metadata: null, error: null, svgUrl: null };
