/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import makeStyles from '@mui/styles/makeStyles';

import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    closeSld,
    minimizeSld,
    openSld,
    togglePinSld,
} from '../../redux/actions';
import { syncSldStateWithSessionStorage } from '../../redux/session-storage';
import {
    INVALID_LOADFLOW_OPACITY,
    NAD_INVALID_LOADFLOW_OPACITY,
} from '../../utils/colors';
import { equipments } from '../network/network-equipments';

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

export const useStyles = makeStyles((theme) => ({
    divNad: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
            width: '100%',
        },
        '& .nad-text-nodes': {
            fill: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },

        '& .nad-edge-infos text': {
            stroke: theme.palette.background.default,
        },

        '& .nad-branch-edges circle': {
            fill: theme.palette.background.default,
        },

        overflow: 'hidden',
    },
    divSld: {
        '& svg': {
            // necessary because the default (inline-block) adds vertical space
            // to our otherwise pixel accurate computations (this makes a
            // scrollbar appear in fullscreen mode)
            display: 'block',
        },
        '& polyline': {
            pointerEvents: 'none',
        },
        '& .sld-label, .sld-graph-label': {
            fill: theme.palette.text.primary,
            'font-family': theme.typography.fontFamily,
        },
        '& .sld-disconnector:not(.sld-fictitious), :not(.sld-breaker):not(.sld-disconnector):not(.sld-load-break-switch).sld-disconnected, .sld-feeder-disconnected, .sld-feeder-disconnected-connected':
            {
                stroke: theme.palette.text.primary,
            },
        '& .arrow': {
            fill: theme.palette.text.primary,
        },
        '& .sld-flash, .sld-lock': {
            stroke: 'none',
            fill: theme.palette.text.primary,
        },
        overflow: 'hidden',
    },
    divInvalid: {
        '& .nad-edge-infos': {
            opacity: NAD_INVALID_LOADFLOW_OPACITY,
        },
        '& .sld-arrow-p, .sld-arrow-q': {
            opacity: INVALID_LOADFLOW_OPACITY,
        },
    },
    close: {
        padding: 0,
    },
    actionIcon: {
        padding: 0,
        borderRight: theme.spacing(1),
    },
    pinRotate: {
        padding: 0,
        borderRight: theme.spacing(1),
        transform: 'rotate(45deg)',
    },
    header: {
        padding: 5,
        display: 'flex',
        flexDirection: 'row',
        wordBreak: 'break-all',
        backgroundColor: theme.palette.background.default,
    },
    fullScreenIcon: {
        bottom: 5,
        right: 5,
        position: 'absolute',
        cursor: 'pointer',
    },
    plusIcon: {
        bottom: 5,
        left: 30,
        position: 'absolute',
        cursor: 'pointer',
    },
    lessIcon: {
        bottom: 5,
        left: 5,
        position: 'absolute',
        cursor: 'pointer',
    },
    depth: {
        bottom: 25,
        left: 5,
        position: 'absolute',
    },
    paperBorders: {
        borderLeft: '1px solid ' + theme.palette.action.disabled,
        borderBottom: '1px solid ' + theme.palette.action.disabledBackground,
        borderRight: '1px solid ' + theme.palette.action.hover,
    },
}));

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
            openSldView(SvgType.VOLTAGE_LEVEL, voltageLevelId);
        },
        [openSldView]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            openSldView(SvgType.SUBSTATION, substationId);
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

export function getNameOrId(value) {
    return value?.name ?? value?.id;
}

export function getSubstationNameOrId(value) {
    return value?.substationName ?? value?.substationId;
}
