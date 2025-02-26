import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { DiagramType } from './diagram.type';
import { closeDiagram, closeDiagrams, minimizeDiagram, openDiagram, togglePinDiagram } from '../../redux/actions';

import { AppDispatch } from '../../redux/store';

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
