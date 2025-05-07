/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { useCallback } from 'react';
import { DiagramType } from './diagram.type';
import {
    closeDiagram,
    closeDiagrams,
    loadNadFromConfig,
    minimizeDiagram,
    openDiagram,
    togglePinDiagram,
} from '../../redux/actions';
import { AppState } from 'redux/reducer';

export const useDiagramApi = () => {
    // context
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
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

    const loadNadFromConfigView = useCallback(
        (nadConfigUuid: string, nadName: string) => {
            dispatch(loadNadFromConfig(nadConfigUuid, nadName));
        },
        [dispatch]
    );

    const emptyFunction = useCallback(() => {}, []);

    if (!studyUuid || !currentNode || !currentRootNetworkUuid) {
        return {
            openDiagramView: emptyFunction,
            minimizeDiagramView: emptyFunction,
            togglePinDiagramView: emptyFunction,
            closeDiagramView: emptyFunction,
            closeDiagramViews: emptyFunction,
            loadNadFromConfigView: emptyFunction,
        };
    }

    return {
        openDiagramView,
        minimizeDiagramView,
        togglePinDiagramView,
        closeDiagramView,
        closeDiagramViews,
        loadNadFromConfigView,
    };
};
