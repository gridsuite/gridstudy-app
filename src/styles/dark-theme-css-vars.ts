/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const darkThemeCssVars = {
    '.nad-edge-infos text': {
        stroke: '#292e33', // Border outside of the displayed values on lines. Same color as the background.
    },
    '.nad-active': {
        fill: 'white', // Text color of the values and arrows on lines.
    },
    '.nad-reactive': {
        fill: 'white',
    },
    '.nad-permanent-limit-percentage': {
        fill: 'white',
    },
    '.nad-label-box': {
        backgroundColor: '#6c6c6c20',
    },
    '.nad-textnode-highlight': {
        backgroundColor: '#32373bd9', // same displayed color as #6c6c6c20 but with 0.85 opacity
    },
};
