/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as yup from 'yup';
import { getFormSchema as getCommonSolverFormSchema } from './solver/common-solver-parameters';

export enum TimeDelay {
    START_TIME = 'startTime',
    STOP_TIME = 'stopTime',
}

export enum SimplifiedSolver {
    H_MIN = 'hMin',
    H_MAX = 'hMax',
    K_REDUCE_STEP = 'kReduceStep',
    MAX_NEWTON_TRY = 'maxNewtonTry',
    LINEAR_SOLVER_NAME = 'linearSolverName',
    F_NORM_TOL = 'fNormTol',
    INITIAL_ADD_TOL = 'initialAddTol',
    SC_STEP_TOL = 'scStepTol',
    MX_NEW_T_STEP = 'mxNewTStep',
    MSBSET = 'msbset',
    MX_ITER = 'mxIter',
    PRINT_FL = 'printFl',
    OPTIMIZE_ALGEBRAIC_RESIDUALS_EVALUATIONS = 'optimizeAlgebraicResidualsEvaluations',
    SKIP_NR_IF_INITIAL_GUESS_OK = 'skipNRIfInitialGuessOK',
    ENABLE_SILENT_Z = 'enableSilentZ',
    OPTIMIZE_RE_INIT_ALGEBRAIC_RESIDUALS_EVALUATIONS = 'optimizeReInitAlgebraicResidualsEvaluations',
    MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION = 'minimumModeChangeTypeForAlgebraicRestoration',
    MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION_INIT = 'minimumModeChangeTypeForAlgebraicRestorationInit',
}

export const getSimplifiedFormSchema = () => {
    return yup.object().shape({
        [SimplifiedSolver.H_MIN]: yup.number().required(),
        [SimplifiedSolver.H_MAX]: yup.number().required(),
        [SimplifiedSolver.K_REDUCE_STEP]: yup.number().required(),
        [SimplifiedSolver.MAX_NEWTON_TRY]: yup.number().integer().required(),
        [SimplifiedSolver.LINEAR_SOLVER_NAME]: yup.string().required(),
        [SimplifiedSolver.F_NORM_TOL]: yup.number().required(),
        [SimplifiedSolver.INITIAL_ADD_TOL]: yup.number().required(),
        [SimplifiedSolver.SC_STEP_TOL]: yup.number().required(),
        [SimplifiedSolver.MX_NEW_T_STEP]: yup.number().required(),
        [SimplifiedSolver.MSBSET]: yup.number().integer().required(),
        [SimplifiedSolver.MX_ITER]: yup.number().integer().required(),
        [SimplifiedSolver.PRINT_FL]: yup.number().integer().required(),
        [SimplifiedSolver.OPTIMIZE_ALGEBRAIC_RESIDUALS_EVALUATIONS]: yup.boolean().required(),
        [SimplifiedSolver.SKIP_NR_IF_INITIAL_GUESS_OK]: yup.boolean().required(),
        [SimplifiedSolver.ENABLE_SILENT_Z]: yup.boolean().required(),
        [SimplifiedSolver.OPTIMIZE_RE_INIT_ALGEBRAIC_RESIDUALS_EVALUATIONS]: yup.boolean().required(),
        [SimplifiedSolver.MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION]: yup.string().required(),
        [SimplifiedSolver.MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION_INIT]: yup.string().required(),
        ...getCommonSolverFormSchema(),
    });
};

export enum IdaSolver {
    ORDER = 'order',
    INIT_STEP = 'initStep',
    MIN_STEP = 'minStep',
    MAX_STEP = 'maxStep',
    ABS_ACCURACY = 'absAccuracy',
    REL_ACCURACY = 'relAccuracy',
}

export const getIdaFormSchema = () =>
    yup.object().shape({
        [IdaSolver.ORDER]: yup
            .number()
            .integer()
            .oneOf([1, 2], 'DynamicSimulationIDASolverOrderMustBeOneOfValues')
            .required(),
        [IdaSolver.INIT_STEP]: yup.number().required(),
        [IdaSolver.MIN_STEP]: yup.number().required(),
        [IdaSolver.MAX_STEP]: yup.number().required(),
        [IdaSolver.ABS_ACCURACY]: yup.number().required(),
        [IdaSolver.REL_ACCURACY]: yup.number().required(),
        ...getCommonSolverFormSchema(),
    });

export enum Solver {
    ID = 'solverId',
    SOLVERS = 'solvers',
}

export enum Curve {
    EQUIPMENT_ID = 'equipmentId',
    VARIABLE_ID = 'variableId',
    CURVES = 'curves',
}

export const MAPPING = 'mapping';

export const NETWORK = 'network';

export enum NetworkEnum {
    // Capacitor related
    CAPACITOR_NO_RECLOSING_DELAY = 'capacitorNoReclosingDelay',

    // Line related
    DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION = 'danglingLineCurrentLimitMaxTimeOperation',
    LINE_CURRENT_LIMIT_MAX_TIME_OPERATION = 'lineCurrentLimitMaxTimeOperation',

    // Load related
    LOAD_TP = 'loadTp',
    LOAD_TQ = 'loadTq',
    LOAD_ALPHA = 'loadAlpha',
    LOAD_ALPHA_LONG = 'loadAlphaLong',
    LOAD_BETA = 'loadBeta',
    LOAD_BETA_LONG = 'loadBetaLong',
    LOAD_IS_CONTROLLABLE = 'loadIsControllable',
    LOAD_IS_RESTORATIVE = 'loadIsRestorative',
    LOAD_Z_PMAX = 'loadZPMax',
    LOAD_Z_QMAX = 'loadZQMax',

    // Reactance related
    REACTANCE_NO_RECLOSING_DELAY = 'reactanceNoReclosingDelay',

    // Transformer related
    TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION = 'transformerCurrentLimitMaxTimeOperation',
    TRANSFORMER_T1_ST_HT = 'transformerT1StHT',
    TRANSFORMER_T1_ST_THT = 'transformerT1StTHT',
    TRANSFORMER_T_NEXT_HT = 'transformerTNextHT',
    TRANSFORMER_T_NEXT_THT = 'transformerTNextTHT',
    TRANSFORMER_TO_LV = 'transformerTolV',
}
