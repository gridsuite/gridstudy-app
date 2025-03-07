/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { useCallback } from 'react';
import { DiagramType } from './diagram.type';
import { closeDiagram, closeDiagrams, minimizeDiagram, openDiagram, togglePinDiagram } from '../../redux/actions';

export const useDiagram = () => {
    const dispatch = useDispatch<AppDispatch>();

    const openDiagramView = useCallback(
        (id: string, type: DiagramType) => {
            dispatch(openDiagram(id, type));
        },
        [dispatch]
    );

    const togglePinDiagramView = useCallback(
        (id: string, type: DiagramType) => {
            dispatch(togglePinDiagram(id, type));
        },
        [dispatch]
    );

    const minimizeDiagramView = useCallback(
        (id: string, type: DiagramType) => {
            dispatch(minimizeDiagram(id, type));
        },
        [dispatch]
    );

    const closeDiagramView = useCallback(
        (id: string, type: DiagramType) => {
            dispatch(closeDiagram(id, type));
        },
        [dispatch]
    );

    const closeDiagramViews = useCallback(
        (idsToRemove: string[]) => {
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
