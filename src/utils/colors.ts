/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BaseVoltage, LIGHT_THEME } from '@gridsuite/commons-ui';

export const INVALID_COMPUTATION_OPACITY = 0.2;

function parseRGB(stringRGB: string): number[] | undefined {
    return stringRGB
        .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        ?.slice(1)
        .map(Number);
}

export const getBaseVoltageNetworkMapColor = (baseVoltage: BaseVoltage | undefined): number[] => {
    const color = baseVoltage?.networkMapColor;
    console.info('COLOR = ' + color);
    return (color ? parseRGB(color) : [0, 0, 0]) ?? [0, 0, 0];
};

export const getBaseVoltagesCssVars = (
    theme: string,
    baseVoltages: BaseVoltage[]
): Record<string, Record<string, string>> => {
    const css: Record<string, Record<string, string>> = {};
    if (!baseVoltages) {
        return css;
    }
    for (const interval of baseVoltages) {
        const themeColors =
            theme === LIGHT_THEME
                ? interval.sldAndNadColors.lightThemeColors
                : interval.sldAndNadColors.darkThemeColors;

        const vlStyleClassName = `.sld-${interval.name}, .nad-${interval.name}`;
        css[vlStyleClassName] = { '--vl-color': themeColors.default };

        for (let i = 1; i < Object.keys(themeColors).length; i++) {
            const busColor = themeColors[`bus-${i}`];
            if (!busColor) continue;
            const busStyleClassName = `.sld-${interval.name}.sld-bus-${i}, .nad-${interval.name}.nad-bus-${i}`;
            css[busStyleClassName] = { '--vl-color': busColor };
        }
    }
    return css;
};
