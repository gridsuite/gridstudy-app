/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { Box, Grid, Paper, TextField, ToggleButton, Tooltip, Typography } from '@mui/material';

import DynamicSimulationResultSeriesList from './dynamic-simulation-result-series-list';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import DynamicSimulationResultSeriesChart from './dynamic-simulation-result-series-chart';
import Visibility from '../common/visibility';
import TooltipIconButton from '../common/tooltip-icon-button';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import { useIntl } from 'react-intl';
import { MenuOpen } from '@mui/icons-material';
import FitScreenSharpIcon from '@mui/icons-material/FitScreenSharp';
import FullscreenExitSharpIcon from '@mui/icons-material/FullscreenExitSharp';
import ResponsiveGridLayout from '../common/gridlayout/responsive-grid-layout';
import { lighten } from '@mui/material/styles';
import { mergeSx, useDebounce } from '@gridsuite/commons-ui';
import { arrayFrom } from '../../../utils/utils';

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
    },
    modal: (theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        opacity: 0.99,
        zIndex: 1,
        background: lighten(theme.palette.background.paper, 0.05),
    }),
    gridLayout: (theme) => ({
        paddingRight: theme.spacing(0.5),
        overflowY: 'auto',
        overflowX: 'hidden',
        height: '100%',
    }),
    menuCloseButton: {
        transform: 'scaleX(-1)',
    },
    fullViewButton: (theme) => ({
        marginRight: theme.spacing(2),
    }),
    addButton: (theme) => ({
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    }),
    paperOptionsGroup: (theme) => ({
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        display: 'flex',
        flexWrap: 'wrap',
        padding: '2px',
        justifyContent: 'center',
        alignItems: 'center',
    }),
    toolBar: (theme) => ({
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    colsLabel: (theme) => ({
        marginLeft: theme.spacing(2),
    }),
    colsInput: (theme) => ({
        marginLeft: theme.spacing(1),
    }),
};

function getTimeseriesIndex(metadata) {
    if (metadata?.irregularIndex) {
        return metadata.irregularIndex;
    }

    return metadata?.regularIndex
        ? arrayFrom(metadata.regularIndex.startTime, metadata.regularIndex.endTime, metadata.regularIndex.spacing)
        : [];
}

const DynamicSimulationResultChart = ({ groupId, timeseriesMetadatas, selected, loadTimeSeries }) => {
    const intl = useIntl();

    const headers = useMemo(
        () => [
            intl.formatMessage({ id: 'DynamicSimulationSeriesListLeftAxis' }),
            intl.formatMessage({
                id: 'DynamicSimulationSeriesListAvailableCurves',
            }),
            intl.formatMessage({ id: 'DynamicSimulationSeriesListRightAxis' }),
        ],
        [intl]
    );

    // store the previous layout when scaling in order to restore later
    const prevLayoutRef = useRef([]);

    // plotIdScale
    const [plotIdScale, setPlotIdScale] = useState(undefined);
    // button options switch full view / normal view
    const [fullView, setFullView] = useState(false);
    // button options hide/show series/list
    const [showSeriesList, setShowSeriesList] = useState(true);
    // button options synchronization
    const [sync, setSync] = useState(true);

    // tab id is auto increase and reset to zero when there is any tab
    const [plotIncId, setPlotIncId] = useState(1);
    const [plots, setPlots] = useState([
        {
            id: `1`,
            leftSelectedSeries: [],
            rightSelectedSeries: [],
        },
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [gridLayout, setGridLayout] = useState({
        items: [
            {
                i: `1`,
                x: 0,
                y: 0,
                w: 1,
                h: 5,
            },
        ],
        cols: 1,
    });

    const handleSelectIndex = useCallback((index) => {
        setSelectedIndex(index);
    }, []);

    const selectSeries = useCallback(
        (selectedIndexes) => {
            return loadTimeSeries(selectedIndexes).then((selectedTimeSeries) => {
                // transform to plotly's compatible data
                return selectedTimeSeries.map((elem) => {
                    const metadata = elem?.metadata;
                    const values = elem?.chunks && elem.chunks[0]?.values;
                    const timeseriesIndex = getTimeseriesIndex(metadata);
                    return {
                        index: elem.index,
                        name: metadata?.name,
                        data: {
                            x: timeseriesIndex,
                            y: values,
                        },
                    };
                });
            });
        },
        [loadTimeSeries]
    );

    const handleLeftAxisSelected = useCallback(
        (index, selectedIndexes) => {
            selectSeries(selectedIndexes).then((selectedSeries) => {
                setPlots((prev) => {
                    const newPlots = Array.from(prev);
                    newPlots[index].leftSelectedSeries = selectedSeries;
                    return newPlots;
                });
            });
        },
        [selectSeries]
    );

    const debouncedHandleLeftAxisSelected = useDebounce(handleLeftAxisSelected, 500);

    const handleRightAxisSelected = useCallback(
        (index, selectedIndexes) => {
            selectSeries(selectedIndexes).then((selectedSeries) => {
                setPlots((prev) => {
                    const newPlots = Array.from(prev);
                    newPlots[index].rightSelectedSeries = selectedSeries;
                    return newPlots;
                });
            });
        },
        [selectSeries]
    );

    const debouncedHandleRightAxisSelected = useDebounce(handleRightAxisSelected, 500);

    const items = useMemo(() => {
        return timeseriesMetadatas.map((elem, index) => ({
            id: index,
            label: elem.name,
        }));
    }, [timeseriesMetadatas]);

    const handleFullView = useCallback(() => {
        setFullView((prev) => !prev);
    }, []);

    const handleShowSeriesList = useCallback(() => {
        setShowSeriesList((prev) => !prev);
    }, []);

    const handleSync = useCallback(() => {
        setSync((prev) => !prev);
    }, []);

    const handleAddNewPlot = useCallback(() => {
        setPlots((prev) => [
            ...prev,
            {
                id: `${plotIncId + 1}`,
                leftSelectedSeries: [],
                rightSelectedSeries: [],
            },
        ]);

        // layout
        setGridLayout((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    i: `${plotIncId + 1}`,
                    x: prev.items.length % prev.cols,
                    y: Infinity, // put new item at the bottom
                    w: 1,
                    h: 5,
                },
            ],
        }));

        setSelectedIndex(plots.length);

        setPlotIncId((prev) => prev + 1);
    }, [plotIncId, plots.length]);

    const handleChangeCols = useCallback((event) => {
        setGridLayout((prev) => ({
            ...prev,
            cols: +event.target.value,
        }));
    }, []);

    const handlePlotScale = useCallback(
        (plotId, plotScale) => {
            // set grid layout
            setGridLayout((prev) => {
                let newItems;
                // must clone each item, not only the array to force RGL responsive
                if (plotScale) {
                    const backupItems = prev.items.map((item) => ({ ...item }));
                    prevLayoutRef.current = backupItems; // memorize layout

                    newItems = prev.items.map((item) => ({
                        ...item,
                        x: Infinity,
                        y: Infinity,
                        w: 0,
                        h: 0,
                    }));

                    // scale only one current item
                    let scaleItem = newItems.find((item) => item.i === plotId);

                    scaleItem.w = prev.cols; // set to full width of container
                    scaleItem.h = 10; // max height of the container
                    scaleItem.x = 0;
                    scaleItem.y = 0;
                } else {
                    // restore all items
                    newItems = prevLayoutRef.current.map((item) => ({
                        ...item,
                    }));
                }

                return {
                    ...prev,
                    items: newItems,
                };
            });

            // set the current plot id in scaling
            setPlotIdScale(plotScale ? plotId : undefined);
        },
        [prevLayoutRef]
    );

    const handleClose = useCallback(
        (index) => {
            const newPlots = Array.from(plots);
            newPlots.splice(index, 1);
            setSelectedIndex(newPlots.length === 0 ? -1 : index === plots.length - 1 ? newPlots.length - 1 : index); // get the next item in new plots
            setPlots(newPlots);
            if (newPlots.length === 0) {
                // reset plotIncId to zero
                setPlotIncId(0);
            }
        },
        [plots]
    );

    const handleBreakpointChange = (breakpoint, cols) => {
        setGridLayout((prev) => ({
            ...prev,
            breakpoint: breakpoint,
            cols: cols,
        }));
    };

    const handleLayoutChange = (layout, allLayouts) => {
        // save the internal changes to the component's state
        setGridLayout((prev) => ({
            ...prev,
            items: allLayouts.lg.map((item) => ({ ...item })),
        }));
    };

    return (
        <Box sx={mergeSx(styles.root, fullView && styles.modal)}>
            <Box>
                <Grid container sx={styles.toolBar} alignItems="center" justify="center">
                    {!plotIdScale && (
                        <Grid item>
                            <Paper elevation={2} sx={styles.paperOptionsGroup}>
                                <ToggleButton size={'small'} value="sync" selected={sync} onChange={handleSync}>
                                    {sync ? (
                                        <Tooltip
                                            title={intl.formatMessage({
                                                id: 'DynamicSimulationSyncPlotEnable',
                                            })}
                                        >
                                            <SyncIcon />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            title={intl.formatMessage({
                                                id: 'DynamicSimulationSyncPlotDisable',
                                            })}
                                        >
                                            <SyncDisabledIcon />
                                        </Tooltip>
                                    )}
                                </ToggleButton>
                                <Typography sx={styles.colsLabel}>
                                    {`${intl.formatMessage({
                                        id: 'DynamicSimulationResultLayoutCols',
                                    })}`}
                                </Typography>
                                <TextField
                                    sx={styles.colsInput}
                                    size={'small'}
                                    type="number"
                                    value={gridLayout.cols}
                                    onChange={handleChangeCols}
                                    InputProps={{
                                        inputProps: {
                                            max: 3,
                                            min: 1,
                                        },
                                    }}
                                />
                            </Paper>
                        </Grid>
                    )}
                    {!plotIdScale && (
                        <Grid item ml={2}>
                            <TooltipIconButton
                                toolTip={intl.formatMessage({
                                    id: 'DynamicSimulationAddGraph',
                                })}
                                sx={styles.addButton}
                                onClick={handleAddNewPlot}
                            >
                                <AddIcon />
                            </TooltipIconButton>
                        </Grid>
                    )}
                    <Grid item xs />
                    <Grid item xs={'auto'}>
                        <Paper elevation={2} sx={styles.paperOptionsGroup}>
                            <ToggleButton
                                sx={styles.fullViewButton}
                                size={'small'}
                                value={'fullView'}
                                selected={fullView}
                                onChange={handleFullView}
                            >
                                {fullView ? (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DynamicSimulationFullViewDisable',
                                        })}
                                    >
                                        <FullscreenExitSharpIcon />
                                    </Tooltip>
                                ) : (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DynamicSimulationFullViewEnable',
                                        })}
                                    >
                                        <FitScreenSharpIcon />
                                    </Tooltip>
                                )}
                            </ToggleButton>
                            <ToggleButton
                                size={'small'}
                                value="showSeriesList"
                                selected={showSeriesList}
                                onChange={handleShowSeriesList}
                            >
                                {showSeriesList ? (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DynamicSimulationShowSeriesListDisable',
                                        })}
                                    >
                                        <MenuOpen sx={styles.menuCloseButton} />
                                    </Tooltip>
                                ) : (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: 'DynamicSimulationShowSeriesListEnable',
                                        })}
                                    >
                                        <MenuOpen />
                                    </Tooltip>
                                )}
                            </ToggleButton>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'hidden',
                }}
            >
                <Grid container sx={{ height: '100%' }}>
                    <Grid
                        item
                        xs
                        sx={{
                            height: '100%',
                        }}
                    >
                        <Box sx={styles.gridLayout}>
                            <ResponsiveGridLayout
                                className={`layout`}
                                cols={{
                                    lg: gridLayout.cols,
                                    md: gridLayout.cols,
                                    sm: gridLayout.cols,
                                    xs: 1,
                                    xxs: 1,
                                }}
                                layouts={{
                                    lg: gridLayout.items,
                                }}
                                isBounded={true}
                                computeRowHeight={(height) => height / 12}
                                onBreakpointChange={handleBreakpointChange}
                                onLayoutChange={handleLayoutChange}
                            >
                                {plots.map((plot, index) => (
                                    <Box
                                        key={plot.id}
                                        sx={{
                                            display: plotIdScale
                                                ? plotIdScale !== plot.id
                                                    ? 'none'
                                                    : 'block'
                                                : 'block',
                                        }}
                                    >
                                        <DynamicSimulationResultSeriesChart
                                            key={`${plot.id}`}
                                            id={`${plot.id}`}
                                            groupId={`${groupId}`}
                                            index={index}
                                            selected={selectedIndex === index}
                                            onSelect={handleSelectIndex}
                                            leftSeries={plot.leftSelectedSeries}
                                            rightSeries={plot.rightSelectedSeries}
                                            onClose={handleClose}
                                            sync={sync}
                                            onPlotScale={handlePlotScale}
                                        />
                                    </Box>
                                ))}
                            </ResponsiveGridLayout>
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={'auto'}
                        sx={{
                            height: '100%',
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                display: showSeriesList ? 'block' : 'none',
                            }}
                        >
                            {plots.map((plot, index) => (
                                <Visibility
                                    key={`plot-${plot.id}`}
                                    value={selectedIndex}
                                    index={index}
                                    visible={selected}
                                >
                                    <DynamicSimulationResultSeriesList
                                        index={index}
                                        items={items}
                                        headers={headers}
                                        onLeftAxisSelected={debouncedHandleLeftAxisSelected}
                                        onRightAxisSelected={debouncedHandleRightAxisSelected}
                                    />
                                </Visibility>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

DynamicSimulationResultChart.propTypes = {
    groupId: PropTypes.string.isRequired,
    timeseriesMetadatas: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
        })
    ),
    selected: PropTypes.bool.isRequired,
    loadTimeSeries: PropTypes.func,
};

export default memo(DynamicSimulationResultChart);
