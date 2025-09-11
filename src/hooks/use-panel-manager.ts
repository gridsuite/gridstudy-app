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
    eventScenario: boolean;
    grid: boolean;
    modificationsOrEventScenario: boolean;
    treeAndModificationsGroup: boolean;
    modificationsResizeHandle: boolean;
    gridResizeHandle: boolean;
}

interface PanelRefs {
    treeAndModificationsPanelGroupRef: RefObject<PanelRef>;
    treePanelRef: RefObject<PanelRef>;
    modificationsPanelRef: RefObject<PanelRef>;
    gridPanelRef: RefObject<PanelRef>;
    onTreePanelResizeHandlerRef: RefObject<(() => void) | null>;
}

interface PanelState {
    treeAndModificationsGroupDirection: 'vertical' | 'horizontal';
    modificationsPanelMinSize: number;
    visibility: PanelVisibility;
}

interface PanelHandlers {
    handleResize: () => void;
    handlePanelCollapse: (mode: StudyDisplayMode) => void;
    handlePanelExpand: (mode: StudyDisplayMode) => void;
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
    const treeAndModificationsPanelGroupRef = useRef<PanelRef>(null);
    const treePanelRef = useRef<PanelRef>(null);
    const modificationsPanelRef = useRef<PanelRef>(null);
    const gridPanelRef = useRef<PanelRef>(null);
    const onTreePanelResizeHandlerRef = useRef<(() => void) | null>(null);

    // State
    const [treeAndModificationsGroupDirection, setTreeAndModificationsGroupDirection] = useState<
        'vertical' | 'horizontal'
    >('vertical');
    const [modificationsPanelMinSize, setModificationsPanelMinSize] = useState<number>(PANEL_CONFIG.MIN_SIZE);

    // Visibility calculations
    const visibility: PanelVisibility = {
        tree: toggleOptions.includes(StudyDisplayMode.TREE),
        modifications: toggleOptions.includes(StudyDisplayMode.MODIFICATIONS),
        eventScenario: toggleOptions.includes(StudyDisplayMode.EVENT_SCENARIO),
        modificationsOrEventScenario:
            toggleOptions.includes(StudyDisplayMode.MODIFICATIONS) ||
            toggleOptions.includes(StudyDisplayMode.EVENT_SCENARIO),
        grid: toggleOptions.includes(StudyDisplayMode.GRID_LAYOUT_PANEL),
        treeAndModificationsGroup: false,
        modificationsResizeHandle: false,
        gridResizeHandle: false,
    };

    visibility.treeAndModificationsGroup = visibility.tree || visibility.modificationsOrEventScenario;
    visibility.modificationsResizeHandle = visibility.modificationsOrEventScenario;
    visibility.gridResizeHandle = visibility.tree && visibility.grid;

    // Panel size calculation
    const calculateModificationsPanelMinSize = useCallback(() => {
        const treeAndModificationsGroupSize = treeAndModificationsPanelGroupRef.current?.getSize?.();
        if (!treeAndModificationsGroupSize) {
            return;
        }

        const targetPercent = (PANEL_CONFIG.MIN_SIZE / treeAndModificationsGroupSize) * 100;
        const finalSize = Math.min(Math.max(targetPercent, PANEL_CONFIG.MIN_SIZE), PANEL_CONFIG.MAX_SIZE);

        setModificationsPanelMinSize(finalSize);
    }, []);

    // Auto-minimize root network panel
    const checkAndMinimizeRootNetworkPanel = useCallback(() => {
        const size = treeAndModificationsPanelGroupRef.current?.getSize?.();
        if (size && size < PANEL_CONFIG.MINIMIZE_THRESHOLD && visibility.modificationsOrEventScenario) {
            window.dispatchEvent(new CustomEvent('minimizeRootNetworkPanel'));
        }
    }, [visibility.modificationsOrEventScenario]);

    // Check on initial mount
    useEffect(() => {
        checkAndMinimizeRootNetworkPanel();
    }, [checkAndMinimizeRootNetworkPanel]);

    // Resize handler
    const handleResize = useCallback(() => {
        const size = treeAndModificationsPanelGroupRef.current?.getSize?.();
        if (!size) {
            return;
        }

        checkAndMinimizeRootNetworkPanel();

        // Update direction
        setTreeAndModificationsGroupDirection((prev) => {
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
        if (onTreePanelResizeHandlerRef.current) {
            setTimeout(onTreePanelResizeHandlerRef.current, 100);
        }
    }, [calculateModificationsPanelMinSize, checkAndMinimizeRootNetworkPanel]);

    // Panel collapse handler
    const handlePanelCollapse = useCallback(
        (mode: StudyDisplayMode) => {
            if (!toggleOptions.includes(mode)) {
                return;
            }
            const filters: Partial<Record<StudyDisplayMode, StudyDisplayMode[]>> = {
                [StudyDisplayMode.TREE]: [
                    StudyDisplayMode.TREE,
                    StudyDisplayMode.MODIFICATIONS,
                    StudyDisplayMode.EVENT_SCENARIO,
                ],
                [StudyDisplayMode.MODIFICATIONS]: [StudyDisplayMode.MODIFICATIONS],
                [StudyDisplayMode.EVENT_SCENARIO]: [StudyDisplayMode.EVENT_SCENARIO],
                [StudyDisplayMode.GRID_LAYOUT_PANEL]: [StudyDisplayMode.GRID_LAYOUT_PANEL],
            };

            const filtered = toggleOptions.filter((option) => !filters[mode]?.includes(option));
            dispatch(setToggleOptions(filtered));
        },
        [dispatch, toggleOptions]
    );

    // Panel expand handler
    // used to solve the issue when user collapses the panel and then tries to expand it again
    // while keeping the mouse down
    const handlePanelExpand = useCallback(
        (mode: StudyDisplayMode) => {
            if (toggleOptions.includes(mode)) {
                return;
            }
            dispatch(setToggleOptions([...toggleOptions, mode]));
        },
        [dispatch, toggleOptions]
    );

    // Panel visibility effect
    useEffect(() => {
        const panels = [
            { ref: treeAndModificationsPanelGroupRef, visible: visibility.treeAndModificationsGroup },
            { ref: modificationsPanelRef, visible: visibility.modificationsOrEventScenario },
            { ref: gridPanelRef, visible: visibility.grid },
        ];

        panels.forEach(({ ref, visible }) => {
            if (ref.current) {
                visible ? ref.current.expand() : ref.current.collapse();
            }
        });
    }, [visibility.treeAndModificationsGroup, visibility.modificationsOrEventScenario, visibility.grid]);

    return {
        refs: {
            treeAndModificationsPanelGroupRef,
            treePanelRef,
            modificationsPanelRef,
            gridPanelRef,
            onTreePanelResizeHandlerRef,
        },
        state: {
            treeAndModificationsGroupDirection,
            modificationsPanelMinSize,
            visibility,
        },
        handlers: {
            handleResize,
            handlePanelCollapse,
            handlePanelExpand,
        },
    };
}
