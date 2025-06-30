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
import { Box, darken, IconButton, Theme, useTheme } from '@mui/material';
import { ElementType, EquipmentInfos, EquipmentType } from '@gridsuite/commons-ui';
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined';
import { UUID } from 'crypto';
import { TopBarEquipmentSearchDialog } from 'components/top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';
import { DiagramAdditionalMetadata } from './diagram-common';
import { useDiagramsGridLayoutSessionStorage } from './hooks/use-diagrams-grid-layout-session-storage';
import { v4 } from 'uuid';
import CardHeader, { BLINK_LENGTH_MS } from './card-header';
import DiagramFooter from './diagram-footer';
import { useIntl } from 'react-intl';
import AlertCustomMessageNode from 'components/utils/alert-custom-message-node';
const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [
    DiagramType.VOLTAGE_LEVEL,
    DiagramType.SUBSTATION,
    DiagramType.NETWORK_AREA_DIAGRAM,
    DiagramType.NAD_FROM_ELEMENT,
];

const styles = {
    window: {
        display: 'flex',
        flexDirection: 'column',
    },
    diagramContainer: (theme: Theme) => ({
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor:
            theme.palette.mode === 'light'
                ? theme.palette.background.paper
                : theme.networkModificationPanel.backgroundColor,
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
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const [blinkingDiagrams, setBlinkingDiagrams] = useState<UUID[]>([]);
    const [diagramsInEditMode, setDiagramsInEditMode] = useState<UUID[]>([]);

    const onAddDiagram = (diagram: Diagram) => {
        setLayouts((old_layouts) => {
            const new_lg_layouts = old_layouts.lg.filter((layout) => layout.i !== 'Adder');
            const layoutItem: Layout = {
                i: diagram.diagramUuid,
                x: Infinity,
                y: 0,
                w: DEFAULT_WIDTH,
                h: DEFAULT_HEIGHT,
                minH: DEFAULT_HEIGHT,
                minW: DEFAULT_WIDTH,
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

    const renderDiagramAdder = useCallback(() => {
        if (Object.values(diagrams).length > 0) {
            return;
        }
        return (
            <div key={'Adder'} style={{ display: 'flex', flexDirection: 'column' }}>
                <CardHeader title={'Add a new diagram'} />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <IconButton
                        onClick={(e) => {
                            setIsDialogSearchOpen(true);
                        }}
                    >
                        <LibraryAddOutlinedIcon />
                    </IconButton>
                </Box>
            </div>
        );
    }, [diagrams]);

    const onExpandAllVoltageLevelIds = useCallback(
        (diagramId: UUID) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                console.error('CHARLY diagram', diagram);
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    voltageLevelIds: [],
                    voltageLevelToExpandIds: [...diagram.voltageLevelIds],
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds,
                });
            }
        },
        [diagrams, updateDiagram]
    );

    const onExpandVoltageLevelId = useCallback(
        (diagramId: UUID, newVoltageLevelId: string) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    voltageLevelIds: diagram.voltageLevelIds,
                    voltageLevelToExpandIds: diagram?.voltageLevelToExpandIds // TODO CHARLY check si ça peut être simplifié
                        ? [...diagram.voltageLevelToExpandIds, newVoltageLevelId]
                        : [newVoltageLevelId],
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds?.filter(
                        (id) => !diagram.voltageLevelIds.includes(id)
                    ),
                });
            }
        },
        [diagrams, updateDiagram]
    );

    const onHideVoltageLevelId = useCallback(
        (diagramId: UUID, voltageLevelIdToOmit: string) => {
            const diagram = diagrams[diagramId];
            if (diagram && diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                updateDiagram({
                    diagramUuid: diagramId,
                    type: DiagramType.NETWORK_AREA_DIAGRAM,
                    voltageLevelIds: diagram.voltageLevelIds.filter(id => id != voltageLevelIdToOmit),
                    voltageLevelToExpandIds: diagram?.voltageLevelToExpandIds,
                    voltageLevelToOmitIds: diagram.voltageLevelToOmitIds
                        ? [...diagram.voltageLevelToOmitIds, voltageLevelIdToOmit]
                        : [voltageLevelIdToOmit],
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
                <Box key={diagram.diagramUuid} sx={styles.window}>
                    <CardHeader
                        title={diagram.name}
                        blinking={blinkingDiagrams.includes(diagram.diagramUuid)}
                        onClose={() => onRemoveItem(diagram.diagramUuid)}
                    />
                    {globalError || Object.keys(diagramErrors).includes(diagram.diagramUuid) ? (
                        <AlertCustomMessageNode message={globalError || diagramErrors[diagram.diagramUuid]} noMargin />
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
                                    onExpandVoltageLevel={(vlId) => onExpandVoltageLevelId(diagram.diagramUuid, vlId)}
                                    onHideVoltageLevel={(vlId) => onHideVoltageLevelId(diagram.diagramUuid, vlId)}
                                />
                            )}
                            {diagram.type === DiagramType.NETWORK_AREA_DIAGRAM && ( // TODO CHARLY clean this
                                <DiagramFooter
                                    showCounterControls={diagramsInEditMode.includes(diagram.diagramUuid)}
                                    counterText={intl.formatMessage({
                                        id: 'depth',
                                    })}
                                    counterValue={0}
                                    onIncrementCounter={() => onExpandAllVoltageLevelIds(diagram.diagramUuid)}
                                    onDecrementCounter={() => alert('TODO CHARLY : obsolete')}
                                    incrementCounterDisabled={false}
                                    decrementCounterDisabled={true}
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
        onExpandAllVoltageLevelIds,
        onExpandVoltageLevelId,
        onRemoveItem,
        setDiagramSize,
        showInSpreadsheet,
        studyUuid,
        visible,
    ]);

    const onLoadFromSessionStorage = useCallback((savedLayouts: Layouts) => {
        if (savedLayouts) {
            setLayouts(savedLayouts);
        } else {
            setLayouts(initialLayouts);
        }
    }, []);

    useDiagramsGridLayoutSessionStorage({ layouts, onLoadFromSessionStorage });

    return (
        <>
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
                compactType={'horizontal'}
                onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
                layouts={layouts}
                style={{
                    backgroundColor:
                        theme.palette.mode === 'light'
                            ? darken(theme.palette.background.paper, 0.1)
                            : theme.reactflow.backgroundColor,
                    flexGrow: 1,
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
            >
                {renderDiagramAdder()}
                {renderDiagrams()}
            </ResponsiveGridLayout>
            <TopBarEquipmentSearchDialog
                showVoltageLevelDiagram={showVoltageLevelDiagram}
                isDialogSearchOpen={isDialogSearchOpen}
                setIsDialogSearchOpen={setIsDialogSearchOpen}
                disableEventSearch
            />
        </>
    );
}

export default DiagramGridLayout;
