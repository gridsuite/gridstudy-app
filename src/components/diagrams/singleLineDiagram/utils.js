/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { SvgType } from './single-line-diagram';
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
