/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BaseVoltage, BaseVoltageConfig } from '@gridsuite/commons-ui';
import { getLocalStorageBaseVoltages } from 'redux/session-storage/local-storage';

export const getBaseVoltageInterval = (voltageValue: number): BaseVoltage | undefined => {
    const baseVoltages = getLocalStorageBaseVoltages();
    for (let interval of baseVoltages) {
        if (voltageValue >= interval.minValue && voltageValue < interval.maxValue) {
            return interval;
        }
    }
};

export const getBaseVoltageIntervalName = (voltageValue: number): string | undefined => {
    return getBaseVoltageInterval(voltageValue)?.name;
};

export const getBaseVoltagesConfig = (): BaseVoltageConfig[] => {
    const baseVoltages = getLocalStorageBaseVoltages();
    return baseVoltages.map(({ name, minValue, maxValue }) => ({ name, minValue, maxValue }));
};
