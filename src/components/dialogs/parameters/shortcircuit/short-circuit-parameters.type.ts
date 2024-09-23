/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { INITIAL_VOLTAGE } from '../../../utils/constants';
import { formatShortCircuitParameters } from './short-circuit-parameters-utils';

export interface ShortCircuitFieldsProps {
    resetAll: (predefinedParams: INITIAL_VOLTAGE) => void;
}

export interface VoltageTableProps {
    voltageProfileMode: INITIAL_VOLTAGE;
}
export interface VoltageRange {
    minimumNominalVoltage: number;
    maximumNominalVoltage: number;
}

export interface ShortCircuitParameters {
    withFeederResult: boolean;
    withLoads: boolean;
    withVSCConverterStations: boolean;
    withShuntCompensators: boolean;
    withNeutralPosition: boolean;
    initialVoltageProfileMode: INITIAL_VOLTAGE;
}
