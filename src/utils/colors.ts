/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DARK_THEME, LIGHT_THEME } from '@gridsuite/commons-ui';
import {
    BASE_VOLTAGES,
    getNominalVoltageIntervalByIntervalName,
    getNominalVoltageIntervalByVoltageValue,
} from './constants';

function parseRGB(stringRGB: string): number[] | undefined {
    return stringRGB
        .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        ?.slice(1)
        .map(Number);
}

export const getColor = (
    intervalName: string,
    busNumber: number,
    theme: string = DARK_THEME // use theme
): string | undefined => {
    const voltageInterval = getNominalVoltageIntervalByIntervalName(intervalName);
    const bus = busNumber === 0 ? 'default' : 'bus-' + String(busNumber);
    const color =
        theme === LIGHT_THEME ? voltageInterval?.lightThemeColors[bus] : voltageInterval?.darkThemeColors[bus];
    return color;
};

export const getNominalVoltageColor = (voltageValue: number): number[] | undefined => {
    const color = getNominalVoltageIntervalByVoltageValue(voltageValue)?.mapColor;
    return color ? parseRGB(color) : undefined;
};

export const INVALID_LOADFLOW_OPACITY = 0.2;

export const cssColors = (theme: string) => {
    const css: Record<string, any> = {};

    for (const interval of BASE_VOLTAGES) {
        const className = `.sld-${interval.name}, .nad-${interval.name}`;

        const themeColors = theme === DARK_THEME ? interval.darkThemeColors : interval.lightThemeColors;
        css[className] = { '--vl-color': themeColors.default };

        for (let i = 1; i <= 9; i++) {
            const key = `bus-${i}`;
            const color = themeColors[key];
            if (!color) continue;

            const selector = `.sld-${interval.name}.sld-${key}, .nad-${interval.name}.nad-${key}`;
            css[selector] = { '--vl-color': color };
        }
    }
    return css;
};
