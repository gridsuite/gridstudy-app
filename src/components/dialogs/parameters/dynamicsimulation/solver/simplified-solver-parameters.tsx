/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponents, TYPES } from '../../util/make-component-utils';
import { SimplifiedSolver } from '../dynamic-simulation-utils';
import { commonDefParams } from './common-solver-parameters';

const defParams = {
    [SimplifiedSolver.H_MIN]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverHMin',
    },
    [SimplifiedSolver.H_MAX]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverHMax',
    },
    [SimplifiedSolver.K_REDUCE_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverKReduceStep',
    },
    [SimplifiedSolver.MAX_NEWTON_TRY]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverMaxNewtonTry',
    },
    [SimplifiedSolver.LINEAR_SOLVER_NAME]: {
        type: TYPES.STRING,
        label: 'DynamicSimulationSimplifiedSolverLinearSolverName',
    },
    [SimplifiedSolver.F_NORM_TOL]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverFNormTol',
    },
    [SimplifiedSolver.INITIAL_ADD_TOL]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverInitialAddTol',
    },
    [SimplifiedSolver.SC_STEP_TOL]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverScStepTol',
    },
    [SimplifiedSolver.MX_NEW_T_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverMxNewTStep',
    },
    [SimplifiedSolver.MSBSET]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverMsbset',
    },
    [SimplifiedSolver.MX_ITER]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverMxIter',
    },
    [SimplifiedSolver.PRINT_FL]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverPrintFl',
    },
    [SimplifiedSolver.OPTIMIZE_ALGEBRAIC_RESIDUALS_EVALUATIONS]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverOptimizeAlgebraicResidualsEvaluations',
    },
    [SimplifiedSolver.SKIP_NR_IF_INITIAL_GUESS_OK]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverSkipNRIfInitialGuessOK',
    },
    [SimplifiedSolver.ENABLE_SILENT_Z]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverEnableSilentZ',
    },
    [SimplifiedSolver.OPTIMIZE_RE_INIT_ALGEBRAIC_RESIDUALS_EVALUATIONS]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverOptimizeReInitAlgebraicResidualsEvaluations',
    },
    [SimplifiedSolver.MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION]: {
        type: TYPES.STRING,
        label: 'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestoration',
    },
    [SimplifiedSolver.MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION_INIT]: {
        type: TYPES.STRING,
        label: 'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestorationInit',
    },
    ...commonDefParams,
};

const SimplifiedSolverParameters = ({ path }: { path: string }) => {
    return <>{makeComponents(defParams, path)}</>;
};

export default SimplifiedSolverParameters;
