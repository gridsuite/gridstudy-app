/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { baseColors, defaultLayout } from './plot-config';
import { eventCenter, PlotEvents } from './plot-events';
import { SeriesType } from './plot-types';
import { debounce } from '@mui/material';

const PlotlySeriesChart = ({
    id,
    groupId,
    index,
    leftSeries,
    rightSeries,
    sync,
}) => {
    // these states used for responsible
    const plotRef = useRef(null);
    const resizeObserverRef = useRef(
        new ResizeObserver(
            debounce((entries) => {
                plotRef.current.resizeHandler();
            }),
            500
        )
    );

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
            // propagate data to parent
            if (sync) {
                eventCenter.emit(
                    PlotEvents.ON_RELAYOUT,
                    groupId,
                    id,
                    eventData
                );
            }
        },
        [sync, groupId, id]
    );

    const syncOnRelayout = useCallback(
        (channelId, senderId, eventData) => {
            if (channelId === groupId && senderId !== id && eventData) {
                // exit when no change on x
                if (
                    !eventData['xaxis.range[0]'] ||
                    !eventData['xaxis.range[1]'] ||
                    eventData['xaxis.range[0]'] === eventData['xaxis.range[1]']
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

                    newLayout.xaxis.range[0] = eventData['xaxis.range[0]'];
                    newLayout.xaxis.range[1] = eventData['xaxis.range[1]'];
                    // force refresh Plot in mutable layout but not work???
                    // newLayout.datarevision += 1;

                    return newLayout;
                });
                // force refresh Plot in mutable layout but not work???
                // setRevision((prev) => prev + 1);
            }
        },
        [groupId, id]
    );

    useEffect(() => {
        if (sync) {
            eventCenter.addListener(PlotEvents.ON_RELAYOUT, syncOnRelayout);
        }

        return () => {
            if (sync) {
                eventCenter.removeListener(
                    PlotEvents.ON_RELAYOUT,
                    syncOnRelayout
                );
            }
        };
    }, [sync, syncOnRelayout]);

    const handleOnInitialized = (figure, graphDiv) => {
        setLayout(figure.layout);
        // make inside plot responsible to parent div's resize event
        resizeObserverRef.current.observe(graphDiv);
    };

    const handleOnPurge = (figure, graphDiv) => {
        // unsubscribe resize event
        resizeObserverRef.current.unobserve(graphDiv);
    };

    return (
        <Plot
            ref={plotRef}
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{
                width: '100%',
                height: '95%',
            }}
            onRelayout={handleOnRelayout}
            onInitialized={handleOnInitialized}
            onPurge={handleOnPurge}
            //revision={revision}
        />
    );
};

PlotlySeriesChart.propTypes = {
    id: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
    index: PropTypes.number,
    leftSeries: SeriesType,
    rightSerie: SeriesType,
    sync: PropTypes.bool,
};

export default memo(PlotlySeriesChart);
