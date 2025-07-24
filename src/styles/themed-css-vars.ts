/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';

export const themedCssVars = (theme: Theme) => {
    const isDarkMode = theme.palette.mode === 'dark';
    return {
        '.sld-vl0to30, .nad-vl0to30-line, .sld-vl0to30-0, .nad-vl0to30-0': {
            '--vl-color': isDarkMode ? '#AAAE50' : '#ABAE28',
        },
        '.sld-vl0to30-1, .nad-vl0to30-1': {
            '--vl-color': isDarkMode ? '#5F6646' : '#69701B',
        },
        '.sld-vl0to30-2, .nad-vl0to30-2': {
            '--vl-color': isDarkMode ? '#CCC93A' : '#D8D20A',
        },
        '.sld-vl0to30-3, .nad-vl0to30-3': {
            '--vl-color': isDarkMode ? '#A156AA' : '#A156AA',
        },
        '.sld-vl0to30-4, .nad-vl0to30-4': {
            '--vl-color': isDarkMode ? '#CB3DDD' : '#CB3DDD',
        },
        '.sld-vl0to30-5, .nad-vl0to30-5': {
            '--vl-color': isDarkMode ? '#AC8AC2' : '#A684BC',
        },
        '.sld-vl0to30-6, .nad-vl0to30-6': {
            '--vl-color': isDarkMode ? '#734097' : '#62188B',
        },
        '.sld-vl0to30-7, .nad-vl0to30-7': {
            '--vl-color': isDarkMode ? '#BCADCC' : '#885CA8',
        },
        '.sld-vl0to30-8, .nad-vl0to30-8': {
            '--vl-color': isDarkMode ? '#A246E0' : '#A020F0',
        },
        '.sld-vl0to30-9, .nad-vl0to30-9': {
            '--vl-color': isDarkMode ? '#C38CEB' : '#CC80FF',
        },
        '.sld-vl30to50, .nad-vl30to50-line, .sld-vl30to50-0, .nad-vl30to50-0': {
            '--vl-color': isDarkMode ? '#EA8E9B' : '#FF8290',
        },
        '.sld-vl30to50-1, .nad-vl30to50-1': {
            '--vl-color': isDarkMode ? '#A43857' : '#E7173E',
        },
        '.sld-vl30to50-2, .nad-vl30to50-2': {
            '--vl-color': isDarkMode ? '#CEAAB0' : '#DAA8AD',
        },
        '.sld-vl30to50-3, .nad-vl30to50-3': {
            '--vl-color': isDarkMode ? '#459C63' : '#459C63',
        },
        '.sld-vl30to50-4, .nad-vl30to50-4': {
            '--vl-color': isDarkMode ? '#00E266' : '#00E266',
        },
        '.sld-vl30to50-5, .nad-vl30to50-5': {
            '--vl-color': isDarkMode ? '#A7B368' : '#A7B368',
        },
        '.sld-vl30to50-6, .nad-vl30to50-6': {
            '--vl-color': isDarkMode ? '#3F7340' : '#1A4D1B',
        },
        '.sld-vl30to50-7, .nad-vl30to50-7': {
            '--vl-color': isDarkMode ? '#C2CB92' : '#C2CB92',
        },
        '.sld-vl30to50-8, .nad-vl30to50-8': {
            '--vl-color': isDarkMode ? '#218B21' : '#218B21',
        },
        '.sld-vl30to50-9, .nad-vl30to50-9': {
            '--vl-color': isDarkMode ? '#58D058' : '#58D058',
        },
        'sld-vl50to70, .nad-vl50to70-line, .sld-vl50to70-0, .nad-vl50to70-0': {
            '--vl-color': isDarkMode ? '#A246E0' : '#A020F0',
        },
        '.sld-vl50to70-1, .nad-vl50to70-1': {
            '--vl-color': isDarkMode ? '#895AAB' : '#62188B',
        },
        '.sld-vl50to70-2, .nad-vl50to70-2': {
            '--vl-color': isDarkMode ? '#AB94BF' : '#AC8AC2',
        },
        '.sld-vl50to70-3, .nad-vl50to70-3': {
            '--vl-color': isDarkMode ? '#1F7620' : '#ABCBAB',
        },
        '.sld-vl50to70-4, .nad-vl50to70-4': {
            '--vl-color': isDarkMode ? '#C5ED3B' : '#C5ED3B',
        },
        '.sld-vl50to70-5, .nad-vl50to70-5': {
            '--vl-color': isDarkMode ? '#A7B368' : '#A7B368',
        },
        '.sld-vl50to70-6, .nad-vl50to70-6': {
            '--vl-color': isDarkMode ? '#697046' : '#55591B',
        },
        '.sld-vl50to70-7, .nad-vl50to70-7': {
            '--vl-color': isDarkMode ? '#E1E444' : '#E5E844',
        },
        '.sld-vl50to70-8, .nad-vl50to70-8': {
            '--vl-color': isDarkMode ? '#AAAE50' : '#ABAE28',
        },
        '.sld-vl50to70-9, .nad-vl50to70-9': {
            '--vl-color': isDarkMode ? '#D4D486' : '#DAD970',
        },
        '.sld-vl70to120, .nad-vl70to120-line, .sld-vl70to120-0, .nad-vl70to120-0': {
            '--vl-color': isDarkMode ? '#C36D33' : '#FF9D00',
        },
        '.sld-vl70to120-1, .nad-vl70to120-1': {
            '--vl-color': isDarkMode ? '#885239' : '#7E3109',
        },
        '.sld-vl70to120-2, .nad-vl70to120-2': {
            '--vl-color': isDarkMode ? '#A88668' : '#CC5500',
        },
        '.sld-vl70to120-3, .nad-vl70to120-3': {
            '--vl-color': isDarkMode ? '#25699D' : '#25699D',
        },
        '.sld-vl70to120-4, .nad-vl70to120-4': {
            '--vl-color': isDarkMode ? '#0057F9' : '#0057F9',
        },
        '.sld-vl70to120-5, .nad-vl70to120-5': {
            '--vl-color': isDarkMode ? '#74AFEA' : '#74AFEA',
        },
        '.sld-vl70to120-6, .nad-vl70to120-6': {
            '--vl-color': isDarkMode ? '#44679C' : '#1B3459',
        },
        '.sld-vl70to120-7, .nad-vl70to120-7': {
            '--vl-color': isDarkMode ? '#448BE8' : '#448BE8',
        },
        '.sld-vl70to120-8, .nad-vl70to120-8': {
            '--vl-color': isDarkMode ? '#2862AE' : '#2862AE',
        },
        '.sld-vl70to120-9, .nad-vl70to120-9': {
            '--vl-color': isDarkMode ? '#B0D4FE' : '#B0D4FE',
        },
        '.sld-vl120to180, .nad-vl120to180-line, .sld-vl120to180-0, .nad-vl120to180-0': {
            '--vl-color': isDarkMode ? '#29AFB0' : '#00AFAE',
        },
        '.sld-vl120to180-1, .nad-vl120to180-1': {
            '--vl-color': isDarkMode ? '#336B6F' : '#0A6365',
        },
        '.sld-vl120to180-2, .nad-vl120to180-2': {
            '--vl-color': isDarkMode ? '#84C6CC' : '#79CED4',
        },
        '.sld-vl120to180-3, .nad-vl120to180-3': {
            '--vl-color': isDarkMode ? '#97593F' : '#6B3A26',
        },
        '.sld-vl120to180-4, .nad-vl120to180-4': {
            '--vl-color': isDarkMode ? '#C94119' : '#C94119',
        },
        '.sld-vl120to180-5, .nad-vl120to180-5': {
            '--vl-color': isDarkMode ? '#D69A88' : '#D69A88',
        },
        '.sld-vl120to180-6, .nad-vl120to180-6': {
            '--vl-color': isDarkMode ? '#885239' : '#7E3109',
        },
        '.sld-vl120to180-7, .nad-vl120to180-7': {
            '--vl-color': isDarkMode ? '#B39572' : '#B78B58',
        },
        '.sld-vl120to180-8, .nad-vl120to180-8': {
            '--vl-color': isDarkMode ? '#D58433' : '#E47400',
        },
        '.sld-vl120to180-9, .nad-vl120to180-9': {
            '--vl-color': isDarkMode ? '#EABC45' : '#FFC019',
        },
        '.sld-vl180to300, .nad-vl180to300-line, .sld-vl180to300-0, .nad-vl180to300-0': {
            '--vl-color': isDarkMode ? '#42954B' : '#32B532',
        },
        '.sld-vl180to300-1, .nad-vl180to300-1': {
            '--vl-color': isDarkMode ? '#3D6746' : '#1E5D1F',
        },
        '.sld-vl180to300-2, .nad-vl180to300-2': {
            '--vl-color': isDarkMode ? '#A7B27E' : '#A7B368',
        },
        '.sld-vl180to300-3, .nad-vl180to300-3': {
            '--vl-color': isDarkMode ? '#BA133C' : '#A30E32',
        },
        '.sld-vl180to300-4, .nad-vl180to300-4': {
            '--vl-color': isDarkMode ? '#FF8290' : '#FF8290',
        },
        '.sld-vl180to300-5, .nad-vl180to300-5': {
            '--vl-color': isDarkMode ? '#DAA8AD' : '#DAA8AD',
        },
        '.sld-vl180to300-6, .nad-vl180to300-6': {
            '--vl-color': isDarkMode ? '#97353A' : '#C30D33',
        },
        '.sld-vl180to300-7, .nad-vl180to300-7': {
            '--vl-color': isDarkMode ? '#EABCBD' : '#E7C6C8',
        },
        '.sld-vl180to300-8, .nad-vl180to300-8': {
            '--vl-color': isDarkMode ? '#EA2E33' : '#FF8290',
        },
        '.sld-vl180to300-9, .nad-vl180to300-9': {
            '--vl-color': isDarkMode ? '#EA6E72' : '#FFCCD0',
        },
        '.sld-vl300to500, .nad-vl300to500-line, .sld-vl300to500-0, .nad-vl300to500-0': {
            '--vl-color': isDarkMode ? '#EA2E33' : '#FF0000',
        },
        '.sld-vl300to500-1, .nad-vl300to500-1': {
            '--vl-color': isDarkMode ? '#97353A' : '#920A0A',
        },
        '.sld-vl300to500-2, .nad-vl300to500-2': {
            '--vl-color': isDarkMode ? '#EA9B9E' : '#FF9494',
        },
        '.sld-vl300to500-3, .nad-vl300to500-3': {
            '--vl-color': isDarkMode ? '#32B532' : '#32B532',
        },
        '.sld-vl300to500-4, .nad-vl300to500-4': {
            '--vl-color': isDarkMode ? '#00FF50' : '#00FF50',
        },
        '.sld-vl300to500-5, .nad-vl300to500-5': {
            '--vl-color': isDarkMode ? '#A7B368' : '#A7B368',
        },
        '.sld-vl300to500-6, .nad-vl300to500-6': {
            '--vl-color': isDarkMode ? '#3D6746' : '#1A4D1B',
        },
        '.sld-vl300to500-7, .nad-vl300to500-7': {
            '--vl-color': isDarkMode ? '#BCC49C' : '#C2CB92',
        },
        '.sld-vl300to500-8, .nad-vl300to500-8': {
            '--vl-color': isDarkMode ? '#42954B' : '#218B21',
        },
        '.sld-vl300to500-9, .nad-vl300to500-9': {
            '--vl-color': isDarkMode ? '#6BC772' : '#58D058',
        },
    };
};
