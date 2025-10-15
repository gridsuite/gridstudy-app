/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { BASE_VOLTAGES } from '../constants';

export const getNominalVoltageIntervalName = (voltageValue: number): string | undefined => {
    for (let interval of BASE_VOLTAGES) {
        if (voltageValue >= interval.minValue && voltageValue < interval.maxValue) {
            return interval.name;
        }
    }
    return;
};
