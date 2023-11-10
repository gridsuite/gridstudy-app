/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TYPES } from '../../util/make-component-utils';

export const commonDefParams = {
    fNormTolAlg: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverFNormTolAlg',
    },
    initialAddTolAlg: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverInitialAddTolAlg',
    },
    scStepTolAlg: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverScStepTolAlg',
    },
    mxNewTStepAlg: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverMxNewTStepAlg',
    },
    msbsetAlg: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMsbsetAlg',
    },
    mxIterAlg: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMxIterAlg',
    },
    printFlAlg: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverPrintFlAlg',
    },
    fNormTolAlgJ: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverFNormTolAlgJ',
    },
    initialAddTolAlgJ: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverInitialAddTolAlgJ',
    },
    scStepTolAlgJ: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverScStepTolAlgJ',
    },
    mxNewTStepAlgJ: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverMxNewTStepAlgJ',
    },
    msbsetAlgJ: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMsbsetAlgJ',
    },
    mxIterAlgJ: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMxIterAlgJ',
    },
    printFlAlgJ: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverPrintFlAlgJ',
    },
    fNormTolAlgInit: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverFNormTolAlgInit',
    },
    initialAddTolAlgInit: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverInitialAddTolAlgInit',
    },
    scStepTolAlgInit: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverScStepTolAlgInit',
    },
    mxNewTStepAlgInit: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverMxNewTStepAlgInit',
    },
    msbsetAlgInit: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMsbsetAlgInit',
    },
    mxIterAlgInit: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMxIterAlgInit',
    },
    printFlAlgInit: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverPrintFlAlgInit',
    },
    maximumNumberSlowStepIncrease: {
        type: TYPES.integer,
        description: 'DynamicSimulationSolverMaximumNumberSlowStepIncrease',
    },
    minimalAcceptableStep: {
        type: TYPES.float,
        description: 'DynamicSimulationSolverMinimalAcceptableStep',
    },
};
