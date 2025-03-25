/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const SENSITIVITY_IN_DELTA_MW = 'SensitivityInDeltaMW';
export const SENSITIVITY_IN_DELTA_A = 'SensitivityInDeltaA';
export const SENSITIVITY_AT_NODE = 'SensitivityAtNode';
export const COMPUTATION_RESULTS_LOGS = 'ComputationResultsLogs';

export type SensiKind = typeof SENSITIVITY_IN_DELTA_MW | typeof SENSITIVITY_IN_DELTA_A | typeof SENSITIVITY_AT_NODE;

export type SensiTab = SensiKind | typeof COMPUTATION_RESULTS_LOGS;
