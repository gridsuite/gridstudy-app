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
    '.nad-label-box': {
        backgroundColor: '#9c9c9c20',
    },
    '.nad-busnode-highlight, .nad-textnode-highlight': {
        filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
    },
    '.sld-vl0to30, .nad-vl0to30': {
        '--vl-color': '#ABAE28',
    },
    '.sld-vl0to30.sld-bus-1, .nad-vl0to30.nad-bus-1': {
        '--vl-color': '#69701B',
    },
    '.sld-vl0to30.sld-bus-2, .nad-vl0to30.nad-bus-2': {
        '--vl-color': '#D8D20A',
    },
    '.sld-vl0to30.sld-bus-3, .nad-vl0to30.nad-bus-3': {
        '--vl-color': '#A156AA',
    },
    '.sld-vl0to30.sld-bus-4, .nad-vl0to30.nad-bus-4': {
        '--vl-color': '#CB3DDD',
    },
    '.sld-vl0to30.sld-bus-5, .nad-vl0to30.nad-bus-5': {
        '--vl-color': '#A684BC',
    },
    '.sld-vl0to30.sld-bus-6, .nad-vl0to30.nad-bus-6': {
        '--vl-color': '#62188B',
    },
    '.sld-vl0to30.sld-bus-7, .nad-vl0to30.nad-bus-7': {
        '--vl-color': '#885CA8',
    },
    '.sld-vl0to30.sld-bus-8, .nad-vl0to30.nad-bus-8': {
        '--vl-color': '#A020F0',
    },
    '.sld-vl0to30.sld-bus-9, .nad-vl0to30.nad-bus-9': {
        '--vl-color': '#CC80FF',
    },
    '.sld-vl30to50, .nad-vl30to50': {
        '--vl-color': '#FF8290',
    },
    '.sld-vl30to50.sld-bus-1, .nad-vl30to50.nad-bus-1': {
        '--vl-color': '#E7173E',
    },
    '.sld-vl30to50.sld-bus-2, .nad-vl30to50.nad-bus-2': {
        '--vl-color': '#DAA8AD',
    },
    '.sld-vl30to50.sld-bus-3, .nad-vl30to50.nad-bus-3': {
        '--vl-color': '#459C63',
    },
    '.sld-vl30to50.sld-bus-4, .nad-vl30to50.nad-bus-4': {
        '--vl-color': '#00E266',
    },
    '.sld-vl30to50.sld-bus-5, .nad-vl30to50.nad-bus-5': {
        '--vl-color': '#A7B368',
    },
    '.sld-vl30to50.sld-bus-6, .nad-vl30to50.nad-bus-6': {
        '--vl-color': '#1A4D1B',
    },
    '.sld-vl30to50.sld-bus-7, .nad-vl30to50.nad-bus-7': {
        '--vl-color': '#C2CB92',
    },
    '.sld-vl30to50.sld-bus-8, .nad-vl30to50.nad-bus-8': {
        '--vl-color': '#218B21',
    },
    '.sld-vl30to50.sld-bus-9, .nad-vl30to50.nad-bus-9': {
        '--vl-color': '#58D058',
    },
    '.sld-vl50to70, .nad-vl50to70': {
        '--vl-color': '#A020F0',
    },
    '.sld-vl50to70.sld-bus-1, .nad-vl50to70.nad-bus-1': {
        '--vl-color': '#62188B',
    },
    '.sld-vl50to70.sld-bus-2, .nad-vl50to70.nad-bus-2': {
        '--vl-color': '#AC8AC2',
    },
    '.sld-vl50to70.sld-bus-3, .nad-vl50to70.nad-bus-3': {
        '--vl-color': '#ABCBAB',
    },
    '.sld-vl50to70.sld-bus-4, .nad-vl50to70.nad-bus-4': {
        '--vl-color': '#C5ED3B',
    },
    '.sld-vl50to70.sld-bus-5, .nad-vl50to70.nad-bus-5': {
        '--vl-color': '#A7B368',
    },
    '.sld-vl50to70.sld-bus-6, .nad-vl50to70.nad-bus-6': {
        '--vl-color': '#55591B',
    },
    '.sld-vl50to70.sld-bus-7, .nad-vl50to70.nad-bus-7': {
        '--vl-color': '#E5E844',
    },
    '.sld-vl50to70.sld-bus-8, .nad-vl50to70.nad-bus-8': {
        '--vl-color': '#ABAE28',
    },
    '.sld-vl50to70.sld-bus-9, .nad-vl50to70.nad-bus-9': {
        '--vl-color': '#DAD970',
    },
    '.sld-vl70to120, .nad-vl70to120': {
        '--vl-color': '#FF9D00',
    },
    '.sld-vl70to120.sld-bus-1, .nad-vl70to120.nad-bus-1': {
        '--vl-color': '#7E3109',
    },
    '.sld-vl70to120.sld-bus-2, .nad-vl70to120.nad-bus-2': {
        '--vl-color': '#CC5500',
    },
    '.sld-vl70to120.sld-bus-3, .nad-vl70to120.nad-bus-3': {
        '--vl-color': '#25699D',
    },
    '.sld-vl70to120.sld-bus-4, .nad-vl70to120.nad-bus-4': {
        '--vl-color': '#0057F9',
    },
    '.sld-vl70to120.sld-bus-5, .nad-vl70to120.nad-bus-5': {
        '--vl-color': '#74AFEA',
    },
    '.sld-vl70to120.sld-bus-6, .nad-vl70to120.nad-bus-6': {
        '--vl-color': '#1B3459',
    },
    '.sld-vl70to120.sld-bus-7, .nad-vl70to120.nad-bus-7': {
        '--vl-color': '#448BE8',
    },
    '.sld-vl70to120.sld-bus-8, .nad-vl70to120.nad-bus-8': {
        '--vl-color': '#2862AE',
    },
    '.sld-vl70to120.sld-bus-9, .nad-vl70to120.nad-bus-9': {
        '--vl-color': '#B0D4FE',
    },
    '.sld-vl120to180, .nad-vl120to180': {
        '--vl-color': '#00AFAE',
    },
    '.sld-vl120to180.sld-bus-1, .nad-vl120to180.nad-bus-1': {
        '--vl-color': '#0A6365',
    },
    '.sld-vl120to180.sld-bus-2, .nad-vl120to180.nad-bus-2': {
        '--vl-color': '#79CED4',
    },
    '.sld-vl120to180.sld-bus-3, .nad-vl120to180.nad-bus-3': {
        '--vl-color': '#6B3A26',
    },
    '.sld-vl120to180.sld-bus-4, .nad-vl120to180.nad-bus-4': {
        '--vl-color': '#C94119',
    },
    '.sld-vl120to180.sld-bus-5, .nad-vl120to180.nad-bus-5': {
        '--vl-color': '#D69A88',
    },
    '.sld-vl120to180.sld-bus-6, .nad-vl120to180.nad-bus-6': {
        '--vl-color': '#7E3109',
    },
    '.sld-vl120to180.sld-bus-7, .nad-vl120to180.nad-bus-7': {
        '--vl-color': '#B78B58',
    },
    '.sld-vl120to180.sld-bus-8, .nad-vl120to180.nad-bus-8': {
        '--vl-color': '#E47400',
    },
    '.sld-vl120to180.sld-bus-9, .nad-vl120to180.nad-bus-9': {
        '--vl-color': '#FFC019',
    },
    '.sld-vl180to300, .nad-vl180to300': {
        '--vl-color': '#32B532',
    },
    '.sld-vl180to300.sld-bus-1, .nad-vl180to300.nad-bus-1': {
        '--vl-color': '#1E5D1F',
    },
    '.sld-vl180to300.sld-bus-2, .nad-vl180to300.nad-bus-2': {
        '--vl-color': '#A7B368',
    },
    '.sld-vl180to300.sld-bus-3, .nad-vl180to300.nad-bus-3': {
        '--vl-color': '#A30E32',
    },
    '.sld-vl180to300.sld-bus-4, .nad-vl180to300.nad-bus-4': {
        '--vl-color': '#FF8290',
    },
    '.sld-vl180to300.sld-bus-5, .nad-vl180to300.nad-bus-5': {
        '--vl-color': '#DAA8AD',
    },
    '.sld-vl180to300.sld-bus-6, .nad-vl180to300.nad-bus-6': {
        '--vl-color': '#C30D33',
    },
    '.sld-vl180to300.sld-bus-7, .nad-vl180to300.nad-bus-7': {
        '--vl-color': '#E7C6C8',
    },
    '.sld-vl180to300.sld-bus-8, .nad-vl180to300.nad-bus-8': {
        '--vl-color': '#FF8290',
    },
    '.sld-vl180to300.sld-bus-9, .nad-vl180to300.nad-bus-9': {
        '--vl-color': '#FFCCD0',
    },
    '.sld-vl300to500, .nad-vl300to500': {
        '--vl-color': '#FF0000',
    },
    '.sld-vl300to500.sld-bus-1, .nad-vl300to500.nad-bus-1': {
        '--vl-color': '#920A0A',
    },
    '.sld-vl300to500.sld-bus-2, .nad-vl300to500.nad-bus-2': {
        '--vl-color': '#FF9494',
    },
    '.sld-vl300to500.sld-bus-3, .nad-vl300to500.nad-bus-3': {
        '--vl-color': '#32B532',
    },
    '.sld-vl300to500.sld-bus-4, .nad-vl300to500.nad-bus-4': {
        '--vl-color': '#00FF50',
    },
    '.sld-vl300to500.sld-bus-5, .nad-vl300to500.nad-bus-5': {
        '--vl-color': '#A7B368',
    },
    '.sld-vl300to500.sld-bus-6, .nad-vl300to500.nad-bus-6': {
        '--vl-color': '#1A4D1B',
    },
    '.sld-vl300to500.sld-bus-7, .nad-vl300to500.nad-bus-7': {
        '--vl-color': '#C2CB92',
    },
    '.sld-vl300to500.sld-bus-8, .nad-vl300to500.nad-bus-8': {
        '--vl-color': '#218B21',
    },
    '.sld-vl300to500.sld-bus-9, .nad-vl300to500.nad-bus-9': {
        '--vl-color': '#58D058',
    },
};
