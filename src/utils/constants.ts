/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

type ThemeColors = Record<string, string>;
export interface VoltageLevelInterval {
    name: string;
    vlValue: number;
    minValue: number;
    maxValue: number;
    label: string;
    mapColor: string;
    darkThemeColors: ThemeColors;
    lightThemeColors: ThemeColors;
    profile: string;
}

export const BASE_VOLTAGES: VoltageLevelInterval[] = [
    {
        name: 'vl7',
        vlValue: 400,
        minValue: 300,
        maxValue: 500,
        label: '400 kV',
        profile: 'Default',
        mapColor: 'rgb(255, 0, 0)',
        lightThemeColors: {
            default: 'rgb(255, 0, 0)',
            'bus-1': 'rgb(146, 10, 10)',
            'bus-2': 'rgb(255, 148, 148)',
            'bus-3': 'rgb(37, 105, 157)',
            'bus-4': 'rgb(0, 87, 249)',
            'bus-5': 'rgb(116, 175, 234)',
            'bus-6': 'rgb(27, 52, 89)',
            'bus-7': 'rgb(69, 139, 232)',
            'bus-8': 'rgb(40, 98, 174)',
            'bus-9': 'rgb(176, 212, 254)',
        },
        darkThemeColors: {
            default: 'rgb(255, 0, 7)',
            'bus-1': 'rgb(221, 100, 132)',
            'bus-2': 'rgb(255, 188, 190)',
            'bus-3': 'rgb(37, 105, 157)',
            'bus-4': 'rgb(0, 87, 249)',
            'bus-5': 'rgb(116, 175, 234)',
            'bus-6': 'rgb(68, 103, 156)',
            'bus-7': 'rgb(69, 139, 232)',
            'bus-8': 'rgb(40, 98, 174)',
            'bus-9': 'rgb(176, 212, 254)',
        },
    },
    {
        name: 'vl6',
        vlValue: 225,
        minValue: 200,
        maxValue: 300,
        label: '225 kV',
        profile: 'Default',
        mapColor: 'rgb(34, 139, 34)',
        lightThemeColors: {
            default: 'rgb(50, 181, 50)',
            'bus-1': 'rgb(30, 93, 31)',
            'bus-2': 'rgb(167, 179, 104)',
            'bus-3': 'rgb(228, 116, 0)',
            'bus-4': 'rgb(107, 58, 38)',
            'bus-5': 'rgb(214, 154, 136)',
            'bus-6': 'rgb(126, 49, 9)',
            'bus-7': 'rgb(183, 139, 88)',
            'bus-8': 'rgb(201, 65, 25)',
            'bus-9': 'rgb(255, 192, 25)',
        },
        darkThemeColors: {
            default: 'rgb(0, 255, 80)',
            'bus-1': 'rgb(66, 149, 75)',
            'bus-2': 'rgb(167, 178, 126)',
            'bus-3': 'rgb(245, 127, 23)',
            'bus-4': 'rgb(163, 113, 92)',
            'bus-5': 'rgb(219, 171, 157)',
            'bus-6': 'rgb(136, 82, 57)',
            'bus-7': 'rgb(179, 149, 114)',
            'bus-8': 'rgb(201, 65, 25)',
            'bus-9': 'rgb(234, 188, 69)',
        },
    },
    {
        name: 'vl5',
        vlValue: 150,
        minValue: 100,
        maxValue: 200,
        label: '150 kV',
        profile: 'Default',
        mapColor: 'rgb(1, 175, 175)',
        lightThemeColors: {
            default: 'rgb(0, 175, 174)',
            'bus-1': 'rgb(10, 99, 101)',
            'bus-2': 'rgb(121, 206, 212)',
            'bus-3': 'rgb(163, 14, 50)',
            'bus-4': 'rgb(255, 130, 144)',
            'bus-5': 'rgb(218, 168, 173)',
            'bus-6': 'rgb(195, 13, 51)',
            'bus-7': 'rgb(227, 190, 192)',
            'bus-8': 'rgb(255, 130, 144)',
            'bus-9': 'rgb(255, 204, 208)',
        },
        darkThemeColors: {
            default: 'rgb(41, 175, 176)',
            'bus-1': 'rgb(51, 107, 111)',
            'bus-2': 'rgb(132, 198, 204)',
            'bus-3': 'rgb(186, 19, 60)',
            'bus-4': 'rgb(255, 130, 144)',
            'bus-5': 'rgb(218, 168, 173)',
            'bus-6': 'rgb(151, 53, 58)',
            'bus-7': 'rgb(234, 188, 189)',
            'bus-8': 'rgb(234, 46, 51)',
            'bus-9': 'rgb(234, 110, 114)',
        },
    },
    {
        name: 'vl4',
        vlValue: 90,
        minValue: 70,
        maxValue: 100,
        label: '90 kV',
        profile: 'Default',
        mapColor: 'rgb(204, 85, 0)',
        lightThemeColors: {
            default: 'rgb(255, 157, 0)',
            'bus-1': 'rgb(126, 49, 9)',
            'bus-2': 'rgb(204, 85, 0)',
            'bus-3': 'rgb(37, 105, 157)',
            'bus-4': 'rgb(0, 87, 249)',
            'bus-5': 'rgb(116, 175, 234)',
            'bus-6': 'rgb(27, 52, 89)',
            'bus-7': 'rgb(69, 139, 232)',
            'bus-8': 'rgb(40, 98, 174)',
            'bus-9': 'rgb(176, 212, 254)',
        },
        darkThemeColors: {
            default: 'rgb(255, 97, 0)',
            'bus-1': 'rgb(178, 113, 83)',
            'bus-2': 'rgb(198, 166, 139)',
            'bus-3': 'rgb(37, 105, 157)',
            'bus-4': 'rgb(0, 87, 249)',
            'bus-5': 'rgb(116, 175, 234)',
            'bus-6': 'rgb(68, 103, 156)',
            'bus-7': 'rgb(69, 139, 232)',
            'bus-8': 'rgb(40, 98, 174)',
            'bus-9': 'rgb(176, 212, 254)',
        },
    },
    {
        name: 'vl3',
        vlValue: 63,
        minValue: 50,
        maxValue: 70,
        label: '63 kV',
        profile: 'Default',
        mapColor: 'rgb(160, 32, 240)',
        lightThemeColors: {
            default: 'rgb(160, 32, 240)',
            'bus-1': 'rgb(98, 24, 139)',
            'bus-2': 'rgb(172, 138, 194)',
            'bus-3': 'rgb(31, 118, 32)',
            'bus-4': 'rgb(197, 237, 59)',
            'bus-5': 'rgb(167, 179, 104)',
            'bus-6': 'rgb(85, 89, 27)',
            'bus-7': 'rgb(229, 232, 69)',
            'bus-8': 'rgb(171, 174, 40)',
            'bus-9': 'rgb(218, 217, 113)',
        },
        darkThemeColors: {
            default: 'rgb(212, 125, 255)',
            'bus-1': 'rgb(194, 48, 210)',
            'bus-2': 'rgb(171, 148, 191)',
            'bus-3': 'rgb(31, 118, 32)',
            'bus-4': 'rgb(197, 237, 59)',
            'bus-5': 'rgb(167, 179, 104)',
            'bus-6': 'rgb(105, 112, 70)',
            'bus-7': 'rgb(225, 228, 68)',
            'bus-8': 'rgb(170, 174, 80)',
            'bus-9': 'rgb(212, 212, 134)',
        },
    },
    {
        name: 'vl2',
        vlValue: 42,
        minValue: 40,
        maxValue: 50,
        label: '42 kV',
        profile: 'Default',
        mapColor: 'rgb(255, 130, 144)',
        lightThemeColors: {
            default: 'rgb(255, 130, 144)',
            'bus-1': 'rgb(231, 23, 62)',
            'bus-2': 'rgb(218, 168, 173)',
            'bus-3': 'rgb(69, 156, 99)',
            'bus-4': 'rgb(0, 226, 102)',
            'bus-5': 'rgb(167, 179, 104)',
            'bus-6': 'rgb(26, 77, 27)',
            'bus-7': 'rgb(194, 203, 146)',
            'bus-8': 'rgb(33, 139, 33)',
            'bus-9': 'rgb(88, 208, 88)',
        },
        darkThemeColors: {
            default: 'rgb(234, 142, 155)',
            'bus-1': 'rgb(164, 56, 87)',
            'bus-2': 'rgb(206, 170, 176)',
            'bus-3': 'rgb(69, 156, 99)',
            'bus-4': 'rgb(0, 226, 102)',
            'bus-5': 'rgb(167, 179, 104)',
            'bus-6': 'rgb(63, 115, 64)',
            'bus-7': 'rgb(194, 203, 146)',
            'bus-8': 'rgb(33, 139, 33)',
            'bus-9': 'rgb(88, 208, 88)',
        },
    },
    {
        name: 'vl1',
        vlValue: 20,
        minValue: 0,
        maxValue: 40,
        label: 'HTA',
        profile: 'Default',
        mapColor: 'rgb(171, 175, 40)',
        lightThemeColors: {
            default: 'rgb(171, 174, 40)',
            'bus-1': 'rgb(105, 112, 27)',
            'bus-2': 'rgb(216, 210, 10)',
            'bus-3': 'rgb(161, 86, 170)',
            'bus-4': 'rgb(203, 61, 221)',
            'bus-5': 'rgb(166, 132, 188)',
            'bus-6': 'rgb(98, 24, 139)',
            'bus-7': 'rgb(136, 92, 168)',
            'bus-8': 'rgb(160, 32, 240)',
            'bus-9': 'rgb(204, 128, 255)',
        },
        darkThemeColors: {
            default: 'rgb(204, 201, 58)',
            'bus-1': 'rgb(94, 131, 92)',
            'bus-2': 'rgb(177, 180, 108)',
            'bus-3': 'rgb(161, 86, 170)',
            'bus-4': 'rgb(203, 61, 221)',
            'bus-5': 'rgb(172, 138, 194)',
            'bus-6': 'rgb(115, 64, 151)',
            'bus-7': 'rgb(188, 173, 204)',
            'bus-8': 'rgb(162, 70, 224)',
            'bus-9': 'rgb(195, 140, 235)',
        },
    },
];

export const MAX_VOLTAGE = 500;

export const getNominalVoltageIntervalByVoltageValue = (voltageValue: number): VoltageLevelInterval | undefined => {
    for (let interval of BASE_VOLTAGES) {
        if (voltageValue >= interval.minValue && voltageValue < interval.maxValue) {
            return interval;
        }
    }
};

export const getNominalVoltageIntervalByIntervalName = (intervalName: string): VoltageLevelInterval | undefined => {
    for (let interval of BASE_VOLTAGES) {
        if (interval.name === intervalName) {
            return interval;
        }
    }
};

export const getNominalVoltageIntervalNameByVoltageValue = (voltageValue: number): string | undefined => {
    return getNominalVoltageIntervalByVoltageValue(voltageValue)?.name;
};

export interface BaseVoltages {
    name: string;
    minValue: number;
    maxValue: number;
    profile: string;
}
export interface BaseVoltagesConfigInfos {
    baseVoltages: BaseVoltages[];
    defaultProfile: string;
}

export const getBaseVoltagesConfigInfos = (): BaseVoltagesConfigInfos => {
    return {
        baseVoltages: BASE_VOLTAGES.map((vl) => ({
            name: vl.name,
            minValue: vl.minValue,
            maxValue: vl.maxValue,
            profile: 'Default',
        })),
        defaultProfile: 'Default',
    };
};
