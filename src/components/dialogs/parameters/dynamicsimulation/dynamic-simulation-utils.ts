/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { SolverTypeInfos } from 'services/study/dynamic-simulation.type';
import { getFormSchema as getCommonSolverFormSchema } from './solver/common-solver-parameters';

export enum TimeDelay {
    START_TIME = 'startTime',
    STOP_TIME = 'stopTime',
}

export const timeDelayFormSchema = yup.object().shape({
    [TimeDelay.START_TIME]: yup.number().required(),
    [TimeDelay.STOP_TIME]: yup
        .number()
        .required()
        .when([TimeDelay.START_TIME], ([startTime], schema) => {
            if (startTime) {
                return schema.min(startTime, 'DynamicSimulationStopTimeMustBeGreaterThanOrEqualToStartTime');
            }
            return schema;
        }),
});

export const timeDelayEmptyFormData = {
    [TimeDelay.START_TIME]: 0,
    [TimeDelay.STOP_TIME]: 0,
};

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

export const solverFormSchema = yup.object().shape({
    [Solver.ID]: yup.string().required(),
    [Solver.SOLVERS]: yup.array().when([Solver.ID], ([solverId], schema) =>
        schema.of(
            yup.lazy((item) => {
                const { id, type } = item;

                // ignore validation if not current selected solver
                if (solverId !== id) {
                    return yup.object().default(undefined);
                }

                // chose the right schema for each type of solver
                if (type === SolverTypeInfos.IDA) {
                    return getIdaFormSchema();
                } else {
                    return getSimplifiedFormSchema();
                }
            })
        )
    ),
});

export const solverEmptyFormData = {
    [Solver.ID]: '',
    [Solver.SOLVERS]: [],
};

export enum Curve {
    EQUIPMENT_ID = 'equipmentId',
    VARIABLE_ID = 'variableId',
    CURVES = 'curves',
}

export const curveFormSchema = yup.object().shape({
    [Curve.CURVES]: yup
        .array()
        .of(
            yup.object().shape({
                [Curve.EQUIPMENT_ID]: yup.string().required(),
                [Curve.VARIABLE_ID]: yup.string().required(),
            })
        )
        .nullable(),
});

export const curveEmptyFormData = {
    [Curve.CURVES]: [],
};

export const MAPPING = 'mapping';

export const mappingFormSchema = yup.object().shape({
    [MAPPING]: yup.string().required(),
});

export const mappingEmptyFormData = {
    [MAPPING]: '',
};

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

export const networkFormSchema = yup.object().shape({
    [NetworkEnum.CAPACITOR_NO_RECLOSING_DELAY]: yup.number().required(),
    [NetworkEnum.DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
    [NetworkEnum.LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
    [NetworkEnum.LOAD_TP]: yup.number().required(),
    [NetworkEnum.LOAD_TQ]: yup.number().required(),
    [NetworkEnum.LOAD_ALPHA]: yup.number().required(),
    [NetworkEnum.LOAD_ALPHA_LONG]: yup.number().required(),
    [NetworkEnum.LOAD_BETA]: yup.number().required(),
    [NetworkEnum.LOAD_BETA_LONG]: yup.number().required(),
    [NetworkEnum.LOAD_IS_CONTROLLABLE]: yup.boolean(),
    [NetworkEnum.LOAD_IS_RESTORATIVE]: yup.boolean(),
    [NetworkEnum.LOAD_Z_PMAX]: yup.number().required(),
    [NetworkEnum.LOAD_Z_QMAX]: yup.number().required(),
    [NetworkEnum.REACTANCE_NO_RECLOSING_DELAY]: yup.number().required(),
    [NetworkEnum.TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: yup.number().required(),
    [NetworkEnum.TRANSFORMER_T1_ST_HT]: yup.number().required(),
    [NetworkEnum.TRANSFORMER_T1_ST_THT]: yup.number().required(),
    [NetworkEnum.TRANSFORMER_T_NEXT_HT]: yup.number().required(),
    [NetworkEnum.TRANSFORMER_T_NEXT_THT]: yup.number().required(),
    [NetworkEnum.TRANSFORMER_TO_LV]: yup.number().required(),
});

export const networkEmptyFormData = {
    [NetworkEnum.CAPACITOR_NO_RECLOSING_DELAY]: 0,
    [NetworkEnum.DANGLING_LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: 0,
    [NetworkEnum.LINE_CURRENT_LIMIT_MAX_TIME_OPERATION]: 0,
    [NetworkEnum.LOAD_TP]: 0,
    [NetworkEnum.LOAD_TQ]: 0,
    [NetworkEnum.LOAD_ALPHA]: 0,
    [NetworkEnum.LOAD_ALPHA_LONG]: 0,
    [NetworkEnum.LOAD_BETA]: 0,
    [NetworkEnum.LOAD_BETA_LONG]: 0,
    [NetworkEnum.LOAD_IS_CONTROLLABLE]: false,
    [NetworkEnum.LOAD_IS_RESTORATIVE]: false,
    [NetworkEnum.LOAD_Z_PMAX]: 0,
    [NetworkEnum.LOAD_Z_QMAX]: 0,
    [NetworkEnum.REACTANCE_NO_RECLOSING_DELAY]: 0,
    [NetworkEnum.TRANSFORMER_CURRENT_LIMIT_MAX_TIME_OPERATION]: 0,
    [NetworkEnum.TRANSFORMER_T1_ST_HT]: 0,
    [NetworkEnum.TRANSFORMER_T1_ST_THT]: 0,
    [NetworkEnum.TRANSFORMER_T_NEXT_HT]: 0,
    [NetworkEnum.TRANSFORMER_T_NEXT_THT]: 0,
    [NetworkEnum.TRANSFORMER_TO_LV]: 0,
};
