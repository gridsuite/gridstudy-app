/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponents, TYPES } from '../../util/make-component-utils';
import React from 'react';
import yup from '../../../../utils/yup-config';
import { commonDefParams, getFormSchema as getCommonSolverFormSchema } from './common-solver-parameters';

const SIM_H_MIN = 'hMin';
const SIM_H_MAX = 'hMax';
const SIM_K_REDUCE_STEP = 'kReduceStep';
const SIM_MAX_NEWTON_TRY = 'maxNewtonTry';
const SIM_LINEAR_SOLVER_NAME = 'linearSolverName';
const SIM_F_NORM_TOL = 'fNormTol';
const SIM_INITIAL_ADD_TOL = 'initialAddTol';
const SIM_SC_STEP_TOL = 'scStepTol';
const SIM_MX_NEW_T_STEP = 'mxNewTStep';
const SIM_MSBSET = 'msbset';
const SIM_MX_ITER = 'mxIter';
const SIM_PRINT_FL = 'printFl';

const SIM_OPTIMIZE_ALGEBRAIC_RESIDUALS_EVALUATIONS = 'optimizeAlgebraicResidualsEvaluations';
const SIM_SKIP_NR_IF_INITIAL_GUESS_OK = 'skipNRIfInitialGuessOK';
const SIM_ENABLE_SILENT_Z = 'enableSilentZ';
const SIM_OPTIMIZE_RE_INIT_ALGEBRAIC_RESIDUALS_EVALUATIONS = 'optimizeReInitAlgebraicResidualsEvaluations';

const SIM_MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION = 'minimumModeChangeTypeForAlgebraicRestoration';
const SIM_MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION_INIT = 'minimumModeChangeTypeForAlgebraicRestorationInit';

export const getFormSchema = () => {
    return yup.object().shape({
        [SIM_H_MIN]: yup.number().required(),
        [SIM_H_MAX]: yup.number().required(),
        [SIM_K_REDUCE_STEP]: yup.number().required(),
        [SIM_MAX_NEWTON_TRY]: yup.number().integer().required(),
        [SIM_LINEAR_SOLVER_NAME]: yup.string().required(),
        [SIM_F_NORM_TOL]: yup.number().required(),
        [SIM_INITIAL_ADD_TOL]: yup.number().required(),
        [SIM_SC_STEP_TOL]: yup.number().required(),
        [SIM_MX_NEW_T_STEP]: yup.number().required(),
        [SIM_MSBSET]: yup.number().integer().required(),
        [SIM_MX_ITER]: yup.number().integer().required(),
        [SIM_PRINT_FL]: yup.number().integer().required(),
        [SIM_OPTIMIZE_ALGEBRAIC_RESIDUALS_EVALUATIONS]: yup.boolean().required(),
        [SIM_SKIP_NR_IF_INITIAL_GUESS_OK]: yup.boolean().required(),
        [SIM_ENABLE_SILENT_Z]: yup.boolean().required(),
        [SIM_OPTIMIZE_RE_INIT_ALGEBRAIC_RESIDUALS_EVALUATIONS]: yup.boolean().required(),
        [SIM_MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION]: yup.string().required(),
        [SIM_MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION_INIT]: yup.string().required(),
        ...getCommonSolverFormSchema(),
    });
};

const defParams = {
    [SIM_H_MIN]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverHMin',
    },
    [SIM_H_MAX]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverHMax',
    },
    [SIM_K_REDUCE_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverKReduceStep',
    },
    [SIM_MAX_NEWTON_TRY]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverMaxNewtonTry',
    },
    [SIM_LINEAR_SOLVER_NAME]: {
        type: TYPES.STRING,
        label: 'DynamicSimulationSimplifiedSolverLinearSolverName',
    },
    [SIM_F_NORM_TOL]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverFNormTol',
    },
    [SIM_INITIAL_ADD_TOL]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverInitialAddTol',
    },
    [SIM_SC_STEP_TOL]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverScStepTol',
    },
    [SIM_MX_NEW_T_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSimplifiedSolverMxNewTStep',
    },
    [SIM_MSBSET]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverMsbset',
    },
    [SIM_MX_ITER]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverMxIter',
    },
    [SIM_PRINT_FL]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSimplifiedSolverPrintFl',
    },
    [SIM_OPTIMIZE_ALGEBRAIC_RESIDUALS_EVALUATIONS]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverOptimizeAlgebraicResidualsEvaluations',
    },
    [SIM_SKIP_NR_IF_INITIAL_GUESS_OK]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverSkipNRIfInitialGuessOK',
    },
    [SIM_ENABLE_SILENT_Z]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverEnableSilentZ',
    },
    [SIM_OPTIMIZE_RE_INIT_ALGEBRAIC_RESIDUALS_EVALUATIONS]: {
        type: TYPES.BOOL,
        label: 'DynamicSimulationSimplifiedSolverOptimizeReInitAlgebraicResidualsEvaluations',
    },
    [SIM_MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION]: {
        type: TYPES.STRING,
        label: 'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestoration',
    },
    [SIM_MINIMUM_MODE_CHANGE_TYPE_FOR_ALGEBRAIC_RESTORATION_INIT]: {
        type: TYPES.STRING,
        label: 'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestorationInit',
    },
    ...commonDefParams,
};

const SimplifiedSolverParameters = ({ path }) => {
    return <>{makeComponents(defParams, path)}</>;
};

export default SimplifiedSolverParameters;
