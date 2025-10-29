/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export interface VoltageLevelInterval {
    name: string;
    vlValue: number;
    minValue: number;
    maxValue: number;
    label: string;
    color: number[];
}

export const BASE_VOLTAGES: VoltageLevelInterval[] = [
    { name: 'vl300to500', vlValue: 400, minValue: 300, maxValue: Infinity, label: '400 kV', color: [255, 0, 0] },
    { name: 'vl200to300', vlValue: 225, minValue: 200, maxValue: 300, label: '225 kV', color: [34, 139, 34] },
    { name: 'vl100to200', vlValue: 150, minValue: 100, maxValue: 200, label: '150 kV', color: [1, 175, 175] },
    { name: 'vl70to100', vlValue: 90, minValue: 70, maxValue: 100, label: '90 kV', color: [204, 85, 0] },
    { name: 'vl50to70', vlValue: 63, minValue: 50, maxValue: 70, label: '63 kV', color: [160, 32, 240] },
    { name: 'vl40to50', vlValue: 42, minValue: 40, maxValue: 50, label: '42 kV', color: [255, 130, 144] },
    { name: 'vl0to40', vlValue: 20, minValue: 0, maxValue: 40, label: 'HTA', color: [171, 175, 40] },
];

export const MAX_VOLTAGE = 500;

export const getNominalVoltageInterval = (voltageValue: number): VoltageLevelInterval | undefined => {
    for (let interval of BASE_VOLTAGES) {
        if (voltageValue >= interval.minValue && voltageValue < interval.maxValue) {
            return interval;
        }
    }
};

export const getNominalVoltageIntervalName = (voltageValue: number): string | undefined => {
    return getNominalVoltageInterval(voltageValue)?.name;
};
