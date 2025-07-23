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
import { Box, Theme, useTheme } from '@mui/material';
import { ElementType, EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import { UUID } from 'crypto';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';
import { DiagramAdditionalMetadata } from './diagram-common';
import { useDiagramsGridLayoutInitialization } from './hooks/use-diagrams-grid-layout-initialization';
import { v4 } from 'uuid';
import CardHeader, { BLINK_LENGTH_MS } from './card-header';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import { DiagramAdder } from './diagram-adder';
import './diagram-grid-layout.css'; // Import the CSS file for styling
import CustomResizeHandle from './custom-resize-handle';
import { useSaveDiagramLayout } from './hooks/use-save-diagram-layout';
import { useIntl } from 'react-intl';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [DiagramType.VOLTAGE_LEVEL, DiagramType.SUBSTATION, DiagramType.NETWORK_AREA_DIAGRAM];

const styles = {
    card: (theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
        '& .react-resizable-handle, .card-header-close-button': {
            visibility: 'hidden',
        },
        '&:hover': {
            '& .react-resizable-handle, .card-header-close-button': {
                visibility: 'visible',
            },
        },
    }),
    alertMessage: (theme: Theme) => ({
        borderRadius: '0 0 0 0',
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
        borderTop: 'none', // remove the top border to avoid double border with CardHeader
        borderBottom: 'none',
    }),
    diagramContainer: (theme: Theme) => ({
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
        borderRadius: '0 0 ' + theme.spacing(2) + ' ' + theme.spacing(2),
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
        borderTop: 'none', // remove the top border to avoid double border with CardHeader
    }),
};

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
    const intl = useIntl();
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [blinkingDiagrams, setBlinkingDiagrams] = useState<UUID[]>([]);
    const [diagramsInEditMode, setDiagramsInEditMode] = useState<UUID[]>([]);
    const [isMapCardAdded, setIsMapCardAdded] = useState(false);

    const addLayoutItem = useCallback((diagram: Diagram) => {
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
    }, []);

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

    const handleGridLayoutSave = useSaveDiagramLayout({ layouts, diagrams });

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

    const handleExpandAllVoltageLevels = useCallback(
        (diagramId: UUID) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    name: diagram.name,
                    nadConfigUuid: diagram.nadConfigUuid,
                    filterUuid: diagram.filterUuid,
                    voltageLevelIds: [],
                    voltageLevelToExpandIds: [...diagram.voltageLevelIds],
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds,
                    positions: diagram.positions,
                });
            }
        },
        [diagrams, updateDiagram]
    );

    const handleExpandVoltageLevelId = useCallback(
        (diagramId: UUID, voltageLevelIdToExpand: string) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    name: diagram.name,
                    nadConfigUuid: diagram.nadConfigUuid,
                    filterUuid: diagram.filterUuid,
                    voltageLevelIds: diagram.voltageLevelIds.filter((id) => id !== voltageLevelIdToExpand),
                    voltageLevelToExpandIds: [...diagram.voltageLevelToExpandIds, voltageLevelIdToExpand],
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds,
                    positions: diagram.positions,
                });
            }
        },
        [diagrams, updateDiagram]
    );

    const handleHideVoltageLevelId = useCallback(
        (diagramId: UUID, voltageLevelIdToOmit: string) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    name: diagram.name,
                    nadConfigUuid: diagram.nadConfigUuid,
                    filterUuid: diagram.filterUuid,
                    voltageLevelIds: diagram.voltageLevelIds.filter((id) => id !== voltageLevelIdToOmit),
                    voltageLevelToExpandIds: diagram.voltageLevelToExpandIds,
                    voltageLevelToOmitIds: [...(diagram.voltageLevelToOmitIds ?? []), voltageLevelIdToOmit],
                    positions: diagram.positions,
                });
            }
        },
        [diagrams, updateDiagram]
    );

    const handleMoveNode = useCallback(
        (diagramId: UUID, vlId: string, x: number, y: number) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                const updatedPositions = diagram.positions.map((position) =>
                    position.voltageLevelId === vlId ? { ...position, xPosition: x, yPosition: y } : position
                );

                updateDiagramPositions({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    name: diagram.name,
                    nadConfigUuid: diagram.nadConfigUuid,
                    filterUuid: diagram.filterUuid,
                    voltageLevelIds: diagram.voltageLevelIds,
                    voltageLevelToExpandIds: diagram.voltageLevelToExpandIds,
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds,
                    positions: updatedPositions,
                });
            }
        },
        [diagrams, updateDiagramPositions]
    );

    const handleToggleEditMode = useCallback((diagramUuid: UUID) => {
        setDiagramsInEditMode((prev) =>
            prev.includes(diagramUuid) ? prev.filter((id) => id !== diagramUuid) : [...prev, diagramUuid]
        );
    }, []);

    const handleVoltageLevelClick = useCallback(
        (vlId: string): void => {
            createDiagram({
                diagramUuid: v4() as UUID,
                type: DiagramType.VOLTAGE_LEVEL,
                voltageLevelId: vlId,
                name: '',
            });
        },
        [createDiagram]
    );

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = useCallback((diagramId: UUID, diagramType: DiagramType, width: number, height: number) => {
        console.log('TODO setDiagramSize', diagramId, diagramType, width, height);
        // TODO adapt the layout w and h considering those values
    }, []);

    const renderDiagrams = useCallback(() => {
        if (Object.values(diagrams).length === 0) {
            return;
        }
        return Object.values(diagrams).map((diagram) => {
            if (!diagram) {
                return null;
            }
            return (
                <Box key={diagram.diagramUuid} sx={styles.card}>
                    <CardHeader
                        title={
                            loadingDiagrams.includes(diagram.diagramUuid)
                                ? intl.formatMessage({ id: 'LoadingOf' }, { value: diagram.type })
                                : diagram.name
                        }
                        blinking={blinkingDiagrams.includes(diagram.diagramUuid)}
                        onClose={() => onRemoveCard(diagram.diagramUuid)}
                    />
                    {globalError || Object.keys(diagramErrors).includes(diagram.diagramUuid) ? (
                        <>
                            <AlertCustomMessageNode
                                message={globalError || diagramErrors[diagram.diagramUuid]}
                                noMargin
                                style={styles.alertMessage}
                            />
                            <Box sx={styles.diagramContainer} /> {/* Empty container to keep the layout */}
                        </>
                    ) : (
                        <Box sx={styles.diagramContainer}>
                            {(diagram.type === DiagramType.VOLTAGE_LEVEL ||
                                diagram.type === DiagramType.SUBSTATION) && (
                                <SingleLineDiagramContent
                                    showInSpreadsheet={showInSpreadsheet}
                                    studyUuid={studyUuid}
                                    diagramId={diagram.diagramUuid}
                                    svg={diagram.svg?.svg ?? undefined}
                                    svgType={diagram.type}
                                    svgMetadata={(diagram.svg?.metadata as SLDMetadata) ?? undefined}
                                    loadingState={loadingDiagrams.includes(diagram.diagramUuid)}
                                    diagramSizeSetter={setDiagramSize}
                                    visible={visible}
                                    onNextVoltageLevelClick={handleVoltageLevelClick}
                                />
                            )}
                            {diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && (
                                <NetworkAreaDiagramContent
                                    diagramId={diagram.diagramUuid}
                                    svg={diagram.svg?.svg ?? undefined}
                                    svgType={diagram.type}
                                    svgMetadata={(diagram.svg?.metadata as DiagramMetadata) ?? undefined}
                                    svgScalingFactor={
                                        (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata)?.scalingFactor ??
                                        undefined
                                    }
                                    svgVoltageLevels={
                                        (diagram.svg?.additionalMetadata as DiagramAdditionalMetadata)?.voltageLevels
                                            .map((vl) => vl.id)
                                            .filter((vlId) => vlId !== undefined) as string[]
                                    }
                                    loadingState={loadingDiagrams.includes(diagram.diagramUuid)}
                                    diagramSizeSetter={setDiagramSize}
                                    visible={visible}
                                    isEditNadMode={diagramsInEditMode.includes(diagram.diagramUuid)}
                                    onToggleEditNadMode={(isEditMode) => handleToggleEditMode(diagram.diagramUuid)}
                                    onLoadNad={handleLoadNad}
                                    onExpandVoltageLevel={(vlId) =>
                                        handleExpandVoltageLevelId(diagram.diagramUuid, vlId)
                                    }
                                    onExpandAllVoltageLevels={() => handleExpandAllVoltageLevels(diagram.diagramUuid)}
                                    onHideVoltageLevel={(vlId) => handleHideVoltageLevelId(diagram.diagramUuid, vlId)}
                                    onMoveNode={(vlId, x, y) => handleMoveNode(diagram.diagramUuid, vlId, x, y)}
                                    onVoltageLevelClick={handleVoltageLevelClick}
                                    customPositions={diagram.positions}
                                />
                            )}
                        </Box>
                    )}
                </Box>
            );
        });
    }, [
        blinkingDiagrams,
        diagramErrors,
        diagrams,
        diagramsInEditMode,
        globalError,
        handleLoadNad,
        handleToggleEditMode,
        loadingDiagrams,
        handleExpandAllVoltageLevels,
        handleExpandVoltageLevelId,
        handleHideVoltageLevelId,
        handleMoveNode,
        handleVoltageLevelClick,
        onRemoveCard,
        setDiagramSize,
        showInSpreadsheet,
        studyUuid,
        visible,
        intl,
    ]);

    const onLoadDiagramLayout = useCallback((savedLayouts: Layouts) => {
        if (Object.keys(savedLayouts).length > 0) {
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
        // TODO setLayouts to add a map card
        setIsMapCardAdded(true);
    }, []);

    useDiagramsGridLayoutInitialization({ onLoadDiagramLayout });

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
                onLoad={handleLoadNad}
                onSearch={showVoltageLevelDiagram}
                onMap={!isMapCardAdded ? onAddMapCard : undefined}
                onLayoutSave={handleGridLayoutSave}
                key={'Adder'}
            />
            {renderDiagrams()}
        </ResponsiveGridLayout>
    );
}

export default DiagramGridLayout;
