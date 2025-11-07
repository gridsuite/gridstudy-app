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
