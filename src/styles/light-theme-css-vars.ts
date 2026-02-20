/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const lightThemeCssVars = {
    '.nad-edge-infos text': {
        stroke: 'white', // Border outside of the displayed values on lines. Same color as the background.
    },
    '.nad-active': {
        fill: '#212121', // Text color of the values and arrows on lines.
    },
    '.nad-reactive': {
        fill: '#212121',
    },
    '.nad-label-box': {
        backgroundColor: '#9c9c9c20',
    },
    '.nad-busnode-highlight': {
        filter: 'drop-shadow(0px 5px 4px rgba(0, 0, 0, 0.2))',
    },
    '.nad-textnode-highlight': {
        backgroundColor: '#f0f0f0cc', // same displayed color as #9c9c9c20 but with 0.8 opacity
    },
};
