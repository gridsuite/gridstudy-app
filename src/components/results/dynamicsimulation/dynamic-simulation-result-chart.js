/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import './plot/react-grid-layout.main.css';
import './plot/react-grid-layout.custom.css';
import {
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
import { Box } from '@mui/material';
import { useIntl } from 'react-intl';

const headers = ['Left Axis', 'Available Curves', 'Right Axis'];
const ResponsiveGridLayout = WidthProvider(Responsive);
const useStyles = makeStyles((theme) => ({
    addButton: {
        borderRadius: '50%',
        marginRight: theme.spacing(10),
        color: theme.palette.primary.main,
    },
    paperOptionsGroup: {
        display: 'flex',
        //border: `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
        //backgroundColor: lighten(theme.palette.background.paper, 0.2),
        padding: '2px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardSticky: {
        position: 'sticky',
        top: theme.spacing(2),
    },
    toolBar: {
        //border: `1px solid ${theme.palette.divider}`,
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
const DynamicSimulationResultChart = ({ series, selected }) => {
    const classes = useStyles();
    const intl = useIntl();

    // button options synchronization
    const [sync, setSync] = useState(true);
    // event to synchronize
    const [syncEvent, setSyncEvent] = useState({});

    // tab id is auto increase and reset to zero when there is any tab
    const [plotIncId, setPlotIncId] = useState(1);
    const [plots, setPlots] = useState([
        {
            id: plotIncId,
            leftSelectedSeries: [],
            rightSelectedSeries: [],
        },
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [gridLayout, setGridLayout] = useState({
        items:
            plots.length > 0
                ? [
                      {
                          i: plots[0].id.toString(),
                          x: 0,
                          y: 0,
                          w: 1,
                          h: 1,
                      },
                  ]
                : [],
        cols: 1,
    });

    const handleSelectIndex = useCallback((index) => {
        setSelectedIndex(index);
    }, []);

    const handleLeftAxisSelected = (index, axisSelected) => {
        const newPlots = Array.from(plots);
        newPlots[index].leftSelectedSeries = selectedSeries(axisSelected);
        setPlots(newPlots);
    };

    const handleRightAxisSelected = (index, axisSelected) => {
        const newPlots = Array.from(plots);
        newPlots[index].rightSelectedSeries = selectedSeries(axisSelected);
        setPlots(newPlots);
    };

    const items = useMemo(() => {
        return series.map((s, index) => ({
            id: index,
            label: s.name,
        }));
    }, [series]);

    const selectedSeries = useCallback(
        (axisSelected) => {
            return series.filter(
                (s, index) => axisSelected.indexOf(index) !== -1
            );
        },
        [series]
    );

    const handleSync = useCallback(() => {
        // clear cached sync event
        setSyncEvent({});
        setSync((prev) => !prev);
    }, []);

    const handleAddNewPlot = useCallback(() => {
        setPlots((prev) => [
            ...prev,
            {
                id: plotIncId + 1,
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
                    i: (plotIncId + 1).toString(),
                    x: prev.items.length % (prev.cols || 12),
                    y: Infinity, // put new item at the bottom
                    w: 1,
                    h: 1,
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

    /* const handleLayoutChange = (layout) => {};*/

    const handleBreakpointChange = (breakpoint, cols) => {
        setGridLayout((prev) => ({
            ...prev,
            breakpoint: breakpoint,
            cols: cols,
        }));
    };

    const handlePlotSyncEvent = (syncEvent) => {
        setSyncEvent(syncEvent);
    };

    return (
        <Grid
            container
            //direction={'row'}
            //justifyContent={'space-between'}
            //alignItems={'flex-start'}
        >
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
                        <ResponsiveGridLayout
                            className={'layout'}
                            //cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            cols={{
                                lg: gridLayout.cols,
                                md: gridLayout.cols,
                                sm: gridLayout.cols,
                                xs: 1,
                                xxs: 1,
                            }}
                            rowHeight={570}
                            layout={gridLayout.items}
                            //onLayoutChange={handleLayoutChange}
                            onBreakpointChange={handleBreakpointChange}
                        >
                            {plots.map((plot, index) => (
                                <div key={plot.id.toString()}>
                                    {/* used for testing layout */
                                    /*<span className="text">{`ABC-${plot.id.toString()}`}</span>
                                                                        <span
                                        className="remove"
                                        style={{
                                            position: 'absolute',
                                            right: '2px',
                                            top: 0,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleClose(index)}
                                    >
                                        x
                                    </span>
                                    */}
                                    <DynamicSimulationResultSeriesChart
                                        key={`${plot.id}`}
                                        id={`${plot.id}`}
                                        index={index}
                                        selected={selectedIndex === index}
                                        onSelect={handleSelectIndex}
                                        leftSeries={plot.leftSelectedSeries}
                                        rightSeries={plot.rightSelectedSeries}
                                        onClose={handleClose}
                                        sync={sync}
                                        onSyncEvent={handlePlotSyncEvent}
                                        syncEvent={syncEvent}
                                    />
                                </div>
                            ))}
                        </ResponsiveGridLayout>
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

export default memo(DynamicSimulationResultChart);
