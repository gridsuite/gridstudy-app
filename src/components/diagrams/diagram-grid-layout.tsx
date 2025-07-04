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
import { AppBar, Box, Dialog, IconButton, Theme, Toolbar, Tooltip, Typography, useTheme } from '@mui/material';
import { ElementType, EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import { Close, Fullscreen } from '@mui/icons-material';
import { UUID } from 'crypto';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { DiagramMetadata, LineFlowMode, SLDMetadata } from '@powsybl/network-viewer';
import { DiagramAdditionalMetadata, NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS } from './diagram-common';
import { useDiagramsGridLayoutSessionStorage } from './hooks/use-diagrams-grid-layout-session-storage';
import { v4 } from 'uuid';
import CardHeader, { BLINK_LENGTH_MS } from './card-header';
import DiagramFooter from './diagram-footer';
import { useIntl } from 'react-intl';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
import NetworkMapTab from 'components/network/network-map-tab';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { resetMapEquipment, setMapDataLoading, setReloadMapNeeded } from 'redux/actions';
import { DiagramAdder } from './diagram-adder';
import './diagram-grid-layout.css'; // Import the CSS file for styling
import WolrdSvg from 'images/world.svg?react';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [
    DiagramType.VOLTAGE_LEVEL,
    DiagramType.SUBSTATION,
    DiagramType.NETWORK_AREA_DIAGRAM,
    DiagramType.NAD_FROM_ELEMENT,
];

const styles = {
    card: (theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
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
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : theme.palette.grey[900],
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
const XS_XSS_COLUMN_COUNT = LG_COLUMN_COUNT / 6;
const DEFAULT_WIDTH = 3;
const DEFAULT_HEIGHT = 2;

const initialLayouts = {
    // ResponsiveGridLayout will attempt to interpolate the rest of breakpoints based on this one
    lg: [
        {
            i: 'Adder',
            x: 0,
            y: 0,
            w: DEFAULT_WIDTH,
            h: DEFAULT_HEIGHT,
            minH: DEFAULT_HEIGHT,
            maxH: DEFAULT_HEIGHT,
            minW: DEFAULT_WIDTH,
            maxW: DEFAULT_WIDTH,
            isDraggable: false,
            static: true,
        },
    ],
};

interface DiagramGridLayoutProps {
    studyUuid: UUID;
    showInSpreadsheet: (equipment: { equipmentId: string | null; equipmentType: EquipmentType | null }) => void;
    visible: boolean;
}

function DiagramGridLayout({ studyUuid, showInSpreadsheet, visible }: Readonly<DiagramGridLayoutProps>) {
    const theme = useTheme();
    const intl = useIntl();
    const dispatch = useDispatch();
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [blinkingDiagrams, setBlinkingDiagrams] = useState<UUID[]>([]);
    const [diagramsInEditMode, setDiagramsInEditMode] = useState<UUID[]>([]);
    const [isMapCardAdded, setIsMapCardAdded] = useState(false);
    const [isMapAdded, setIsMapAdded] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const networkVisuParams = useSelector((state: AppState) => state.networkVisualizationsParameters);

    const onAddDiagram = (diagram: Diagram) => {
        setLayouts((old_layouts) => {
            const new_lg_layouts = [...old_layouts.lg];
            const layoutItem: Layout = {
                i: diagram.diagramUuid,
                x: Infinity,
                y: 0,
                w: DEFAULT_WIDTH,
                h: DEFAULT_HEIGHT,
            };
            new_lg_layouts.push(layoutItem);
            return { lg: new_lg_layouts };
        });
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

    const { diagrams, loadingDiagrams, diagramErrors, globalError, removeDiagram, createDiagram, updateDiagram } =
        useDiagramModel({
            diagramTypes: diagramTypes,
            onAddDiagram,
            onDiagramAlreadyExists,
        });

    const onRemoveItem = useCallback(
        (diagramUuid: UUID) => {
            setLayouts((old_layouts) => {
                const new_lg_layouts = old_layouts.lg.filter((layout: Layout) => layout.i !== diagramUuid);
                if (new_lg_layouts.length === 0) {
                    return initialLayouts;
                }
                return { lg: new_lg_layouts };
            });
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
                };
                createDiagram(diagram);
            } else if (element.type === EquipmentType.SUBSTATION) {
                const diagram: DiagramParams = {
                    diagramUuid: v4() as UUID,
                    type: DiagramType.SUBSTATION,
                    substationId: element.id,
                };
                createDiagram(diagram);
            }
        },
        [createDiagram]
    );

    const handleLoadNadFromElement = useCallback(
        (elementUuid: UUID, elementType: ElementType, elementName: string) => {
            const diagram: DiagramParams = {
                diagramUuid: v4() as UUID,
                type: DiagramType.NAD_FROM_ELEMENT,
                elementUuid: elementUuid,
                elementType: elementType,
                elementName: elementName,
            };
            createDiagram(diagram);
        },
        [createDiagram]
    );

    const handleCloseMap = useCallback(() => {
        setMapOpen(false);
        dispatch(resetMapEquipment());
        dispatch(setMapDataLoading(false));
        dispatch(setReloadMapNeeded(true));
    }, [dispatch]);

    const renderMapCardSnippet = useCallback(() => {
        if (!studyUuid || !currentNode || !currentRootNetworkUuid) {
            return;
        }
        return (
            <Box key={'MapSnippet'} sx={styles.card}>
                <CardHeader title={'MapSnippet'} onClose={() => setIsMapCardAdded(false)} />
                <Box sx={styles.diagramContainer}>
                    <WolrdSvg
                        style={{
                            width: '100%',
                            height: '100%',
                            cursor: 'pointer',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMapOpen(true);
                        }}
                    />
                    <Dialog open={mapOpen} onClose={handleCloseMap} fullScreen>
                        <AppBar sx={{ position: 'absolute' }}>
                            <Toolbar>
                                <IconButton
                                    // sx={{ position: 'abolute' }}
                                    edge="start"
                                    color="inherit"
                                    onClick={handleCloseMap}
                                    aria-label="close"
                                >
                                    <Close />
                                </IconButton>
                                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                                    Fermer
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <NetworkMapTab
                            studyUuid={studyUuid}
                            visible={mapOpen}
                            lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                            lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                            lineFlowMode={networkVisuParams.mapParameters.lineFlowMode as LineFlowMode}
                            openVoltageLevel={() => {}}
                            currentNode={currentNode}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            showInSpreadsheet={(eq) => {
                                setMapOpen(false);
                                showInSpreadsheet(eq);
                            }}
                            onPolygonChanged={() => {}}
                            onElementCreated={handleCloseMap}
                        ></NetworkMapTab>
                    </Dialog>
                </Box>
            </Box>
        );
    }, [
        studyUuid,
        currentNode,
        currentRootNetworkUuid,
        mapOpen,
        handleCloseMap,
        networkVisuParams.mapParameters.lineFullPath,
        networkVisuParams.mapParameters.lineParallelPath,
        networkVisuParams.mapParameters.lineFlowMode,
        showInSpreadsheet,
    ]);

    const renderMapCard = useCallback(() => {
        if (!studyUuid || !currentNode || !currentRootNetworkUuid) {
            return;
        }
        return (
            <Box key={'Map'} sx={styles.card}>
                <CardHeader
                    title={'Map'}
                    onClose={() => {
                        setIsMapAdded(false);
                        dispatch(resetMapEquipment());
                        dispatch(setMapDataLoading(false));
                        dispatch(setReloadMapNeeded(true));
                    }}
                />
                <Box sx={styles.diagramContainer}>
                    <NetworkMapTab
                        studyUuid={studyUuid}
                        visible={mapOpen}
                        lineFullPath={networkVisuParams.mapParameters.lineFullPath}
                        lineParallelPath={networkVisuParams.mapParameters.lineParallelPath}
                        lineFlowMode={networkVisuParams.mapParameters.lineFlowMode as LineFlowMode}
                        openVoltageLevel={() => {}}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        showInSpreadsheet={(eq) => {
                            showInSpreadsheet(eq);
                        }}
                        onPolygonChanged={() => {}}
                    />
                </Box>
            </Box>
        );
    }, [
        studyUuid,
        currentNode,
        currentRootNetworkUuid,
        mapOpen,
        networkVisuParams.mapParameters.lineFullPath,
        networkVisuParams.mapParameters.lineParallelPath,
        networkVisuParams.mapParameters.lineFlowMode,
        dispatch,
        showInSpreadsheet,
    ]);

    const onChangeDepth = useCallback(
        (diagramId: UUID, newDepth: number) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    voltageLevelIds: diagram.voltageLevelIds,
                    depth: newDepth,
                });
            }
        },
        [diagrams, updateDiagram]
    );

    const handleToggleEditMode = useCallback((diagramUuid: UUID) => {
        setDiagramsInEditMode((prev) =>
            prev.includes(diagramUuid) ? prev.filter((id) => id !== diagramUuid) : [...prev, diagramUuid]
        );
    }, []);

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
                        title={diagram.name}
                        blinking={blinkingDiagrams.includes(diagram.diagramUuid)}
                        onClose={() => onRemoveItem(diagram.diagramUuid)}
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
                                />
                            )}
                            {(diagram.type === DiagramType.NETWORK_AREA_DIAGRAM ||
                                diagram.type === DiagramType.NAD_FROM_ELEMENT) && (
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
                                    onLoadNadFromElement={handleLoadNadFromElement}
                                />
                            )}
                            {diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && (
                                <DiagramFooter
                                    showCounterControls={diagramsInEditMode.includes(diagram.diagramUuid)}
                                    counterText={intl.formatMessage({
                                        id: 'depth',
                                    })}
                                    counterValue={diagram.depth}
                                    onIncrementCounter={() => onChangeDepth(diagram.diagramUuid, diagram.depth + 1)}
                                    onDecrementCounter={() => onChangeDepth(diagram.diagramUuid, diagram.depth - 1)}
                                    incrementCounterDisabled={
                                        diagram.voltageLevelIds.length > NETWORK_AREA_DIAGRAM_NB_MAX_VOLTAGE_LEVELS // loadingState ||
                                    }
                                    decrementCounterDisabled={diagram.depth === 0} // loadingState ||
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
        handleLoadNadFromElement,
        handleToggleEditMode,
        intl,
        loadingDiagrams,
        onChangeDepth,
        onRemoveItem,
        setDiagramSize,
        showInSpreadsheet,
        studyUuid,
        visible,
    ]);

    const onLoadFromSessionStorage = useCallback((savedLayouts: Layouts) => {
        if (savedLayouts) {
            setLayouts({ lg: [...initialLayouts.lg, ...savedLayouts.lg] });
        } else {
            setLayouts(initialLayouts);
        }
    }, []);

    const onAddMapCard = useCallback(() => {
        setLayouts((old_layouts) => {
            const new_lg_layouts = [...old_layouts.lg];
            const layoutItem: Layout = {
                i: 'MapSnippet',
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

    const onAddMap = useCallback(() => {
        setLayouts((old_layouts) => {
            const new_lg_layouts = [...old_layouts.lg];
            const layoutItem: Layout = {
                i: 'Map',
                x: Infinity,
                y: 0,
                w: DEFAULT_WIDTH,
                h: DEFAULT_HEIGHT,
            };
            new_lg_layouts.push(layoutItem);
            return { lg: new_lg_layouts };
        });
        setIsMapAdded(true);
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
                    (e.target as HTMLElement).style.cursor = 'default';
                }
            }}
            autoSize={false} // otherwise the grid has strange behavior
        >
            <DiagramAdder
                onLoad={handleLoadNadFromElement}
                onSearch={showVoltageLevelDiagram}
                onMap={!isMapAdded ? onAddMap : undefined}
                onMapCard={!isMapCardAdded ? onAddMapCard : undefined}
                key={'Adder'}
            />
            {renderDiagrams()}
            {isMapCardAdded && renderMapCardSnippet()}
            {isMapAdded && renderMapCard()}
        </ResponsiveGridLayout>
    );
}

export default DiagramGridLayout;
