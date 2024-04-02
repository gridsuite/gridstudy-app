/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const backend_locale_fr = {
    OpenLoadFlow: 'Open Load Flow',
    Hades2: 'Hades 2',
    DynaFlow: 'Dyna Flow',
    GridSuiteAndConvergence: 'GridSuite_And_Convergence',
    Convergence: 'Convergence',
    FlatDesign: 'Flat_Design',

    // Security analysis and Shortcircuit analysis results
    ACTIVE_POWER: 'Puissance active',
    APPARENT_POWER: 'Puissance apparente',
    CONVERGED: 'Convergence',
    CURRENT: 'Intensité',
    FAILED: 'Echec',
    HIGH_SHORT_CIRCUIT_CURRENT: 'Icc max',
    HIGH_VOLTAGE: 'Tension haute',
    LOW_SHORT_CIRCUIT_CURRENT: 'Icc min',
    LOW_VOLTAGE: 'Tension basse',
    MAX_ITERATION_REACHED: "Nombre maximum d'itérations atteint",
    NO_CALCULATION: 'Pas de calcul',
    ONE: 'Côté 1',
    OTHER: 'Autre',
    SINGLE_PHASE: 'Monophasé',
    THREE_PHASE: 'Triphasé',
    TWO: 'Côté 2',

    // Voltage init results
    REACTIVE_SLACKS_OVER_THRESHOLD: `L'investissement réactif pour au moins un noeud électrique dépasse {threshold} MVar`,
};

export default backend_locale_fr;
