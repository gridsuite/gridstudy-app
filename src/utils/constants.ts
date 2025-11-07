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
}

export const MAX_VOLTAGE = 500;

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
