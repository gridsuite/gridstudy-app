/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { INITIAL_VOLTAGE } from '../../../utils/constants';

export interface ShortCircuitFieldsProps {
    resetAll: (predefinedParams: INITIAL_VOLTAGE) => void;
    voltageRanges: VoltageRanges;
}

export interface VoltageTableProps {
    voltageProfileMode: INITIAL_VOLTAGE;
    values: VoltageRanges;
}
export interface Pair {
    first: number;
    second: number;
}
export interface VoltageRanges {
    CEI909: Pair[];
    NOMINAL: Pair[];
}
