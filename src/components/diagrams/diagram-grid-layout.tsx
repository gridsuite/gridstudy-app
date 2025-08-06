/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState, useRef } from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useDiagramModel } from './hooks/use-diagram-model';
import { Diagram, DiagramParams, DiagramType } from './diagram.type';
import { Box, useTheme } from '@mui/material';
import { ElementType, EquipmentInfos, EquipmentType, useDebounce } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useDiagramsGridLayoutInitialization } from './hooks/use-diagrams-grid-layout-initialization';
import { v4 } from 'uuid';
import { DiagramGridHeader } from './diagram-grid-header';
import './diagram-grid-layout.css';
import { DiagramCard } from './diagram-card';
import MapCard from './map-card';
import { BLINK_LENGTH_MS } from './card-header';
import CustomResizeHandle from './custom-resize-handle';
import { useSaveDiagramLayout } from './hooks/use-save-diagram-layout';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
};
const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [DiagramType.VOLTAGE_LEVEL, DiagramType.SUBSTATION, DiagramType.NETWORK_AREA_DIAGRAM];

// Grid configuration - defines how many cards fit per row at each breakpoint
const cols = {
    lg: 12, // 12 cards per row on large screens (≥1200px)
    md: 6, // 6 cards per row on medium screens (≥996px)
    sm: 6, // 6 cards per row on small screens (≥768px)
    xs: 4, // 4 cards per row on extra small screens (≥480px)
    xxs: 4, // 4 cards per row on extra extra small screens (<480px)
};

// Default dimensions for new cards (in grid units)
const DEFAULT_CARD_WIDTH = 2;
const DEFAULT_CARD_HEIGHT = 2;

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
const reflowWithOrder = (sourceLayout: Layout[], targetCols: number, visualOrder: string[]): Layout[] => {
    if (!sourceLayout?.length || !visualOrder?.length) {
        return sourceLayout || [];
    }

    // Create a lookup map for quick card access by ID
    const cardMap = new Map(sourceLayout.map((item) => [item.i, item]));
    const newLayout: Layout[] = [];
    let currentX = 0;
    let currentY = 0;

    // Place cards in the specified order, wrapping to new rows as needed
    for (const cardId of visualOrder) {
        const card = cardMap.get(cardId);
        if (!card) {
            continue;
        }

        // Move to next row if card doesn't fit in current row
        if (currentX + card.w > targetCols) {
            currentX = 0;
            currentY++;
        }

        // Place card at current position and advance X coordinate
        newLayout.push({ ...card, x: currentX, y: currentY });
        currentX += card.w;
    }

    return newLayout;
};

// Generate initial layouts for all breakpoints
const generateInitialLayouts = (): Layouts => {
    return Object.keys(cols).reduce((layouts, breakpoint) => {
        layouts[breakpoint] = [];
        return layouts;
    }, {} as Layouts);
};

/**
 * Find the next available position for a new card in the grid
 * Uses bottom-to-top, left-to-right placement strategy
 */
const findNextPosition = (existingLayouts: Layout[], maxCols: number, cardWidth: number, cardHeight: number) => {
    if (existingLayouts.length === 0) {
        return { x: 0, y: 0 };
    }

    // Find the current bottom row
    const bottomY = Math.max(...existingLayouts.map((item) => item.y));
    const bottomRowItems = existingLayouts.filter((item) => item.y === bottomY).sort((a, b) => a.x - b.x);

    // Calculate the next X position in the bottom row
    const rightmostX = bottomRowItems.reduce((maxX, item) => Math.max(maxX, item.x + item.w), 0);

    // Check if the new card fits in the current row
    if (rightmostX + cardWidth <= maxCols) {
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
    for (const [breakpoint, maxCols] of Object.entries(cols)) {
        const existingLayouts = newLayouts[breakpoint] || [];
        const { x, y } = findNextPosition(existingLayouts, maxCols, DEFAULT_CARD_WIDTH, DEFAULT_CARD_HEIGHT);

        newLayouts[breakpoint] = [...existingLayouts, { i: id, x, y, w: DEFAULT_CARD_WIDTH, h: DEFAULT_CARD_HEIGHT }];
    }

    return newLayouts;
};

const initialLayouts: Layouts = generateInitialLayouts();

interface DiagramGridLayoutProps {
    studyUuid: UUID;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    visible: boolean;
}

function DiagramGridLayout({ studyUuid, showInSpreadsheet, visible }: Readonly<DiagramGridLayoutProps>) {
    const theme = useTheme();
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [blinkingDiagrams, setBlinkingDiagrams] = useState<UUID[]>([]);
    const currentBreakpointRef = useRef<string>('lg');

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
            for (const [breakpoint, targetCols] of Object.entries(cols)) {
                if (breakpoint !== sourceBreakpoint && newLayouts[breakpoint]) {
                    newLayouts[breakpoint] = reflowWithOrder(newLayouts[breakpoint], targetCols, visualOrder);
                }
            }

            return newLayouts;
        });
    }, []);

    const isMapCardAdded = () => {
        return Object.values(layouts).some((breakpointLayouts) =>
            breakpointLayouts.some((layout) => layout.i === 'MapCard')
        );
    };

    const addLayoutItem = useCallback((diagram: Diagram) => {
        setLayouts((currentLayouts) => createLayoutItem(diagram.diagramUuid, currentLayouts));
    }, []);

    const removeLayoutItem = useCallback((cardUuid: UUID | string) => {
        setLayouts((currentLayouts) => {
            const newLayouts: Layouts = {};

            // Filter out the card from all breakpoints
            for (const [breakpoint, layoutItems] of Object.entries(currentLayouts)) {
                newLayouts[breakpoint] = layoutItems.filter((layout) => layout.i !== cardUuid);
            }

            return newLayouts;
        });
    }, []);

    const stopDiagramBlinking = useCallback((diagramUuid: UUID) => {
        setBlinkingDiagrams((old_blinking_diagrams) => old_blinking_diagrams.filter((uuid) => uuid !== diagramUuid));
    }, []);

    const onDiagramAlreadyExists = useCallback(
        (diagramUuid: UUID) => {
            setBlinkingDiagrams((oldBlinkingDiagrams) => {
                if (oldBlinkingDiagrams.includes(diagramUuid)) {
                    return oldBlinkingDiagrams;
                }
                return [...oldBlinkingDiagrams, diagramUuid];
            });
            setTimeout(() => stopDiagramBlinking(diagramUuid), BLINK_LENGTH_MS);
        },
        [stopDiagramBlinking]
    );

    const {
        diagrams,
        loadingDiagrams,
        diagramErrors,
        globalError,
        removeDiagram,
        createDiagram,
        updateDiagram,
        updateDiagramPositions,
    } = useDiagramModel({
        diagramTypes: diagramTypes,
        onAddDiagram: addLayoutItem,
        onDiagramAlreadyExists,
    });

    const onRemoveCard = useCallback(
        (diagramUuid: UUID) => {
            removeLayoutItem(diagramUuid);
            removeDiagram(diagramUuid);
        },
        [removeLayoutItem, removeDiagram]
    );

    const showVoltageLevelDiagram = useCallback(
        (element: EquipmentInfos) => {
            if (element.type === EquipmentType.VOLTAGE_LEVEL) {
                const diagram: DiagramParams = {
                    diagramUuid: v4() as UUID,
                    type: DiagramType.VOLTAGE_LEVEL,
                    voltageLevelId: element.voltageLevelId ?? '',
                    name: '',
                };
                createDiagram(diagram);
            } else if (element.type === EquipmentType.SUBSTATION) {
                const diagram: DiagramParams = {
                    diagramUuid: v4() as UUID,
                    type: DiagramType.SUBSTATION,
                    substationId: element.id,
                    name: '',
                };
                createDiagram(diagram);
            }
        },
        [createDiagram]
    );

    const handleGridLayoutSave = useSaveDiagramLayout({ layouts, diagrams });

    // Debounce the layout save function to avoid excessive calls
    const debouncedGridLayoutSave = useDebounce(handleGridLayoutSave, 300);

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
            createDiagram(diagram);
        },
        [createDiagram]
    );

    const onLoadDiagramLayout = useCallback((savedLayouts: Layouts) => {
        if (Object.keys(savedLayouts).length > 0) {
            setLayouts(savedLayouts);
        } else {
            setLayouts(initialLayouts);
        }
    }, []);

    const onAddMapCard = useCallback(() => {
        setLayouts((currentLayouts) => createLayoutItem('MapCard', currentLayouts));
    }, []);

    const handleRemoveMapCard = useCallback(() => {
        removeLayoutItem('MapCard');
    }, [removeLayoutItem]);

    useDiagramsGridLayoutInitialization({ onLoadDiagramLayout });

    return (
        <Box sx={styles.container}>
            <DiagramGridHeader
                onLoad={handleLoadNad}
                onSearch={showVoltageLevelDiagram}
                onMap={!isMapCardAdded() ? onAddMapCard : undefined}
                onLayoutSave={debouncedGridLayoutSave}
            />
            <ResponsiveGridLayout
                className="layout"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={cols}
                margin={[parseInt(theme.spacing(1)), parseInt(theme.spacing(1))]}
                compactType={'vertical'}
                onLayoutChange={(currentLayout, allLayouts) => {
                    setLayouts((prev) => ({ ...prev, [currentBreakpointRef.current]: currentLayout }));
                }}
                /**
                 * Handle card resizing across all breakpoints
                 * Maintains consistent card dimensions regardless of screen size
                 */
                onResizeStop={(layout, oldItem, newItem, placeholder, e, element) => {
                    if (!newItem) {
                        return;
                    }

                    setLayouts((currentLayouts) => {
                        const newLayouts = { ...currentLayouts };

                        // Update the resized item in all breakpoints
                        for (const [breakpoint, layoutItems] of Object.entries(newLayouts)) {
                            const itemIndex = layoutItems.findIndex((item) => item.i === newItem.i);
                            if (itemIndex !== -1) {
                                newLayouts[breakpoint] = [
                                    ...layoutItems.slice(0, itemIndex),
                                    { ...layoutItems[itemIndex], w: newItem.w, h: newItem.h },
                                    ...layoutItems.slice(itemIndex + 1),
                                ];
                            }
                        }

                        return newLayouts;
                    });
                }}
                /**
                 * Handle breakpoint changes (screen size changes)
                 * Maintains visual order consistency when switching between breakpoints
                 * Updates the current breakpoint reference for future operations
                 */
                onBreakpointChange={(newBreakpoint, newCols) => {
                    const previousBreakpoint = currentBreakpointRef.current;
                    currentBreakpointRef.current = newBreakpoint;

                    // Maintain order when switching breakpoints
                    if (previousBreakpoint !== newBreakpoint && layouts[previousBreakpoint]?.length) {
                        const sourceLayout = layouts[previousBreakpoint];
                        const visualOrder = getVisualOrder(sourceLayout);
                        const targetCols = cols[newBreakpoint as keyof typeof cols];

                        setLayouts((prev) => ({
                            ...prev,
                            [newBreakpoint]: reflowWithOrder(prev[newBreakpoint] || [], targetCols, visualOrder),
                        }));
                    }
                }}
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

                    // Ensure final order is propagated to all breakpoints
                    propagateOrder(layout, currentBreakpointRef.current);
                }}
                autoSize={false} // otherwise the grid has strange behavior
                resizeHandle={<CustomResizeHandle />}
            >
                {Object.values(diagrams).map((diagram) => {
                    return (
                        <DiagramCard
                            key={diagram.diagramUuid}
                            studyUuid={studyUuid}
                            visible={visible}
                            diagram={diagram}
                            blinking={blinkingDiagrams.includes(diagram.diagramUuid)}
                            loading={loadingDiagrams.includes(diagram.diagramUuid)}
                            errorMessage={globalError || diagramErrors[diagram.diagramUuid]}
                            onClose={() => onRemoveCard(diagram.diagramUuid)}
                            showInSpreadsheet={showInSpreadsheet}
                            createDiagram={createDiagram}
                            updateDiagram={updateDiagram}
                            updateDiagramPositions={updateDiagramPositions}
                            onLoad={handleLoadNad}
                        />
                    );
                })}
                {isMapCardAdded() && (
                    <MapCard
                        key={'MapCard'}
                        studyUuid={studyUuid}
                        onClose={handleRemoveMapCard}
                        errorMessage={globalError}
                        showInSpreadsheet={showInSpreadsheet}
                    />
                )}
            </ResponsiveGridLayout>
        </Box>
    );
}

export default DiagramGridLayout;
