import {
    blue,
    cyan,
    green,
    orange,
    pink,
    purple,
    red,
} from '@mui/material/colors';
import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';

/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const baseColors = [red, orange, blue, green, purple, pink, cyan];

const PlotlySeriesChart = ({ leftSeries, rightSeries }) => {
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

    return (
        <Plot
            data={data}
            layout={{
                autosize: true,
                plot_bgcolor: 'rgba(0,0,0,0.05)',
                paper_bgcolor: 'rgba(0,0,0,0.02)',
                margin: {
                    l: 10,
                    r: 10,
                    b: 10,
                    t: 10,
                    pad: 1,
                },
                xaxis: {
                    gridcolor: 'rgba(255,255,255,0.2)',
                    griddash: 'dot',
                    ntick: 20,
                    tick0: 0,
                    automargin: true,
                },
                yaxis: {
                    gridcolor: 'rgba(255,255,255,0.2)',
                    griddash: 'dot',
                    ntick: 20,
                    tick0: 0,
                    automargin: true,
                },
                yaxis2: {
                    gridcolor: 'rgba(255,255,255,0.2)',
                    griddash: 'dot',
                    ntick: 20,
                    tick0: 0,
                    automargin: true,
                    side: 'right',
                },
                legend: { orientation: 'h' },
                hovermode: 'x unified',
                hoverlabel: {
                    bgcolor: 'rgba(255,255,255,0.2)',
                    font: {
                        color: 'rgba(255,255,255,0.8)',
                    },
                },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height: 200 }}
        />
    );
};

export default memo(PlotlySeriesChart);
