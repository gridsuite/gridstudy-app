/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { blue, cyan, green, orange, pink, purple, red } from '@mui/material/colors';

export const baseColors = [red, orange, blue, green, purple, pink, cyan];
export const defaultLayout = {
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
        tickprefix: 'X = ',
        ticksuffix: 's',
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
};
