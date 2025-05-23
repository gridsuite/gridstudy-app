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
import { EquipmentInfos, EquipmentType, OverflowableText } from '@gridsuite/commons-ui';
import CloseIcon from '@mui/icons-material/Close';
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined';
import { UUID } from 'crypto';
import { TopBarEquipmentSearchDialog } from 'components/top-bar-equipment-seach-dialog/top-bar-equipment-search-dialog';
import SingleLineDiagramContent from './singleLineDiagram/single-line-diagram-content';
import NetworkAreaDiagramContent from './networkAreaDiagram/network-area-diagram-content';
import { DiagramMetadata, SLDMetadata } from '@powsybl/network-viewer';
import { DiagramAdditionalMetadata } from './diagram-common';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
const ResponsiveGridLayout = WidthProvider(Responsive);

// Diagram types to manage here
const diagramTypes = [
    DiagramType.VOLTAGE_LEVEL,
    DiagramType.SUBSTATION,
    DiagramType.NETWORK_AREA_DIAGRAM,
    DiagramType.NAD_FROM_CONFIG,
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
    header: (theme: Theme) => ({
        padding: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderBottom: 'solid 1px',
        borderBottomColor: theme.palette.mode === 'light' ? theme.palette.action.selected : 'transparent',
    }),
};

const DEFAULT_WIDTH = 1;
const DEFAULT_HEIGHT = 2;

const initialLayouts = {
    // ResponsiveGridLayout will attempt to interpolate the rest of breakpoints based on this one
    lg: [
        {
            i: 'Adder',
            x: 0,
            y: 0,
            w: 1,
            h: 1,
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
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);

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
    const { diagrams, removeDiagram, createDiagram } = useDiagramModel({
        diagramTypes: enableDeveloperMode ? diagramTypes : [],
        onAddDiagram,
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
                    type: DiagramType.VOLTAGE_LEVEL,
                    voltageLevelId: element.voltageLevelId ?? '',
                };
                createDiagram(diagram);
            } else if (element.type === EquipmentType.SUBSTATION) {
                const diagram: DiagramParams = {
                    type: DiagramType.SUBSTATION,
                    substationId: element.id,
                };
                createDiagram(diagram);
            }
        },
        [createDiagram]
    );
    const renderDiagramAdder = useCallback(() => {
        if (Object.values(diagrams).length > 0) {
            return;
        }
        return (
            <div key={'Adder'} style={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={styles.header}>
                    <OverflowableText
                        className="react-grid-dragHandle"
                        sx={{ flexGrow: '1' }}
                        text={'Add a new diagram'}
                    />
                </Box>
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

    // This function is called by the diagram's contents, when they get their sizes from the backend.
    const setDiagramSize = useCallback((diagramId: UUID, diagramType: DiagramType, width: number, height: number) => {
        console.log('TODO setDiagramSize', diagramId, diagramType, width, height);
        // TODO adapt the layout w and h cnsidering those values
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
                    <Box sx={styles.header}>
                        <OverflowableText
                            className="react-grid-dragHandle"
                            sx={{ flexGrow: '1' }}
                            text={diagram.name}
                        />
                        <IconButton
                            size={'small'}
                            onClick={(e) => {
                                onRemoveItem(diagram.diagramUuid);
                                e.stopPropagation();
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box sx={styles.diagramContainer}>
                        {(diagram.type === DiagramType.VOLTAGE_LEVEL || diagram.type === DiagramType.SUBSTATION) && (
                            <SingleLineDiagramContent
                                showInSpreadsheet={showInSpreadsheet}
                                studyUuid={studyUuid}
                                diagramId={diagram.diagramUuid}
                                svg={diagram.svg?.svg ?? undefined}
                                svgType={diagram.type}
                                svgMetadata={(diagram.svg?.metadata as SLDMetadata) ?? undefined}
                                loadingState={false} // TODO
                                diagramSizeSetter={setDiagramSize}
                                visible={visible}
                            />
                        )}
                        {(diagram.type === DiagramType.NETWORK_AREA_DIAGRAM ||
                            diagram.type === DiagramType.NAD_FROM_CONFIG) && (
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
                                loadingState={false} // TODO
                                diagramSizeSetter={setDiagramSize}
                                visible={visible}
                            />
                        )}
                    </Box>
                </Box>
            );
        });
    }, [diagrams, onRemoveItem, setDiagramSize, showInSpreadsheet, studyUuid, visible]);

    return (
        <>
            <ResponsiveGridLayout
                className="layout"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 4, md: 2, sm: 2, xs: 1, xxs: 1 }}
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
