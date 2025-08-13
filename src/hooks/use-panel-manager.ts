/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useRef, useState, useCallback, useEffect, RefObject } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setToggleOptions } from 'redux/actions';
import { StudyDisplayMode } from '../components/network-modification.type';
import { PANEL_CONFIG } from '../constants/panel.constants';
import { AppState } from 'redux/reducer';

interface PanelRef {
    getSize?: () => number;
    expand: () => void;
    collapse: () => void;
}

interface PanelVisibility {
    tree: boolean;
    modifications: boolean;
    grid: boolean;
    leftGroup: boolean;
    modificationsHandle: boolean;
    gridHandle: boolean;
}

interface PanelRefs {
    leftPanelGroupRef: RefObject<PanelRef>;
    treePanelRef: RefObject<PanelRef>;
    modificationsPanelRef: RefObject<PanelRef>;
    gridPanelRef: RefObject<PanelRef>;
    treePanelResizeHandlerRef: RefObject<(() => void) | null>;
}

interface PanelState {
    leftGroupDirection: 'vertical' | 'horizontal';
    modificationsPanelMinSize: number;
    visibility: PanelVisibility;
}

interface PanelHandlers {
    handleResize: () => void;
    handlePanelCollapse: (mode: StudyDisplayMode) => void;
}

interface UsePanelManagerReturn {
    refs: PanelRefs;
    state: PanelState;
    handlers: PanelHandlers;
}

export function usePanelManager(): UsePanelManagerReturn {
    const dispatch = useDispatch();
    const toggleOptions = useSelector((state: AppState) => state.toggleOptions);

    // Refs
    const leftPanelGroupRef = useRef<PanelRef>(null);
    const treePanelRef = useRef<PanelRef>(null);
    const modificationsPanelRef = useRef<PanelRef>(null);
    const gridPanelRef = useRef<PanelRef>(null);
    const treePanelResizeHandlerRef = useRef<(() => void) | null>(null);

    // State
    const [leftGroupDirection, setLeftGroupDirection] = useState<'vertical' | 'horizontal'>('vertical');
    const [modificationsPanelMinSize, setModificationsPanelMinSize] = useState<number>(PANEL_CONFIG.MIN_SIZE);

    // Visibility calculations
    const visibility: PanelVisibility = {
        tree: toggleOptions.includes(StudyDisplayMode.TREE),
        modifications: toggleOptions.includes(StudyDisplayMode.MODIFICATIONS),
        grid: toggleOptions.includes(StudyDisplayMode.DIAGRAM_GRID_LAYOUT),
        leftGroup: false,
        modificationsHandle: false,
        gridHandle: false,
    };

    visibility.leftGroup = visibility.tree || visibility.modifications;
    visibility.modificationsHandle = visibility.modifications;
    visibility.gridHandle = visibility.tree && visibility.grid;

    // Panel size calculation
    const calculateModificationsPanelMinSize = useCallback(() => {
        const leftGroupSize = leftPanelGroupRef.current?.getSize?.();
        if (!leftGroupSize) {
            return;
        }

        const targetPercent = (PANEL_CONFIG.TARGET_SCREEN_PERCENT / leftGroupSize) * 100;
        const finalSize = Math.max(targetPercent, PANEL_CONFIG.TARGET_SCREEN_PERCENT);

        setModificationsPanelMinSize(finalSize);
    }, []);

    // Auto-minimize root network panel
    const checkAndMinimizeRootNetworkPanel = useCallback(() => {
        const size = leftPanelGroupRef.current?.getSize?.();
        if (size && size < PANEL_CONFIG.MINIMIZE_THRESHOLD) {
            window.dispatchEvent(new CustomEvent('minimizeRootNetworkPanel'));
        }
    }, []);

    // Check on initial mount
    useEffect(() => {
        checkAndMinimizeRootNetworkPanel();
    }, [checkAndMinimizeRootNetworkPanel]);

    // Resize handler
    const handleResize = useCallback(() => {
        const size = leftPanelGroupRef.current?.getSize?.();
        if (!size) {
            return;
        }

        checkAndMinimizeRootNetworkPanel();

        // Update direction
        setLeftGroupDirection((prev) => {
            if (size < PANEL_CONFIG.DIRECTION_THRESHOLD && prev === 'horizontal') {
                return 'vertical';
            }
            if (size >= PANEL_CONFIG.DIRECTION_THRESHOLD && prev === 'vertical') {
                return 'horizontal';
            }
            return prev;
        });

        // Recalculate modifications panel size
        calculateModificationsPanelMinSize();

        // Trigger tree resize
        if (treePanelResizeHandlerRef.current) {
            setTimeout(treePanelResizeHandlerRef.current, 100);
        }
    }, [calculateModificationsPanelMinSize, checkAndMinimizeRootNetworkPanel]);

    // Panel collapse handler
    const handlePanelCollapse = useCallback(
        (mode: StudyDisplayMode) => {
            const filters: Partial<Record<StudyDisplayMode, StudyDisplayMode[]>> = {
                [StudyDisplayMode.TREE]: [StudyDisplayMode.TREE, StudyDisplayMode.MODIFICATIONS],
                [StudyDisplayMode.MODIFICATIONS]: [StudyDisplayMode.MODIFICATIONS],
                [StudyDisplayMode.DIAGRAM_GRID_LAYOUT]: [StudyDisplayMode.DIAGRAM_GRID_LAYOUT],
            };

            const filtered = toggleOptions.filter((option) => !filters[mode]?.includes(option));
            dispatch(setToggleOptions(filtered));
        },
        [dispatch, toggleOptions]
    );

    // Panel visibility effect
    useEffect(() => {
        const panels = [
            { ref: leftPanelGroupRef, visible: visibility.leftGroup },
            { ref: modificationsPanelRef, visible: visibility.modifications },
            { ref: gridPanelRef, visible: visibility.grid },
        ];

        panels.forEach(({ ref, visible }) => {
            if (ref.current) {
                visible ? ref.current.expand() : ref.current.collapse();
            }
        });
    }, [visibility.leftGroup, visibility.modifications, visibility.grid]);

    return {
        refs: {
            leftPanelGroupRef,
            treePanelRef,
            modificationsPanelRef,
            gridPanelRef,
            treePanelResizeHandlerRef,
        },
        state: {
            leftGroupDirection,
            modificationsPanelMinSize,
            visibility,
        },
        handlers: {
            handleResize,
            handlePanelCollapse,
        },
    };
}
