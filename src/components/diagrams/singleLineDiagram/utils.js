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

export function setWidthAndHeight(
    svg,
    finalPaperWidth,
    finalPaperHeight,
    loadingState,
    totalWidth,
    initialHeight,
    initialWidth,
    errorWidth
) {
    let sizeWidth,
        sizeHeight = initialHeight;
    if (svg.error) {
        sizeWidth = errorWidth;
    } else if (finalPaperWidth && finalPaperHeight) {
        sizeWidth = finalPaperWidth;
        sizeHeight = finalPaperHeight;
    } else if (initialWidth !== undefined || loadingState) {
        sizeWidth = initialWidth;
    } else {
        sizeWidth = totalWidth; // happens during initialization if initial width value is undefined
    }

    if (sizeWidth !== undefined) {
        initialWidth = sizeWidth; // setting initial width for the next SLD.
    }
    if (sizeHeight !== undefined) {
        initialHeight = sizeHeight; // setting initial height for the next SLD.
    }
    return { sizeWidth, sizeHeight };
}

// Compute the paper and svg sizes. Returns undefined if the preferred sizes are undefined.
export function computePaperAndSvgSizesIfReady(
    fullScreen,
    svgType,
    totalWidth,
    totalHeight,
    svgPreferredWidth,
    svgPreferredHeight,
    headerPreferredHeight,
    borders,
    maxWidthVoltageLevel,
    maxHeightVoltageLevel,
    maxWidthSubstation,
    maxHeightSubstation,
    mapRightOffset,
    mapBottomOffset
) {
    if (
        typeof svgPreferredWidth != 'undefined' &&
        typeof headerPreferredHeight != 'undefined'
    ) {
        let paperWidth, paperHeight, svgWidth, svgHeight;
        if (fullScreen) {
            paperWidth = totalWidth;
            paperHeight = totalHeight;
            svgWidth = totalWidth - borders;
            svgHeight = totalHeight - headerPreferredHeight - borders;
        } else {
            let maxWidth, maxHeight;
            if (svgType === SvgType.VOLTAGE_LEVEL) {
                maxWidth = maxWidthVoltageLevel;
                maxHeight = maxHeightVoltageLevel;
            } else {
                maxWidth = maxWidthSubstation;
                maxHeight = maxHeightSubstation;
            }
            svgWidth = Math.min(
                svgPreferredWidth,
                totalWidth - mapRightOffset,
                maxWidth
            );
            svgHeight = Math.min(
                svgPreferredHeight,
                totalHeight - mapBottomOffset - headerPreferredHeight,
                maxHeight
            );
            paperWidth = svgWidth + borders;
            paperHeight = svgHeight + headerPreferredHeight + borders;
        }
        return { paperWidth, paperHeight, svgWidth, svgHeight };
    }
}

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
};
