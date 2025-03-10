/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { baseColors, defaultLayout } from './plot-config';
import { eventCenter, PlotEvents } from './plot-events';
import { Series } from './plot-types';
import { useDebounce } from '@gridsuite/commons-ui';
import { Figure, PlotParams } from 'react-plotly.js';
import { Layout, PlotData, PlotMarker } from 'plotly.js';

// create own Plot by using Plotly in basic dist for the reason of big size in standard dist plotly.js
const Plot = createPlotlyComponent(Plotly) as FunctionComponent<
    PlotParams & { ref: any } /* hack to bypass ref which is not in PlotParams */
>;

export type PlotlySeriesChartProps = {
    id: string;
    groupId: string;
    leftSeries: Series[];
    rightSeries: Series[];
    sync: boolean;
};

function PlotlySeriesChart({ id, groupId, leftSeries, rightSeries, sync }: Readonly<PlotlySeriesChartProps>) {
    // these states used for responsible
    const plotRef = useRef<any>();
    const debouncedResizeHandler = useDebounce((entries) => {
        console.log('XXX plotRef.current', plotRef.current);
        plotRef.current && Plotly.Plots.resize(plotRef.current);
    }, 500);
    const resizeObserverRef = useRef(new ResizeObserver(debouncedResizeHandler));

    const [layout, setLayout] = useState(
        JSON.parse(JSON.stringify(defaultLayout)) // deep clone can be done by lodash
    );

    // force refresh Plot in mutable layout but not work???
    //const [revision, setRevision] = useState(0);

    const makeGetMarker = useCallback((defaults?: Partial<PlotMarker>) => {
        return (s: Series): Partial<PlotMarker> => ({
            ...defaults,
            color: 'rgba(255,255,255,0.5)',
            line: {
                color: baseColors[s.index % baseColors.length][
                    `${300 + (Math.floor(s.index / baseColors.length) % 7) * 100}` as keyof (typeof baseColors)[number] // compute from 300 to 900 with step = 100
                ],
                width: 1,
            },
        });
    }, []);

    const data = useMemo(() => {
        function seriesToData(
            getMarker: (s: Series) => Partial<PlotMarker>,
            defaults?: Partial<PlotData>
        ): (s: Series) => Partial<PlotData> {
            return (s: Series) => ({
                ...defaults,
                name: s.name,
                type: 'scatter',
                mode: 'lines+markers',
                marker: getMarker(s),
                line: {
                    color: baseColors[s.index % baseColors.length][
                        `${
                            300 + (Math.floor(s.index / baseColors.length) % 7) * 100
                        }` as keyof (typeof baseColors)[number] // compute from 300 to 900 with step = 100
                    ],
                },
                x: s.data.x ? s.data.x.map((value) => value / 1000) : [], // ms => s
                y: s.data.y ? s.data.y : [],
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
        (eventData: Readonly<Plotly.PlotRelayoutEvent>) => {
            // propagate data to parent
            if (sync) {
                eventCenter.emit(PlotEvents.ON_RELAYOUT, groupId, id, eventData);
            }
        },
        [sync, groupId, id]
    );

    const syncOnRelayout = useCallback(
        (channelId: string, senderId: string, eventData: Readonly<Plotly.PlotRelayoutEvent>) => {
            if (channelId === groupId && senderId !== id && eventData) {
                // exit when no change on x
                if (
                    !eventData['xaxis.range[0]'] ||
                    !eventData['xaxis.range[1]'] ||
                    eventData['xaxis.range[0]'] === eventData['xaxis.range[1]']
                ) {
                    return;
                }

                // mutable layout => constrained from react-plotly.js
                // https://github.com/plotly/plotly.js/issues/2389
                setLayout((prev: Layout) => {
                    const newLayout = {
                        ...prev,
                        xaxis: {
                            ...prev.xaxis,
                            range: [...(prev.xaxis.range ?? [])],
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
                eventCenter.removeListener(PlotEvents.ON_RELAYOUT, syncOnRelayout);
            }
        };
    }, [sync, syncOnRelayout]);

    const handleOnInitialized = (figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => {
        setLayout(figure.layout);
        // make inside plot responsible to parent div's resize event
        resizeObserverRef.current.observe(graphDiv);
    };

    const handleOnPurge = (figure: Readonly<Figure>, graphDiv: Readonly<HTMLElement>) => {
        // unsubscribe resize event
        resizeObserverRef.current.unobserve(graphDiv);
    };

    return (
        <Plot
            ref={plotRef}
            data={data}
            layout={layout}
            config={{ displaylogo: false }}
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
}

export default memo(PlotlySeriesChart);
