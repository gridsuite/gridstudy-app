/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export enum BranchSide {
    ONE = 'ONE',
    TWO = 'TWO',
}

export enum STATUS {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
}
export enum INITIAL_VOLTAGE {
    NOMINAL = 'NOMINAL',
    CEI909 = 'CEI909',
    CONFIGURED = 'CONFIGURED',
}
export enum PREDEFINED_PARAMETERS {
    ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP = 'ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP',
    ICC_MAX_WITH_CEI909 = 'ICC_MAX_WITH_CEI909',
    ICC_MIN_WITH_NOMINAL_VOLTAGE_MAP = 'ICC_MIN_WITH_NOMINAL_VOLTAGE_MAP',
}
export const CGMES = 'CGMES';
