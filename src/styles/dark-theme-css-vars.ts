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
    '.nad-label-box': {
        backgroundColor: '#6c6c6c20',
    },
    '.nad-textnode-highlight': {
        backgroundColor: '#32373bd9', // same displayed color as #6c6c6c20 but with 0.85 opacity
    },
    '.sld-vl0to30, .nad-vl0to30, .sld-extern-cell:has(.sld-wire.sld-vl0to30) .sld-current': {
        '--vl-color': '#CCC93A',
    },
    '.sld-vl0to30.sld-bus-1, .nad-vl0to30.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-1) .sld-current':
        {
            '--vl-color': '#5E835C',
        },
    '.sld-vl0to30.sld-bus-2, .nad-vl0to30.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-2) .sld-current':
        {
            '--vl-color': '#B1B46C',
        },
    '.sld-vl0to30.sld-bus-3, .nad-vl0to30.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-3) .sld-current':
        {
            '--vl-color': '#A156AA',
        },
    '.sld-vl0to30.sld-bus-4, .nad-vl0to30.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-4) .sld-current':
        {
            '--vl-color': '#CB3DDD',
        },
    '.sld-vl0to30.sld-bus-5, .nad-vl0to30.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-5) .sld-current':
        {
            '--vl-color': '#AC8AC2',
        },
    '.sld-vl0to30.sld-bus-6, .nad-vl0to30.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-6) .sld-current':
        {
            '--vl-color': '#734097',
        },
    '.sld-vl0to30.sld-bus-7, .nad-vl0to30.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-7) .sld-current':
        {
            '--vl-color': '#BCADCC',
        },
    '.sld-vl0to30.sld-bus-8, .nad-vl0to30.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-8) .sld-current':
        {
            '--vl-color': '#A246E0',
        },
    '.sld-vl0to30.sld-bus-9, .nad-vl0to30.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl0to30.sld-bus-9) .sld-current':
        {
            '--vl-color': '#C38CEB',
        },
    '.sld-vl30to50, .nad-vl30to50, .sld-extern-cell:has(.sld-wire.sld-vl30to50) .sld-current': {
        '--vl-color': '#EA8E9B',
    },
    '.sld-vl30to50.sld-bus-1, .nad-vl30to50.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-1) .sld-current':
        {
            '--vl-color': '#A43857',
        },
    '.sld-vl30to50.sld-bus-2, .nad-vl30to50.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-2) .sld-current':
        {
            '--vl-color': '#CEAAB0',
        },
    '.sld-vl30to50.sld-bus-3, .nad-vl30to50.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-3) .sld-current':
        {
            '--vl-color': '#459C63',
        },
    '.sld-vl30to50.sld-bus-4, .nad-vl30to50.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-4) .sld-current':
        {
            '--vl-color': '#00E266',
        },
    '.sld-vl30to50.sld-bus-5, .nad-vl30to50.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-5) .sld-current':
        {
            '--vl-color': '#A7B368',
        },
    '.sld-vl30to50.sld-bus-6, .nad-vl30to50.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-6) .sld-current':
        {
            '--vl-color': '#3F7340',
        },
    '.sld-vl30to50.sld-bus-7, .nad-vl30to50.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-7) .sld-current':
        {
            '--vl-color': '#C2CB92',
        },
    '.sld-vl30to50.sld-bus-8, .nad-vl30to50.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-8) .sld-current':
        {
            '--vl-color': '#218B21',
        },
    '.sld-vl30to50.sld-bus-9, .nad-vl30to50.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl30to50.sld-bus-9) .sld-current':
        {
            '--vl-color': '#58D058',
        },
    '.sld-vl50to70, .nad-vl50to70, .sld-extern-cell:has(.sld-wire.sld-vl50to70) .sld-current': {
        '--vl-color': '#D47DFF',
    },
    '.sld-vl50to70.sld-bus-1, .nad-vl50to70.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-1) .sld-current':
        {
            '--vl-color': '#C230D2',
        },
    '.sld-vl50to70.sld-bus-2, .nad-vl50to70.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-2) .sld-current':
        {
            '--vl-color': '#AB94BF',
        },
    '.sld-vl50to70.sld-bus-3, .nad-vl50to70.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-3) .sld-current':
        {
            '--vl-color': '#1F7620',
        },
    '.sld-vl50to70.sld-bus-4, .nad-vl50to70.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-4) .sld-current':
        {
            '--vl-color': '#C5ED3B',
        },
    '.sld-vl50to70.sld-bus-5, .nad-vl50to70.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-5) .sld-current':
        {
            '--vl-color': '#A7B368',
        },
    '.sld-vl50to70.sld-bus-6, .nad-vl50to70.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-6) .sld-current':
        {
            '--vl-color': '#697046',
        },
    '.sld-vl50to70.sld-bus-7, .nad-vl50to70.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-7) .sld-current':
        {
            '--vl-color': '#E1E444',
        },
    '.sld-vl50to70.sld-bus-8, .nad-vl50to70.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-8) .sld-current':
        {
            '--vl-color': '#AAAE50',
        },
    '.sld-vl50to70.sld-bus-9, .nad-vl50to70.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl50to70.sld-bus-9) .sld-current':
        {
            '--vl-color': '#D4D486',
        },
    '.sld-vl70to120, .nad-vl70to120, .sld-extern-cell:has(.sld-wire.sld-vl70to120) .sld-current': {
        '--vl-color': '#FF6100',
    },
    '.sld-vl70to120.sld-bus-1, .nad-vl70to120.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-1) .sld-current':
        {
            '--vl-color': '#B27153',
        },
    '.sld-vl70to120.sld-bus-2, .nad-vl70to120.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-2) .sld-current':
        {
            '--vl-color': '#C6A68B',
        },
    '.sld-vl70to120.sld-bus-3, .nad-vl70to120.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-3) .sld-current':
        {
            '--vl-color': '#25699D',
        },
    '.sld-vl70to120.sld-bus-4, .nad-vl70to120.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-4) .sld-current':
        {
            '--vl-color': '#0057F9',
        },
    '.sld-vl70to120.sld-bus-5, .nad-vl70to120.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-5) .sld-current':
        {
            '--vl-color': '#74AFEA',
        },
    '.sld-vl70to120.sld-bus-6, .nad-vl70to120.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-6) .sld-current':
        {
            '--vl-color': '#44679C',
        },
    '.sld-vl70to120.sld-bus-7, .nad-vl70to120.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-7) .sld-current':
        {
            '--vl-color': '#458BE8',
        },
    '.sld-vl70to120.sld-bus-8, .nad-vl70to120.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-8) .sld-current':
        {
            '--vl-color': '#2862AE',
        },
    '.sld-vl70to120.sld-bus-9, .nad-vl70to120.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl70to120.sld-bus-9) .sld-current':
        {
            '--vl-color': '#B0D4FE',
        },
    '.sld-vl120to180, .nad-vl120to180, .sld-extern-cell:has(.sld-wire.sld-vl120to180) .sld-current': {
        '--vl-color': '#29AFB0',
    },
    '.sld-vl120to180.sld-bus-1, .nad-vl120to180.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-1) .sld-current':
        {
            '--vl-color': '#336B6F',
        },
    '.sld-vl120to180.sld-bus-2, .nad-vl120to180.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-2) .sld-current':
        {
            '--vl-color': '#84C6CC',
        },
    '.sld-vl120to180.sld-bus-3, .nad-vl120to180.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-3) .sld-current':
        {
            '--vl-color': '#BA133C',
        },
    '.sld-vl120to180.sld-bus-4, .nad-vl120to180.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-4) .sld-current':
        {
            '--vl-color': '#FF8290',
        },
    '.sld-vl120to180.sld-bus-5, .nad-vl120to180.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-5) .sld-current':
        {
            '--vl-color': '#DAA8AD',
        },
    '.sld-vl120to180.sld-bus-6, .nad-vl120to180.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-6) .sld-current':
        {
            '--vl-color': '#97353A',
        },
    '.sld-vl120to180.sld-bus-7, .nad-vl120to180.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-7) .sld-current':
        {
            '--vl-color': '#EABCBD',
        },
    '.sld-vl120to180.sld-bus-8, .nad-vl120to180.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-8) .sld-current':
        {
            '--vl-color': '#EA2E33',
        },
    '.sld-vl120to180.sld-bus-9, .nad-vl120to180.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl120to180.sld-bus-9) .sld-current':
        {
            '--vl-color': '#EA6E72',
        },
    '.sld-vl180to300, .nad-vl180to300, .sld-extern-cell:has(.sld-wire.sld-vl180to300) .sld-current': {
        '--vl-color': '#00FF50',
    },
    '.sld-vl180to300.sld-bus-1, .nad-vl180to300.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-1) .sld-current':
        {
            '--vl-color': '#42954B',
        },
    '.sld-vl180to300.sld-bus-2, .nad-vl180to300.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-2) .sld-current':
        {
            '--vl-color': '#A7B27E',
        },
    '.sld-vl180to300.sld-bus-3, .nad-vl180to300.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-3) .sld-current':
        {
            '--vl-color': '#F57F17',
        },
    '.sld-vl180to300.sld-bus-4, .nad-vl180to300.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-4) .sld-current':
        {
            '--vl-color': '#A3715C',
        },
    '.sld-vl180to300.sld-bus-5, .nad-vl180to300.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-5) .sld-current':
        {
            '--vl-color': '#DBAB9D',
        },
    '.sld-vl180to300.sld-bus-6, .nad-vl180to300.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-6) .sld-current':
        {
            '--vl-color': '#885239',
        },
    '.sld-vl180to300.sld-bus-7, .nad-vl180to300.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-7) .sld-current':
        {
            '--vl-color': '#B39572',
        },
    '.sld-vl180to300.sld-bus-8, .nad-vl180to300.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-8) .sld-current':
        {
            '--vl-color': '#C94119',
        },
    '.sld-vl180to300.sld-bus-9, .nad-vl180to300.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl180to300.sld-bus-9) .sld-current':
        {
            '--vl-color': '#EABC45',
        },
    '.sld-vl300to500, .nad-vl300to500, .sld-extern-cell:has(.sld-wire.sld-vl300to500) .sld-current': {
        '--vl-color': '#FF0007',
    },
    '.sld-vl300to500.sld-bus-1, .nad-vl300to500.nad-bus-1, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-1) .sld-current':
        {
            '--vl-color': '#DD6484',
        },
    '.sld-vl300to500.sld-bus-2, .nad-vl300to500.nad-bus-2, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-2) .sld-current':
        {
            '--vl-color': '#FFBCBE',
        },
    '.sld-vl300to500.sld-bus-3, .nad-vl300to500.nad-bus-3, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-3) .sld-current':
        {
            '--vl-color': '#25699D',
        },
    '.sld-vl300to500.sld-bus-4, .nad-vl300to500.nad-bus-4, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-4) .sld-current':
        {
            '--vl-color': '#0057F9',
        },
    '.sld-vl300to500.sld-bus-5, .nad-vl300to500.nad-bus-5, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-5) .sld-current':
        {
            '--vl-color': '#74AFEA',
        },
    '.sld-vl300to500.sld-bus-6, .nad-vl300to500.nad-bus-6, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-6) .sld-current':
        {
            '--vl-color': '#44679C',
        },
    '.sld-vl300to500.sld-bus-7, .nad-vl300to500.nad-bus-7, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-7) .sld-current':
        {
            '--vl-color': '#458BE8',
        },
    '.sld-vl300to500.sld-bus-8, .nad-vl300to500.nad-bus-8, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-8) .sld-current':
        {
            '--vl-color': '#2862AE',
        },
    '.sld-vl300to500.sld-bus-9, .nad-vl300to500.nad-bus-9, .sld-extern-cell:has(.sld-wire.sld-vl300to500.sld-bus-9) .sld-current':
        {
            '--vl-color': '#B0D4FE',
        },
};
