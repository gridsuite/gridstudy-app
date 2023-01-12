/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Paper, ToggleButton } from '@mui/material';
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
import { lighten } from '@mui/material/styles';
import { Box } from '@mui/material';

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
        border: `1px solid ${theme.palette.divider}`,
        flexWrap: 'wrap',
        backgroundColor: lighten(theme.palette.background.paper, 0.2),
        padding: '2px',
    },
    cardSticky: {
        position: 'sticky',
        top: theme.spacing(2),
    },
}));
const DynamicSimulationResultChart = ({ series, selected }) => {
    console.log('Rerender DynamicSimulationResultChart', [series]);
    const classes = useStyles();

    // button options synchronization
    const [sync, setSync] = useState(true);

    const [plotEvent, setPlotEvent] = useState({
        eventData: undefined,
        eventName: undefined,
    });

    // tab id is auto increase and reset to zero when there is any tab
    const [plotId, setPlotId] = useState(1);
    const [plots, setPlots] = useState([
        {
            id: plotId,
            revision: 0, // in order to force refresh after layout changed
            leftSelectedSeries: [],
            rightSelectedSeries: [],
        },
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);

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
        setSync((prev) => {
            console.log('current sync = ', prev);
            return !prev;
        });

        // update revision to force update all registered callbacks
        const newPlots = Array.from(plots);
        for (let idx in newPlots) {
            newPlots[idx].revision = newPlots[idx].revision + 1;
        }
        setPlots(newPlots);
    }, [plots]);

    const handleAddNewPlot = useCallback(() => {
        setPlots((prev) => [
            ...prev,
            {
                id: plotId + 1,
                revision: 0,
                leftSelectedSeries: [],
                rightSelectedSeries: [],
            },
        ]);

        setSelectedIndex(plots.length);

        setPlotId((prev) => prev + 1);
    }, [plotId, plots.length]);

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
                // reset tabId to zero
                setPlotId(0);
            }
        },
        [plots]
    );

    const layout = plots.map((plot, index, list) => ({
        i: `${plot.id}`,
        x: index * 2,
        y: 0,
        w: 2,
        h: 2,
    }));

    const handleOnPlotRelayout = useCallback(
        (index, eventData, eventName) => {
            console.log(
                'sender-eventData-sync in handleOnPlotRelayout',
                index,
                eventData,
                sync
            );

            console.log('current sync in handleOnPlotRelayout', sync);
            if (!sync) {
                return;
            }

            // update event
            setPlotEvent((prev) => {
                prev.eventData = { ...eventData };
                prev.eventName = eventName;
                return prev;
            });

            // update revision to force refresh other plots except the sender
            const newPlots = Array.from(plots);
            console.log('number of plots = ', [plots.length]);
            for (let idx in newPlots) {
                if (idx !== `${index}`) {
                    console.debug(
                        'receiver-eventData in handleOnPlotRelayout',
                        idx
                    );
                    newPlots[idx].revision = newPlots[idx].revision + 1;
                }
            }
            setPlots(newPlots);
        },
        [sync, plots]
    );

    //const handleLayoutChange = (layout) => {};

    //const handleBreakpointChange = (breakpoint, cols) => {};

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
                        <Grid container>
                            <Grid item>
                                <TooltipIconButton
                                    toolTip={'Add a graph'}
                                    className={classes.addButton}
                                    onClick={handleAddNewPlot}
                                >
                                    <AddIcon />
                                </TooltipIconButton>
                            </Grid>
                            <Grid item xs={true}></Grid>
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
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <ResponsiveGridLayout
                            className={'layout'}
                            layout={layout}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            rowHeight={200}
                            //onLayoutChange={handleLayoutChange}
                            //onBreakpointChange={handleBreakpointChange}
                        >
                            {plots.map((plot, index) => (
                                <DynamicSimulationResultSeriesChart
                                    key={`${plot.id}`}
                                    id={`${plot.id}`}
                                    index={index}
                                    selected={selectedIndex === index}
                                    onSelect={handleSelectIndex}
                                    leftSeries={plot.leftSelectedSeries}
                                    rightSeries={plot.rightSelectedSeries}
                                    onClose={handleClose}
                                    onRelayout={handleOnPlotRelayout}
                                    revision={plot.revision}
                                    plotEvent={plotEvent}
                                />
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
