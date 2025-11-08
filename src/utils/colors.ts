/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BaseVoltageConfig } from '@gridsuite/commons-ui';

export const MAX_VOLTAGE = 500;

function parseRGB(stringRGB: string): number[] | undefined {
    return stringRGB
        .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        ?.slice(1)
        .map(Number);
}

export const getNominalVoltageIntervalByVoltageValue = (
    baseVoltages: BaseVoltageConfig[],
    voltageValue: number
): BaseVoltageConfig | undefined => {
    for (let interval of baseVoltages) {
        if (voltageValue >= interval.minValue && voltageValue < interval.maxValue) {
            return interval;
        }
    }
};

export const getNominalVoltageColor = (baseVoltages: BaseVoltageConfig[], voltageValue: number): number[] => {
    const color = getNominalVoltageIntervalByVoltageValue(baseVoltages, voltageValue)?.mapColor;
    return (color ? parseRGB(color) : [0, 0, 0]) ?? [0, 0, 0];
};

export const INVALID_LOADFLOW_OPACITY = 0.2;
