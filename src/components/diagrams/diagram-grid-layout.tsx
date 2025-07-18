/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { useDiagramModel } from './hooks/use-diagram-model';
import { Diagram, DiagramParams, DiagramType } from './diagram.type';
import { useTheme } from '@mui/material';
import { ElementType, EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import { useDiagramsGridLayoutSessionStorage } from './hooks/use-diagrams-grid-layout-session-storage';
import { v4 } from 'uuid';
import { DiagramAdder } from './diagram-adder';
import './diagram-grid-layout.css'; // Import the CSS file for styling
import { DiagramCard } from './diagram-card';
import MapCard from './map-card';
import { BLINK_LENGTH_MS } from './card-header';
import CustomResizeHandle from './custom-resize-handle';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [DiagramType.VOLTAGE_LEVEL, DiagramType.SUBSTATION, DiagramType.NETWORK_AREA_DIAGRAM];

const LG_COLUMN_COUNT = 12;
const MD_SM_COLUMN_COUNT = LG_COLUMN_COUNT / 2;
const XS_XSS_COLUMN_COUNT = LG_COLUMN_COUNT / 3;
const DEFAULT_WIDTH = 2;
const DEFAULT_HEIGHT = 2;

const defaultCardSizes = {
    w: DEFAULT_WIDTH,
    h: DEFAULT_HEIGHT,
};

const AdderCard = {
    ...defaultCardSizes,
    i: 'Adder',
    x: 0,
    y: 0,
    minH: DEFAULT_HEIGHT,
    maxH: DEFAULT_HEIGHT,
    minW: DEFAULT_WIDTH,
    maxW: DEFAULT_WIDTH,
    isDraggable: false,
    static: true,
};

const initialLayouts: Layouts = {
    // ResponsiveGridLayout will attempt to interpolate the rest of breakpoints based on this one
    lg: [AdderCard],
};

interface DiagramGridLayoutProps {
    studyUuid: UUID;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    visible: boolean;
}

const removeInLayoutEntries = (entries: [string, Layout[]][], cardUuid: UUID) => {
    return entries.map(([breakpoint, breakpoint_layouts]) => {
        const updatedLayouts = breakpoint_layouts.filter((layout) => layout.i !== cardUuid);
        return [breakpoint, updatedLayouts];
    });
};

function DiagramGridLayout({ studyUuid, showInSpreadsheet, visible }: Readonly<DiagramGridLayoutProps>) {
    const theme = useTheme();
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [blinkingDiagrams, setBlinkingDiagrams] = useState<UUID[]>([]);
    const [isMapCardAdded, setIsMapCardAdded] = useState(false);

    const addLayoutItem = (diagram: Diagram) => {
        setLayouts((old_layouts) => {
            const layoutItem: Layout = {
                i: diagram.diagramUuid,
                x: Infinity,
                y: 0,
                ...defaultCardSizes,
            };
            const oldLayoutsEntries = Object.entries(old_layouts);
            const newLayoutsEntries = oldLayoutsEntries.map(([breakpoint, breakpoint_layouts]) => {
                // Ensure the new layout item is added to each breakpoint
                const updatedLayouts = [...breakpoint_layouts];
                updatedLayouts.push(layoutItem);
                return [breakpoint, updatedLayouts];
            });
            return Object.fromEntries(newLayoutsEntries);
        });
    };

    const removeLayoutItem = (cardUuid: UUID) => {
        setLayouts((old_layouts) => Object.fromEntries(removeInLayoutEntries(Object.entries(old_layouts), cardUuid)));
    };

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
        [removeDiagram]
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

    const onLoadFromSessionStorage = useCallback((savedLayouts: Layouts) => {
        if (savedLayouts) {
            const savedLayoutsEntries = Object.entries(savedLayouts);
            const newLayoutsEntries = savedLayoutsEntries.map(([breakpoint, breakpoint_layouts]) => {
                const updatedLayouts = [...breakpoint_layouts];
                updatedLayouts.unshift(AdderCard);
                return [breakpoint, updatedLayouts];
            });
            setLayouts(Object.fromEntries(newLayoutsEntries));
        } else {
            setLayouts(initialLayouts);
        }
    }, []);

    const onAddMapCard = useCallback(() => {
        setLayouts((old_layouts) => {
            const new_lg_layouts = [...old_layouts.lg];
            const layoutItem: Layout = {
                i: 'MapCard',
                x: Infinity,
                y: 0,
                w: DEFAULT_WIDTH,
                h: DEFAULT_HEIGHT,
            };
            new_lg_layouts.push(layoutItem);
            return { lg: new_lg_layouts };
        });
        setIsMapCardAdded(true);
    }, []);

    useDiagramsGridLayoutSessionStorage({ layouts, onLoadFromSessionStorage });

    return (
        <ResponsiveGridLayout
            className="layout"
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{
                lg: LG_COLUMN_COUNT,
                md: MD_SM_COLUMN_COUNT,
                sm: MD_SM_COLUMN_COUNT,
                xs: XS_XSS_COLUMN_COUNT,
                xxs: XS_XSS_COLUMN_COUNT,
            }}
            margin={[parseInt(theme.spacing(1)), parseInt(theme.spacing(1))]}
            compactType={'horizontal'}
            onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
            layouts={layouts}
            style={{
                backgroundColor:
                    theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.background.paper,
                flexGrow: 1,
                paddingRight: theme.spacing(1),
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
            }}
            autoSize={false} // otherwise the grid has strange behavior
            resizeHandle={<CustomResizeHandle />}
        >
            <DiagramAdder
                key={'Adder'}
                onLoad={handleLoadNad}
                onSearch={showVoltageLevelDiagram}
                onMap={!isMapCardAdded ? onAddMapCard : undefined}
            />
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
                        updateDiagram={updateDiagram}
                        updateDiagramPositions={updateDiagramPositions}
                        onLoad={handleLoadNad}
                    />
                );
            })}
            {isMapCardAdded && (
                <MapCard
                    key={'MapCard'}
                    studyUuid={studyUuid}
                    onClose={() => setIsMapCardAdded(false)}
                    showInSpreadsheet={showInSpreadsheet}
                />
            )}
        </ResponsiveGridLayout>
    );
}

export default DiagramGridLayout;
