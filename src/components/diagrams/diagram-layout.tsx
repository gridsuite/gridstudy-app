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
import DiagramGridItem from './diagram-grid-item';

const ResponsiveGridLayout = WidthProvider(Responsive);

const diagramTypes = [DiagramType.VOLTAGE_LEVEL, DiagramType.SUBSTATION, DiagramType.NAD_FROM_CONFIG];

const styles = {
    itemContainer: (theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'lightblue',
    }),
    header: (theme: Theme) => ({
        // // prevent header from making the window wider, prevent bugs when displaying a lot of different voltage levels
        // position: 'absolute',
        // width: '100%',
        // ////
        padding: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        // flexDirection: 'row',
        // wordBreak: 'break-all',
        backgroundColor: theme.palette.background.default,
        borderBottom: 'solid 1px',
        borderBottomColor: theme.palette.mode === 'light' ? theme.palette.action.selected : 'transparent',
    }),
};

const DEFAULT_WIDTH = 2;
const DEFAULT_HEIGHT = 2;

const initialLayouts = {
    // RGL will attempt to interpolate the rest of breakpoints based on this one
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

function DiagramLayout() {
    const theme = useTheme();
    const [layouts, setLayouts] = useState<Layouts>(initialLayouts);
    const [cols, setCols] = useState<number>(4);
    const [isDialogSearchOpen, setIsDialogSearchOpen] = useState(false);
    const onBreakpointChange = (newBreakpoint: string, cols: number) => {
        setCols(cols);
    };

    const onAddDiagram = (diagram: Diagram) => {
        setLayouts((old_layouts) => {
            const new_lg_layouts = old_layouts.lg.filter((layout) => layout.i !== 'Adder');

            const layoutItem = {
                i: diagram.diagramUuid,
                x: (new_lg_layouts.length * DEFAULT_WIDTH) % cols,
                y: Infinity,
                w: DEFAULT_WIDTH,
                h: DEFAULT_HEIGHT,
            };
            console.log('SBO onAddDiagram', layoutItem);
            new_lg_layouts.push(layoutItem);
            console.log('SBO new_layouts', new_lg_layouts);
            return { lg: new_lg_layouts };
        });
    };
    const { diagrams, removeDiagram, createDiagram } = useDiagramModel({ diagramTypes: diagramTypes, onAddDiagram });

    const onRemoveItem = useCallback(
        (diagramUuid: UUID) => {
            console.log('SBO removing', diagramUuid);
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
            console.log('SBO showVoltageLevelDiagram', element);
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
            <div key={'Adder'} style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'lightblue' }}>
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
                            console.log('SBO click to add diagram');
                            setIsDialogSearchOpen(true);
                        }}
                    >
                        <LibraryAddOutlinedIcon />
                    </IconButton>
                </Box>
            </div>
        );
    }, [diagrams]);

    const renderDiagrams = useCallback(() => {
        if (Object.values(diagrams).length === 0) {
            return;
        }
        return Object.values(diagrams).map((diagram) => {
            if (!diagram) {
                return null;
            }
            return (
                <div
                    key={diagram.diagramUuid}
                    style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'lightblue' }}
                >
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
                    <DiagramGridItem diagram={diagram} />
                </div>
            );
        });
    }, [diagrams, onRemoveItem]);
    console.log('SBO diagrams', diagrams);
    console.log('SBO layouts', layouts);

    return (
        <>
            <ResponsiveGridLayout
                className="layout"
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 4, md: 2, sm: 2, xs: 1, xxs: 1 }}
                compactType={undefined}
                onLayoutChange={(currentLayout, allLayouts) => setLayouts(allLayouts)}
                layouts={layouts}
                onBreakpointChange={onBreakpointChange}
                style={{
                    backgroundColor:
                        theme.palette.mode === 'light'
                            ? darken(theme.palette.background.paper, 0.1)
                            : theme.palette.background.paper,
                    flexGrow: 1,
                    overflow: 'auto',
                }}
                draggableHandle=".react-grid-dragHandle"
                onDragStart={(layout, oldItem, newItem, placeholder, e, element) => {
                    if (e.target) {
                        e.target.style.cursor = 'grabbing';
                    }
                }}
                onDragStop={(layout, oldItem, newItem, placeholder, e, element) => {
                    if (e.target) {
                        e.target.style.cursor = 'default';
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

export default DiagramLayout;
