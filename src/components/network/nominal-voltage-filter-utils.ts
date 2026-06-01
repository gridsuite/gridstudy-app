/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const DEFAULT_MAP_MIN_SUBSTATION_NOMINAL_VOLTAGE = 200;

export const getDefaultFilteredNominalVoltages = (
    nominalVoltages: number[],
    minNominalVoltage = DEFAULT_MAP_MIN_SUBSTATION_NOMINAL_VOLTAGE
) => nominalVoltages.filter((nominalVoltage) => nominalVoltage > minNominalVoltage);
