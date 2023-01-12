/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { baseColors, defaultLayout } from './plot-config';
import { eventCenter, PlotEvents } from './events';

const PlotlySeriesChart = ({
    id,
    groupId,
    index,
    leftSeries,
    rightSeries,
    sync,
}) => {
    const [layout, setLayout] = useState(
        JSON.parse(JSON.stringify(defaultLayout)) // deep clone can be done by lodash
    );
    const [revision, setRevision] = useState(0);

    const makeGetMarker = useMemo(
        () => (opts) => {
            return (s) => ({
                color: 'rgba(255,255,255,0.5)',
                line: {
                    color: baseColors[s.index % baseColors.length]['500'],
                    width: 1,
                },
                ...opts,
            });
        },
        []
    );

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

    useEffect(() => {
        const syncOnRelayout = (channelId, senderId, eventData) => {
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
        };

        if (sync) {
            eventCenter.addListener(PlotEvents.ON_RELAYOUT, syncOnRelayout);
        } else {
            eventCenter.removeListener(PlotEvents.ON_RELAYOUT, syncOnRelayout);
        }

        return () => {
            eventCenter.removeListener(PlotEvents.ON_RELAYOUT, syncOnRelayout);
        };
    }, [sync, groupId, id]);

    const handleOnInitialized = (figure) => {
        setLayout(figure.layout);
    };

    return (
        <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{ width: '100%', height: '200' }}
            onRelayout={handleOnRelayout}
            onInitialized={handleOnInitialized}
            revision={revision}
        />
    );
};

export default memo(PlotlySeriesChart);
