/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import {
    forwardRef,
    memo,
    useCallback,
    useMemo,
    useState,
    useImperativeHandle,
} from 'react';
import Plot from 'react-plotly.js';
import { baseColors, defaultLayout } from './plot-config';
import { PlotEvents } from './plot-events';
import { SeriesType } from './plot-types';

const PlotlySeriesChart = forwardRef(
    ({ id, leftSeries, rightSeries, sync, onSyncEvent }, ref) => {
        const [layout, setLayout] = useState(
            JSON.parse(JSON.stringify(defaultLayout)) // deep clone can be done by lodash
        );

        // force refresh Plot in mutable layout but not work???
        //const [revision, setRevision] = useState(0);

        const makeGetMarker = useCallback((opts) => {
            return (s) => ({
                color: 'rgba(255,255,255,0.5)',
                line: {
                    color: baseColors[s.index % baseColors.length]['500'],
                    width: 1,
                },
                ...opts,
            });
        }, []);

        const data = useMemo(() => {
            function seriesToData(getMarker, opts) {
                return (s) => ({
                    name: s.name,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: getMarker(s),
                    line: {
                        color: baseColors[s.index % baseColors.length]['500'],
                    },
                    ...s.data,
                    ...opts,
                });
            }

            return [
                ...leftSeries.map(seriesToData(makeGetMarker({}))),
                ...rightSeries.map(
                    seriesToData(
                        makeGetMarker({
                            symbol: 'square',
                        }),
                        {
                            yaxis: 'y2',
                        }
                    )
                ),
            ];
        }, [leftSeries, rightSeries, makeGetMarker]);

        const handleOnRelayout = useCallback(
            (eventData) => {
                // propagate sync data to parent
                console.log('Sync value = ', sync);
                if (sync) {
                    console.log('Send sync event from ' + id, eventData);
                    onSyncEvent({
                        senderId: id,
                        eventType: PlotEvents.ON_RELAYOUT,
                        eventData: eventData,
                    });
                }
            },
            [sync, id, onSyncEvent]
        );

        useImperativeHandle(
            ref,
            () => ({
                syncOnRelayout: ({ senderId, eventType, eventData }) => {
                    console.log(
                        id + ' Receives sync event from ' + senderId,
                        eventData
                    );
                    if (eventType !== PlotEvents.ON_RELAYOUT) {
                        return;
                    }
                    if (
                        senderId !== id /* fire only other plots */ &&
                        eventData
                    ) {
                        console.log(
                            id + ' Fire sync event from ' + senderId,
                            eventData
                        );
                        // exit when no change on x
                        if (
                            !eventData['xaxis.range[0]'] ||
                            !eventData['xaxis.range[1]'] ||
                            eventData['xaxis.range[0]'] ===
                                eventData['xaxis.range[1]']
                        )
                            return;

                        // mutable layout => constrained from react-plotly.js
                        // https://github.com/plotly/plotly.js/issues/2389
                        setLayout((prev) => {
                            const newLayout = {
                                ...prev,
                                xaxis: {
                                    ...prev.xaxis,
                                    range: [...prev.xaxis.range],
                                },
                            };

                            newLayout.xaxis.range[0] =
                                eventData['xaxis.range[0]'];
                            newLayout.xaxis.range[1] =
                                eventData['xaxis.range[1]'];
                            // force refresh Plot in mutable layout but not work???
                            // newLayout.datarevision += 1;

                            return newLayout;
                        });
                        // force refresh Plot in mutable layout but not work???
                        // setRevision((prev) => prev + 1);
                    }
                },
            }),
            [id]
        );

        const handleOnInitialized = (figure) => {
            setLayout(figure.layout);
        };

        return (
            <Plot
                data={data}
                layout={layout}
                useResizeHandler={true}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                onRelayout={handleOnRelayout}
                onInitialized={handleOnInitialized}
                //revision={revision}
            />
        );
    }
);

PlotlySeriesChart.propTypes = {
    id: PropTypes.string.isRequired,
    leftSeries: SeriesType,
    rightSerie: SeriesType,
    sync: PropTypes.bool,
    onSyncEvent: PropTypes.func,
};

export default memo(PlotlySeriesChart);
