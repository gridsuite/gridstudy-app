/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BaseVoltage, LIGHT_THEME } from '@gridsuite/commons-ui';

export const INVALID_COMPUTATION_OPACITY = 0.5;

/**
 * Parse an `rgb(r, g, b)` string into a numeric color tuple.
 *
 * @param stringRGB - RGB string such as `rgb(10, 20, 30)`
 * @returns tuple [r, g, b] or `undefined` when parsing fails.
 */
function parseRGB(stringRGB: string): [number, number, number] | undefined {
    const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    const match = rgbRegex.exec(stringRGB);
    return match?.slice(1).map(Number) as [number, number, number] | undefined;
}

/**
 * Return the network map color as an RGB tuple for a base voltage.
 * Defaults to black when no valid color is available.
 *
 * @param baseVoltage - optional base voltage object from commons-ui
 * @returns color in [r, g, b] format
 */
export const getBaseVoltageNetworkMapColor = (baseVoltage: BaseVoltage | undefined): [number, number, number] => {
    const color = baseVoltage?.networkMapColor;
    return (color ? parseRGB(color) : [0, 0, 0]) ?? [0, 0, 0];
};

/**
 * Retrieve SLD/NAD theme color mapping for a base voltage depending on current theme.
 *
 * @param baseVoltage - base voltage object containing sldAndNadColors
 * @param theme - current theme identifier (e.g. LIGHT_THEME or dark mode string)
 * @returns color object for the selected theme
 */
export const getBaseVoltageSldAndNadThemeColors = (baseVoltage: BaseVoltage, theme: string) => {
    return theme === LIGHT_THEME
        ? baseVoltage.sldAndNadColors.lightThemeColors
        : baseVoltage.sldAndNadColors.darkThemeColors;
};

/**
 * Extract the numeric level from a voltage level name (e.g. 'voltage-level-6' → 6)
 */
const getVoltageLevel = (name: string): number => Number.parseInt(name.split('-').pop() ?? '0', 10);

export const getBaseVoltagesCssVars = (
    theme: string,
    baseVoltages: BaseVoltage[]
): Record<string, Record<string, string>> => {
    const css: Record<string, Record<string, string>> = {};
    if (!baseVoltages) {
        return css;
    }
    for (const interval of baseVoltages) {
        const themeColors = getBaseVoltageSldAndNadThemeColors(interval, theme);

        const vlStyleClassName = `.sld-${interval.name}, .nad-${interval.name}`;
        css[vlStyleClassName] = { '--vl-color': themeColors.default };

        const higherLevels = baseVoltages
            .filter((v) => getVoltageLevel(v.name) > getVoltageLevel(interval.name))
            .map((v) => `.nad-${v.name}.nad-winding`)
            .join(', ');

        const groupWithPstSelector = higherLevels
            ? `g:has(.nad-${interval.name}.nad-winding):not(:has(${higherLevels}))`
            : `g:has(.nad-${interval.name}.nad-winding)`;

        css[groupWithPstSelector] = { '--vl-color': themeColors.default };

        for (let i = 1; i < Object.keys(themeColors).length; i++) {
            const busColor = themeColors[`bus-${i}`];
            if (!busColor) continue;
            const busStyleClassName = `.sld-${interval.name}.sld-bus-${i}, .nad-${interval.name}.nad-bus-${i}`;
            css[busStyleClassName] = { '--vl-color': busColor };
        }
    }
    return css;
};
