/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import './plot/react-grid-layout.main.css'; // from /node_modules/react-grid-layout/css/styles.css
import './plot/react-grid-layout.custom.css';
// TODO place these css at global or directly into useStyles for ResponsiveGridLayout
import PropTypes from 'prop-types';
import {
    Box,
    Grid,
    Paper,
    TextField,
    ToggleButton,
    Typography,
} from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';

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

const headers = ['Left Axis', 'Available Curves', 'Right Axis'];
const ResponsiveGridLayout = WidthProvider(Responsive);
const useStyles = makeStyles((theme) => ({
    graph: {
        maxHeight: 'calc(100vh - 340px)',
        paddingRight: theme.spacing(0.5),
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    addButton: {
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    },
    paperOptionsGroup: {
        marginLeft: theme.spacing(2),
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

const DynamicSimulationResultChart = ({ groupId, series, selected }) => {
    const classes = useStyles();
    const intl = useIntl();

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

    const selectedSeries = useCallback(
        (axisSelected) => {
            return series.filter(
                (s, index) => axisSelected.indexOf(index) !== -1
            );
        },
        [series]
    );

    const handleLeftAxisSelected = useCallback(
        (index, axisSelected) => {
            setPlots((prev) => {
                const newPlots = Array.from(prev);
                newPlots[index].leftSelectedSeries =
                    selectedSeries(axisSelected);
                return newPlots;
            });
        },
        [selectedSeries]
    );

    const handleRightAxisSelected = useCallback(
        (index, axisSelected) => {
            setPlots((prev) => {
                const newPlots = Array.from(prev);
                newPlots[index].rightSelectedSeries =
                    selectedSeries(axisSelected);
                return newPlots;
            });
        },
        [selectedSeries]
    );

    const items = useMemo(() => {
        return series.map((s, index) => ({
            id: index,
            label: s.name,
        }));
    }, [series]);

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
        <Grid container>
            <Grid item xs={9}>
                <Grid
                    container
                    direction={'column'}
                    alignItems={'stretch'}
                    justifyContent={'flex-start'}
                >
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
                                        {sync ? (
                                            <SyncIcon />
                                        ) : (
                                            <SyncDisabledIcon />
                                        )}
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
                            <Grid item xs={true}></Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <div className={classes.graph}>
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
                        </div>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={3}>
                <Box className={classes.cardSticky}>
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
                                onLeftAxisSelected={handleLeftAxisSelected}
                                onRightAxisSelected={handleRightAxisSelected}
                            />
                        </Visibility>
                    ))}
                </Box>
            </Grid>
        </Grid>
    );
};

DynamicSimulationResultChart.propTypes = {
    groupId: PropTypes.string.isRequired,
    series: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.name,
        })
    ),
    selected: PropTypes.bool.isRequired,
};

export default memo(DynamicSimulationResultChart);
