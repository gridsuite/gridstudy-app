/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState, useMemo } from 'react';
import { type ItemCallback, type Layout, type Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useDiagramModel } from './hooks/use-diagram-model';
import { Diagram, DiagramParams, DiagramType } from './cards/diagrams/diagram.type';
import { Box, useTheme } from '@mui/material';
import {
    ElementType,
    type EquipmentInfos,
    EquipmentType,
    type MuiStyles,
    useDebounce,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import { useDiagramsGridLayoutInitialization } from './hooks/use-diagrams-grid-layout-initialization';
import { v4 } from 'uuid';
import { GridLayoutToolbar } from './grid-layout-toolbar';
import './grid-layout-panel.css';
import { DiagramCard } from './cards/diagrams/diagram-card';
import { BLINK_LENGTH_MS } from './cards/custom-card-header';
import CustomResizeHandle from './custom-resize-handle';
import { useSaveDiagramLayout } from './hooks/use-save-diagram-layout';
import { isThereTooManyOpenedNadDiagrams } from './cards/diagrams/diagram-utils';
import { resetMapEquipment, setMapDataLoading, setOpenMap, setReloadMapNeeded } from 'redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import MapDialog from './dialog/map-dialog';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
} as const satisfies MuiStyles;

const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [DiagramType.VOLTAGE_LEVEL, DiagramType.SUBSTATION, DiagramType.NETWORK_AREA_DIAGRAM];

const GRID_CONFIG = {
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 8, md: 8, sm: 6, xs: 4, xxs: 2 },
    defaultCard: { w: 2, h: 2 },
};

/**
 * Get the visual order of cards sorted by their position (top to bottom, left to right)
 * This ensures consistent ordering across different breakpoints
 */
const getVisualOrder = (layout: Layout[]): string[] => {
    return layout?.length ? [...layout].sort((a, b) => a.y - b.y || a.x - b.x).map((item) => item.i) : [];
};

/**
 * Reflow cards to a new grid layout while maintaining their visual order
 * Used when switching breakpoints or propagating order changes
 */
const rearrangeLayoutByOrder = (sourceLayout: Layout[], targetCols: number, visualOrder: string[]): Layout[] => {
    if (!sourceLayout?.length || !visualOrder?.length) {
        return sourceLayout || [];
    }

    // Create a lookup map for quick card access by ID
    const cardMap = new Map(sourceLayout.map((item) => [item.i, item]));
    const newLayout: Layout[] = [];
    let currentX = 0;
    let currentY = 0;
    let rowMaxHeight = 0;

    // Place cards in the specified order, wrapping to new rows as needed
    for (const cardId of visualOrder) {
        const card = cardMap.get(cardId);
        if (!card) {
            continue;
        }

        // Move to next row if card doesn't fit in current row
        if (currentX + card.w > targetCols) {
            currentY += rowMaxHeight;
            currentX = 0;
            rowMaxHeight = 0;
        }

        // Place card at current position and advance X coordinate
        newLayout.push({ ...card, x: currentX, y: currentY });
        currentX += card.w;

        // Track the tallest card in the current row
        rowMaxHeight = Math.max(rowMaxHeight, card.h);
    }

    return newLayout;
};

// Generate initial layouts for all breakpoints
const generateInitialLayouts = (): Layouts => {
    return Object.keys(GRID_CONFIG.cols).reduce((layouts, breakpoint) => {
        layouts[breakpoint] = [];
        return layouts;
    }, {} as Layouts);
};

/**
 * Find the next available position for a new card in the grid
 * Uses bottom-to-top, left-to-right placement strategy
 */
const findNextPosition = (existingLayouts: Layout[], maxCols: number) => {
    if (existingLayouts.length === 0) {
        return { x: 0, y: 0 };
    }

    // Find the current bottom row
    const bottomY = Math.max(...existingLayouts.map((item) => item.y));

    // Calculate the next X position in the bottom row
    const rightmostX = existingLayouts.reduce((maxX, item) => {
        return item.y === bottomY ? Math.max(maxX, item.x + item.w) : maxX;
    }, 0);

    // Check if the new card fits in the current row
    if (rightmostX + GRID_CONFIG.defaultCard.w <= maxCols) {
        return { x: rightmostX, y: bottomY };
    }

    // Start a new row - find the lowest available Y position
    const nextY = Math.max(...existingLayouts.map((item) => item.y + item.h));
    return { x: 0, y: nextY };
};

/**
 * Create a layout item for all breakpoints with consistent positioning
 * Ensures new cards are added to all grid configurations simultaneously
 */
const createLayoutItem = (id: string, layouts: Layouts): Layouts => {
    const newLayouts = { ...layouts };

    // Add the new card to all breakpoints with appropriate positioning
    Object.entries(GRID_CONFIG.cols).forEach(([breakpoint, maxCols]) => {
        const existing = newLayouts[breakpoint] || [];
        const { x, y } = findNextPosition(existing, maxCols);
        newLayouts[breakpoint] = [
            ...existing,
            {
                i: id,
                x,
                y,
                ...GRID_CONFIG.defaultCard,
            },
        ];
    });
    return newLayouts;
};

const initialLayouts: Layouts = generateInitialLayouts();

interface GridLayoutPanelProps {
    studyUuid: UUID;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    showGrid: () => void;
    visible: boolean;
}

function GridLayoutPanel({ studyUuid, showInSpreadsheet, showGrid, visible }: Readonly<GridLayoutPanelProps>) {
    const theme = useTheme();
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [blinkingDiagrams, setBlinkingDiagrams] = useState<UUID[]>([]);
    const responsiveGridLayoutRef = useRef<any>(null);
    const currentBreakpointRef = useRef<string>('lg');
    const lastModifiedBreakpointRef = useRef<string>('lg'); // Track the last modified breakpoint
    const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
    const dispatch = useDispatch();
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const [disableStoreButton, setDisableStoreButton] = useState<boolean>(true);

    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);

    const { snackInfo, snackError } = useSnackMessage();

    // Blinking diagrams management
    const stopDiagramBlinking = useCallback((diagramUuid: UUID) => {
        setBlinkingDiagrams((old_blinking_diagrams) => old_blinking_diagrams.filter((uuid) => uuid !== diagramUuid));
    }, []);

    // Retry mechanism to handle cases where the diagram card hasn't been rendered yet
    // This can happen when a diagram is created when the grid is not visible and we immediately try to scroll to it
    // The retry logic gives the React rendering cycle time to complete
    const scrollDiagramIntoView = useCallback((diagramId: string, retries = 10) => {
        const attemptScroll = (remainingRetries: number) => {
            const container = responsiveGridLayoutRef.current?.elementRef?.current;
            const card = container?.querySelector(`[data-grid-id="${diagramId}"]`);

            if (card) {
                card.scrollIntoView({ behavior: 'smooth' });
            } else if (remainingRetries > 0) {
                // Card not found yet, retry after a short delay to allow rendering to complete
                setTimeout(() => attemptScroll(remainingRetries - 1), 50);
            }
        };

        attemptScroll(retries);
    }, []);

    const focusOnDiagram = useCallback(
        (diagramUuid: UUID) => {
            setBlinkingDiagrams((oldBlinkingDiagrams) => {
                if (oldBlinkingDiagrams.includes(diagramUuid)) {
                    return oldBlinkingDiagrams;
                }
                return [...oldBlinkingDiagrams, diagramUuid];
            });
            setTimeout(() => stopDiagramBlinking(diagramUuid), BLINK_LENGTH_MS);
            // Scroll to card after a short delay to allow DOM rendering
            scrollDiagramIntoView(diagramUuid);
        },
        [stopDiagramBlinking, scrollDiagramIntoView]
    );

    // Grid operations
    const addLayoutItem = useCallback((diagram: Diagram) => {
        lastModifiedBreakpointRef.current = currentBreakpointRef.current;
        setLayouts((currentLayouts) => createLayoutItem(diagram.diagramUuid, currentLayouts));
        setDisableStoreButton(false);
    }, []);

    const removeLayoutItem = useCallback((cardUuid: UUID | string) => {
        lastModifiedBreakpointRef.current = currentBreakpointRef.current;
        setLayouts((currentLayouts) => {
            const newLayouts: Layouts = {};

            // Filter out the card from all breakpoints
            for (const [breakpoint, layoutItems] of Object.entries(currentLayouts)) {
                newLayouts[breakpoint] = layoutItems.filter((layout) => layout.i !== cardUuid);
            }

            return newLayouts;
        });
        setDisableStoreButton(false);
    }, []);

    const loadingMapError = useMemo(() => {
        return !currentNode || !currentRootNetworkUuid;
    }, [currentNode, currentRootNetworkUuid]);

    const onOpenMap = useCallback(() => {
        if (loadingMapError) {
            snackError({ messageId: 'MapCardNotAvailable' });
            return;
        }
        dispatch(resetMapEquipment());
        dispatch(setMapDataLoading(false));
        dispatch(setReloadMapNeeded(true));
        dispatch(setOpenMap(true));
        setIsMapOpen(true);
    }, [dispatch, loadingMapError, snackError]);

    const handleCloseMap = useCallback(() => {
        setIsMapOpen(false);
    }, []);

    const {
        diagrams,
        loadingDiagrams,
        diagramErrors,
        globalError,
        removeDiagram,
        createDiagramWithFocus,
        updateDiagram,
        updateDiagramPositions,
    } = useDiagramModel({
        diagramTypes: diagramTypes,
        onAddDiagram: addLayoutItem,
        focusOnDiagram,
    });

    const handleUpdateDiagram = useCallback(
        (diagram: Diagram) => {
            setDisableStoreButton(false);
            updateDiagram(diagram);
        },
        [updateDiagram]
    );

    const handleUpdateDiagramPositions = useCallback(
        (diagramParams: DiagramParams) => {
            setDisableStoreButton(false);
            updateDiagramPositions(diagramParams);
        },
        [updateDiagramPositions]
    );

    const onRemoveCard = useCallback(
        (diagramUuid: UUID) => {
            removeLayoutItem(diagramUuid);
            removeDiagram(diagramUuid);
        },
        [removeLayoutItem, removeDiagram]
    );

    const showVoltageLevelDiagram = useCallback(
        (element: EquipmentInfos) => {
            let diagram: DiagramParams | null = null;

            if (element.type === EquipmentType.VOLTAGE_LEVEL || element.voltageLevelId) {
                diagram = {
                    diagramUuid: v4() as UUID,
                    type: DiagramType.VOLTAGE_LEVEL,
                    voltageLevelId: element.voltageLevelId ?? '',
                    name: '',
                };
            } else if (element.type === EquipmentType.SUBSTATION) {
                diagram = {
                    diagramUuid: v4() as UUID,
                    type: DiagramType.SUBSTATION,
                    substationId: element.id,
                    name: '',
                };
            }

            if (diagram) {
                showGrid();
                createDiagramWithFocus(diagram);
            }
        },
        [createDiagramWithFocus, showGrid]
    );

    const handleLoadNad = useCallback(
        (elementUuid: UUID, elementType: ElementType, elementName: string) => {
            const diagram: DiagramParams = {
                diagramUuid: v4() as UUID,
                type: DiagramType.NETWORK_AREA_DIAGRAM,
                name: elementName,
                nadConfigUuid: elementType === ElementType.DIAGRAM_CONFIG ? elementUuid : undefined,
                filterUuid: elementType === ElementType.FILTER ? elementUuid : undefined,
                voltageLevelIds: [],
                voltageLevelToExpandIds: [],
                voltageLevelToOmitIds: [],
                positions: [],
            };
            createDiagramWithFocus(diagram);
        },
        [createDiagramWithFocus]
    );

    /**
     * Propagate the visual order from one breakpoint to all other breakpoints
     * This maintains consistency when users rearrange cards in any view
     * Only updates other breakpoints, preserves the source breakpoint layout
     */
    const propagateOrder = useCallback((sourceLayout: Layout[], sourceBreakpoint: string) => {
        const visualOrder = getVisualOrder(sourceLayout);
        if (!visualOrder.length) {
            return;
        }

        setLayouts((prevLayouts) => {
            const newLayouts = { ...prevLayouts, [sourceBreakpoint]: sourceLayout };

            // Update all other breakpoints with the new visual order
            Object.entries(GRID_CONFIG.cols).forEach(([breakpoint, targetCols]) => {
                if (breakpoint !== sourceBreakpoint && newLayouts[breakpoint]) {
                    newLayouts[breakpoint] = rearrangeLayoutByOrder(newLayouts[breakpoint], targetCols, visualOrder);
                }
            });

            return newLayouts;
        });
    }, []);

    // Event handlers for grid interactions
    const handleResize = useCallback<ItemCallback>((layout, oldItem, newItem, placeholder, event, _el) => {
        // We cannot use the ResponsiveGridLayout's innerRef prop (see https://github.com/react-grid-layout/react-grid-layout/issues/1444)
        // so we manually fetch its inner ref inside to get the HTMLDivElement.
        const container = responsiveGridLayoutRef.current?.elementRef?.current;
        if (!container) {
            return;
        }
        const { bottom } = container.getBoundingClientRect();
        if (event.clientY > bottom) {
            // Smooth step-based scrolling
            const scrollStep = 30; // smaller = slower
            const maxScroll = container.scrollHeight - container.clientHeight;

            // Only scroll if not already at the bottom
            if (container.scrollTop < maxScroll) {
                container.scrollTop = Math.min(container.scrollTop + scrollStep, maxScroll);
            }
        }
    }, []);

    /**
     * Handle card resizing across all breakpoints
     * Maintains consistent card dimensions regardless of screen size
     */
    const handleResizeStop = useCallback((layout: Layout[], oldItem: any, newItem: any) => {
        if (!newItem) {
            return;
        }

        lastModifiedBreakpointRef.current = currentBreakpointRef.current;
        setLayouts((currentLayouts) => {
            const newLayouts = { ...currentLayouts };

            // Update the resized item in all breakpoints
            for (const [breakpoint, layoutItems] of Object.entries(newLayouts)) {
                const itemIndex = (layoutItems as Layout[]).findIndex((item) => item.i === newItem.i);
                if (itemIndex !== -1) {
                    const items = layoutItems as Layout[];
                    newLayouts[breakpoint] = [
                        ...items.slice(0, itemIndex),
                        { ...items[itemIndex], w: newItem.w, h: newItem.h },
                        ...items.slice(itemIndex + 1),
                    ];
                }
            }

            // Persist the current breakpoint layout (captures any compaction moves during resize)
            newLayouts[currentBreakpointRef.current] = layout;

            return newLayouts;
        });
        setDisableStoreButton(false);
    }, []);

    /**
     * Handle breakpoint changes (screen size changes)
     * Maintains visual order consistency when switching between breakpoints
     * Updates the current breakpoint reference for future operations
     */
    const handleBreakpointChange = useCallback(
        (newBreakpoint: string) => {
            const sourceBreakpoint = lastModifiedBreakpointRef.current;
            currentBreakpointRef.current = newBreakpoint;

            if (sourceBreakpoint !== newBreakpoint && layouts[sourceBreakpoint]?.length > 0) {
                const sourceLayout = layouts[sourceBreakpoint];
                const visualOrder = getVisualOrder(sourceLayout);
                const targetCols = GRID_CONFIG.cols[newBreakpoint as keyof typeof GRID_CONFIG.cols];

                setLayouts((prev) => ({
                    ...prev,
                    [newBreakpoint]: rearrangeLayoutByOrder(prev[newBreakpoint] || [], targetCols, visualOrder),
                }));
            }
        },
        [layouts]
    );

    const handleDragStop = useCallback(
        (layout: Layout[]) => {
            lastModifiedBreakpointRef.current = currentBreakpointRef.current;
            // Ensure final order is propagated to all breakpoints
            propagateOrder(layout, currentBreakpointRef.current);
            setDisableStoreButton(false);
        },
        [propagateOrder]
    );

    // Save and Initialization
    const onLoadDiagramLayout = useCallback((savedLayouts: Layouts) => {
        if (Object.keys(savedLayouts).length > 0) {
            setLayouts(savedLayouts);
        } else {
            setLayouts(initialLayouts);
        }
        setDisableStoreButton(true);
    }, []);
    useDiagramsGridLayoutInitialization({ onLoadDiagramLayout });

    const onOpenNetworkAreaDiagram = useCallback(
        (elementId?: string) => {
            if (isThereTooManyOpenedNadDiagrams(diagrams)) {
                if (!elementId) {
                    return;
                }
                snackInfo({
                    messageId: 'NADOpenedInTheGrid',
                    messageValues: { elementId: elementId },
                });
            }
        },
        [diagrams, snackInfo]
    );

    const gridLayoutSave = useSaveDiagramLayout({ layouts, diagrams });

    // Debounce the layout save function to avoid excessive calls
    const debouncedGridLayoutSave = useDebounce(gridLayoutSave, 300);

    const handleGridLayoutSave = useCallback(() => {
        setDisableStoreButton(true);
        debouncedGridLayoutSave();
    }, [debouncedGridLayoutSave]);

    return (
        <Box sx={styles.container}>
            <GridLayoutToolbar
                onLoad={handleLoadNad}
                onSearch={showVoltageLevelDiagram}
                onOpenNetworkAreaDiagram={showGrid}
                onMap={onOpenMap}
                onLayoutSave={handleGridLayoutSave}
                disableStore={disableStoreButton}
            />
            <ResponsiveGridLayout
                ref={responsiveGridLayoutRef} // the provided innerRef prop is bugged (see https://github.com/react-grid-layout/react-grid-layout/issues/1444)
                autoSize={false} // This props should do the resizing for us but is bugged too. We force it to false, otherwise the grid has strange behaviors.
                onResize={handleResize} // We manually scroll down when resizing downward. This is a workaround due to the bugs.
                className="layout"
                breakpoints={GRID_CONFIG.breakpoints}
                cols={GRID_CONFIG.cols}
                margin={[parseInt(theme.spacing(1)), parseInt(theme.spacing(1))]}
                compactType={'vertical'}
                onResizeStop={handleResizeStop}
                onBreakpointChange={handleBreakpointChange}
                layouts={layouts}
                style={{
                    backgroundColor:
                        theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.background.paper,
                    flexGrow: 1,
                    padding: theme.spacing(1.5),
                    overflow: 'auto',
                }}
                draggableHandle=".react-grid-dragHandle"
                onDragStart={(layout, oldItem, newItem, placeholder, e, element) => {
                    if (e.target) {
                        (e.target as HTMLElement).style.cursor = 'grabbing';
                    }
                }}
                onDragStop={(layout, oldItem, newItem, placeholder, e, element) => {
                    if (e.target) {
                        (e.target as HTMLElement).style.cursor = 'grab';
                    }
                    handleDragStop(layout);
                }}
                resizeHandle={<CustomResizeHandle />}
            >
                {Object.values(diagrams).map((diagram) => {
                    return (
                        <DiagramCard
                            key={diagram.diagramUuid}
                            studyUuid={studyUuid}
                            visible={visible}
                            data-grid-id={diagram.diagramUuid}
                            diagram={diagram}
                            blinking={blinkingDiagrams.includes(diagram.diagramUuid)}
                            loading={loadingDiagrams.includes(diagram.diagramUuid)}
                            errorMessage={globalError || diagramErrors[diagram.diagramUuid]}
                            onClose={() => onRemoveCard(diagram.diagramUuid)}
                            showInSpreadsheet={showInSpreadsheet}
                            createDiagram={createDiagramWithFocus}
                            updateDiagram={handleUpdateDiagram}
                            updateDiagramPositions={handleUpdateDiagramPositions}
                        />
                    );
                })}
            </ResponsiveGridLayout>
            {isMapOpen && currentRootNetworkUuid && currentNode && (
                <MapDialog
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    networkVisuParams={networkVisuParams}
                    onClose={handleCloseMap}
                    errorMessage={'MapCardNotAvailable'}
                    showInSpreadsheet={showInSpreadsheet}
                    onOpenNetworkAreaDiagram={onOpenNetworkAreaDiagram}
                />
            )}
        </Box>
    );
}

export default GridLayoutPanel;
