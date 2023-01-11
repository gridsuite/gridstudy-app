/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { baseColors, defaultLayout, PlotEvents } from './plot-config';

const PlotlySeriesChart = ({
    id,
    index,
    leftSeries,
    rightSeries,
    onRelayout,
    revision,
    plotEvent,
}) => {
    console.log('id-revision : ', [id, revision]);
    const [layout, setLayout] = useState(
        JSON.parse(JSON.stringify(defaultLayout)) // deep clone can be done by lodash
    );

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
            console.log('onRelayout trigged', [eventData]);
            // propagate data to parent
            onRelayout(index, eventData, PlotEvents.ON_RELAYOUT);
        },
        [index, onRelayout]
    );

    useEffect(() => {
        if (
            revision !== 0 /* first version, ignore */ &&
            plotEvent &&
            plotEvent.eventData
        ) {
            switch (plotEvent.eventName) {
                case PlotEvents.ON_RELAYOUT:
                    // exit when no change on x
                    if (
                        !plotEvent.eventData['xaxis.range[0]'] ||
                        !plotEvent.eventData['xaxis.range[1]'] ||
                        plotEvent.eventData['xaxis.range[0]'] ===
                            plotEvent.eventData['xaxis.range[1]']
                    )
                        return;

                    setLayout((prev) => {
                        const newLayout = {
                            ...prev,
                            xaxis: {
                                ...prev.xaxis,
                                range: [...prev.xaxis.range],
                            },
                        };

                        newLayout.xaxis.range[0] =
                            plotEvent.eventData['xaxis.range[0]'];
                        newLayout.xaxis.range[1] =
                            plotEvent.eventData['xaxis.range[1]'];

                        console.log('index-new layout in useEffect : ', [
                            index,
                            newLayout,
                        ]);
                        return newLayout;
                    });
                    break;
                default:
                    break;
            }
        }
    }, [index, revision, plotEvent]);

    const handleOnInitialized = (figure) => {
        setLayout(figure.layout);
    };

    return (
        <Plot
            data={data}
            layout={layout}
            useResizeHandler={true}
            style={{ width: '100%', height: 200 }}
            onRelayout={handleOnRelayout}
            onInitialized={handleOnInitialized}
        />
    );
};

export default memo(PlotlySeriesChart);
