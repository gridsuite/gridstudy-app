/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import {
    Box,
    Grid,
    Paper,
    TextField,
    ToggleButton,
    Typography,
} from '@mui/material';

import DynamicSimulationResultSeriesList from './dynamic-simulation-result-series-list';
import { memo, useCallback, useMemo, useState } from 'react';
import DynamicSimulationResultSeriesChart from './dynamic-simulation-result-series-chart';
import Visibility from './common/visibility';
import TooltipIconButton from './common/tooltip-icon-button';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import SyncDisabledIcon from '@mui/icons-material/SyncDisabled';
import makeStyles from '@mui/styles/makeStyles';
import { useIntl } from 'react-intl';
import { MenuOpen } from '@mui/icons-material';
import ResponsiveGridLayout from './common/gridlayout/responsive-grid-layout';

const headers = ['Left Axis', 'Available Curves', 'Right Axis'];
const useStyles = makeStyles((theme) => ({
    graph: {
        height: 'calc(100vh - 330px)',
        paddingRight: theme.spacing(0.5),
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    menuCloseButton: {
        transform: 'scaleX(-1)',
    },
    addButton: {
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    },
    paperOptionsGroup: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        display: 'flex',
        flexWrap: 'wrap',
        padding: '2px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardSticky: {
        position: 'sticky',
        top: theme.spacing(2),
    },
    toolBar: {
        marginTop: theme.spacing(1),
    },
    removeStyle: {
        position: 'absolute',
        right: '2px',
        top: 0,
        cursor: 'pointer',
    },
    colsLabel: {
        marginLeft: theme.spacing(2),
    },
    colsInput: {
        marginLeft: theme.spacing(1),
    },
}));

const DynamicSimulationResultChart = ({
    groupId,
    seriesNames,
    selected,
    loadTimeSeries,
}) => {
    const classes = useStyles();
    const intl = useIntl();

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
            return loadTimeSeries(selectedIndexes).then(
                (selectedTimeSeries) => {
                    // transform to plotly's compatible data
                    const selectedSeries = selectedTimeSeries.map(
                        (elem, index) => {
                            const metadata = elem?.metadata;
                            const values =
                                elem?.chunks && elem.chunks[0]?.values;
                            return {
                                index: index,
                                name: metadata?.name,
                                data: {
                                    x: metadata?.irregularIndex,
                                    y: values,
                                },
                            };
                        }
                    );

                    return selectedSeries;
                }
            );
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

    const items = useMemo(() => {
        return seriesNames.map((name, index) => ({
            id: index,
            label: name,
        }));
    }, [seriesNames]);

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

    const handleClose = useCallback(
        (index) => {
            const newPlots = Array.from(plots);
            newPlots.splice(index, 1);
            setSelectedIndex(
                newPlots.length === 0
                    ? -1
                    : index === plots.length - 1
                    ? newPlots.length - 1
                    : index
            ); // get the next item in new plots
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

    return (
        <Grid container direction={'column'} alignItems={'stretch'}>
            <Grid item>
                <Grid
                    container
                    className={classes.toolBar}
                    alignItems="center"
                    justify="center"
                >
                    <Grid item>
                        <Paper
                            elevation={2}
                            className={classes.paperOptionsGroup}
                        >
                            <ToggleButton
                                size={'small'}
                                value="sync"
                                selected={sync}
                                onChange={handleSync}
                            >
                                {sync ? <SyncIcon /> : <SyncDisabledIcon />}
                            </ToggleButton>
                            <Typography className={classes.colsLabel}>
                                {`${intl.formatMessage({
                                    id: 'DynamicSimulationResultLayoutCols',
                                })}`}
                            </Typography>
                            <TextField
                                className={classes.colsInput}
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
                    <Grid item ml={2}>
                        <TooltipIconButton
                            toolTip={'Add a graph'}
                            className={classes.addButton}
                            onClick={handleAddNewPlot}
                        >
                            <AddIcon />
                        </TooltipIconButton>
                    </Grid>
                    <Grid item xs />
                    <Grid item xs={'auto'}>
                        <Paper
                            elevation={2}
                            className={classes.paperOptionsGroup}
                        >
                            <ToggleButton
                                size={'small'}
                                value="showSeriesList"
                                selected={showSeriesList}
                                onChange={handleShowSeriesList}
                            >
                                {showSeriesList ? (
                                    <MenuOpen
                                        className={classes.menuCloseButton}
                                    />
                                ) : (
                                    <MenuOpen />
                                )}
                            </ToggleButton>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container>
                    <Grid item xs>
                        <Box className={classes.graph}>
                            <ResponsiveGridLayout
                                className={`layout`}
                                cols={{
                                    lg: gridLayout.cols,
                                    md: gridLayout.cols,
                                    sm: gridLayout.cols,
                                    xs: 1,
                                    xxs: 1,
                                }}
                                isBounded={true}
                                rowHeight={65}
                                onBreakpointChange={handleBreakpointChange}
                            >
                                {plots.map((plot, index) => (
                                    <div
                                        key={plot.id}
                                        data-grid={gridLayout.items.find(
                                            (item) => item.i === plot.id
                                        )}
                                    >
                                        <DynamicSimulationResultSeriesChart
                                            key={`${plot.id}`}
                                            id={`${plot.id}`}
                                            groupId={`${groupId}`}
                                            index={index}
                                            selected={selectedIndex === index}
                                            onSelect={handleSelectIndex}
                                            leftSeries={plot.leftSelectedSeries}
                                            rightSeries={
                                                plot.rightSelectedSeries
                                            }
                                            onClose={handleClose}
                                            sync={sync}
                                        />
                                    </div>
                                ))}
                            </ResponsiveGridLayout>
                        </Box>
                    </Grid>
                    <Grid item xs={'auto'}>
                        <Box
                            sx={{
                                width: 'auto',
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
                                        onLeftAxisSelected={
                                            handleLeftAxisSelected
                                        }
                                        onRightAxisSelected={
                                            handleRightAxisSelected
                                        }
                                    />
                                </Visibility>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

DynamicSimulationResultChart.propTypes = {
    groupId: PropTypes.string.isRequired,
    seriesNames: PropTypes.arrayOf(PropTypes.string.isRequired),
    selected: PropTypes.bool.isRequired,
    loadTimeSeries: PropTypes.func,
};

export default memo(DynamicSimulationResultChart);
