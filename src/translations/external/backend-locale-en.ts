/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const backend_locale_en = {
    OpenLoadFlow: 'Open Load Flow',
    Hades2: 'Hades 2',
    DynaFlow: 'Dyna Flow',
    GridSuiteAndConvergence: 'GridSuite_And_Convergence',
    Convergence: 'Convergence',
    FlatDesign: 'Flat_Design',

    // Security analysis and Shortcircuit analysis results
    ACTIVE_POWER: 'Active power',
    APPARENT_POWER: 'Apparent power',
    CONVERGED: 'Converged',
    CURRENT: 'Current',
    FAILED: 'Failed',
    HIGH_SHORT_CIRCUIT_CURRENT: 'Isc max',
    HIGH_VOLTAGE: 'High voltage',
    LOW_SHORT_CIRCUIT_CURRENT: 'Isc min',
    LOW_VOLTAGE: 'Low voltage',
    MAX_ITERATION_REACHED: 'Maximum number of iterations reached',
    NO_CALCULATION: 'No calculation',
    ONE: 'Side 1',
    OTHER: 'Other',
    SINGLE_PHASE: 'Single-phase',
    THREE_PHASE: 'Three-phase',
    TWO: 'Side 2',

    // Voltage init results
    REACTIVE_SLACKS_OVER_THRESHOLD: `Reactive slack exceeds {threshold} MVar for at least one bus`,
    VOLTAGE_LEVEL_LIMITS_OUT_OF_NOMINAL_VOLTAGE_RANGE:
        'Acceptable voltage range for at least one voltage level seems to be inconsistent with nominal voltage',

    // State estimation results
    UNKNOWN: 'Unknown',
    TAUX_OBS: 'Observability rate',
    REDONDANCE_ACT: 'Active redundancy',
    REDONDANCE_REA: 'Reactive redundancy',
    INJ_PERDUES: 'Lost injections',
    TELEMESURES_INV: 'Invalidated measurements',
    TELEMESURES_CRIT: 'Critical measurements',
    ECARTS_HN: 'Out of bounds deviations',
    NB_ITER: 'Iterations number',
    TRANSITS_PERDUS: 'Lost flows',
};

export default backend_locale_en;
