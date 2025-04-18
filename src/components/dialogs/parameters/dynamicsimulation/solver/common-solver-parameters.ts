/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TYPES } from '../../util/make-component-utils';
import yup from '../../../../utils/yup-config';

const COMMON_F_NORM_TOL_ALG = 'fNormTolAlg';
const COMMON_INITIAL_ADD_TOL_ALG = 'initialAddTolAlg';
const COMMON_SC_STEP_TOL_ALG = 'scStepTolAlg';
const COMMON_MX_NEW_T_STEP_ALG = 'mxNewTStepAlg';
const COMMON_MSBSET_ALG = 'msbsetAlg';
const COMMON_MX_ITER_ALG = 'mxIterAlg';
const COMMON_PRINT_FL_ALG = 'printFlAlg';
const COMMON_F_NORM_TOL_ALG_J = 'fNormTolAlgJ';
const COMMON_INITIAL_ADD_TOL_ALG_J = 'initialAddTolAlgJ';
const COMMON_SC_STEP_TOL_ALG_J = 'scStepTolAlgJ';
const COMMON_MX_NEW_T_STEP_ALG_J = 'mxNewTStepAlgJ';
const COMMON_MSBSET_ALG_J = 'msbsetAlgJ';
const COMMON_MX_ITER_ALG_J = 'mxIterAlgJ';
const COMMON_PRINT_FL_ALG_J = 'printFlAlgJ';
const COMMON_F_NORM_TOL_ALG_INIT = 'fNormTolAlgInit';
const COMMON_INITIAL_ADD_TOL_ALG_INIT = 'initialAddTolAlgInit';
const COMMON_SC_STEP_TOL_ALG_INIT = 'scStepTolAlgInit';
const COMMON_MX_NEW_T_STEP_ALG_INIT = 'mxNewTStepAlgInit';
const COMMON_MSBSET_ALG_INIT = 'msbsetAlgInit';
const COMMON_MX_ITER_ALG_INIT = 'mxIterAlgInit';
const COMMON_PRINT_FL_ALG_INIT = 'printFlAlgInit';
const COMMON_MAXIMUM_NUMBER_SLOW_STEP_INCREASE = 'maximumNumberSlowStepIncrease';
const COMMON_MINIMAL_ACCEPTABLE_STEP = 'minimalAcceptableStep';

export const getFormSchema = () => {
    return {
        [COMMON_F_NORM_TOL_ALG]: yup.number().required(),
        [COMMON_INITIAL_ADD_TOL_ALG]: yup.number().required(),
        [COMMON_SC_STEP_TOL_ALG]: yup.number().required(),
        [COMMON_MX_NEW_T_STEP_ALG]: yup.number().integer().required(),
        [COMMON_MSBSET_ALG]: yup.number().integer().required(),
        [COMMON_MX_ITER_ALG]: yup.number().integer().required(),
        [COMMON_PRINT_FL_ALG]: yup.number().integer().required(),
        [COMMON_F_NORM_TOL_ALG_J]: yup.number().required(),
        [COMMON_INITIAL_ADD_TOL_ALG_J]: yup.number().required(),
        [COMMON_SC_STEP_TOL_ALG_J]: yup.number().required(),
        [COMMON_MX_NEW_T_STEP_ALG_J]: yup.number().required(),
        [COMMON_MSBSET_ALG_J]: yup.number().integer().required(),
        [COMMON_MX_ITER_ALG_J]: yup.number().integer().required(),
        [COMMON_PRINT_FL_ALG_J]: yup.number().integer().required(),
        [COMMON_F_NORM_TOL_ALG_INIT]: yup.number().required(),
        [COMMON_INITIAL_ADD_TOL_ALG_INIT]: yup.number().required(),
        [COMMON_SC_STEP_TOL_ALG_INIT]: yup.number().required(),
        [COMMON_MX_NEW_T_STEP_ALG_INIT]: yup.number().required(),
        [COMMON_MSBSET_ALG_INIT]: yup.number().integer().required(),
        [COMMON_MX_ITER_ALG_INIT]: yup.number().integer().required(),
        [COMMON_PRINT_FL_ALG_INIT]: yup.number().integer().required(),
        [COMMON_MAXIMUM_NUMBER_SLOW_STEP_INCREASE]: yup.number().integer().required(),
        [COMMON_MINIMAL_ACCEPTABLE_STEP]: yup.number().required(),
    };
};

export const commonDefParams = {
    [COMMON_F_NORM_TOL_ALG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverFNormTolAlg',
    },
    [COMMON_INITIAL_ADD_TOL_ALG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverInitialAddTolAlg',
    },
    [COMMON_SC_STEP_TOL_ALG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverScStepTolAlg',
    },
    [COMMON_MX_NEW_T_STEP_ALG]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverMxNewTStepAlg',
    },
    [COMMON_MSBSET_ALG]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMsbsetAlg',
    },
    [COMMON_MX_ITER_ALG]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMxIterAlg',
    },
    [COMMON_PRINT_FL_ALG]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverPrintFlAlg',
    },
    [COMMON_F_NORM_TOL_ALG_J]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverFNormTolAlgJ',
    },
    [COMMON_INITIAL_ADD_TOL_ALG_J]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverInitialAddTolAlgJ',
    },
    [COMMON_SC_STEP_TOL_ALG_J]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverScStepTolAlgJ',
    },
    [COMMON_MX_NEW_T_STEP_ALG_J]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverMxNewTStepAlgJ',
    },
    [COMMON_MSBSET_ALG_J]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMsbsetAlgJ',
    },
    [COMMON_MX_ITER_ALG_J]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMxIterAlgJ',
    },
    [COMMON_PRINT_FL_ALG_J]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverPrintFlAlgJ',
    },
    [COMMON_F_NORM_TOL_ALG_INIT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverFNormTolAlgInit',
    },
    [COMMON_INITIAL_ADD_TOL_ALG_INIT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverInitialAddTolAlgInit',
    },
    [COMMON_SC_STEP_TOL_ALG_INIT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverScStepTolAlgInit',
    },
    [COMMON_MX_NEW_T_STEP_ALG_INIT]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverMxNewTStepAlgInit',
    },
    [COMMON_MSBSET_ALG_INIT]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMsbsetAlgInit',
    },
    [COMMON_MX_ITER_ALG_INIT]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMxIterAlgInit',
    },
    [COMMON_PRINT_FL_ALG_INIT]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverPrintFlAlgInit',
    },
    [COMMON_MAXIMUM_NUMBER_SLOW_STEP_INCREASE]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationSolverMaximumNumberSlowStepIncrease',
    },
    [COMMON_MINIMAL_ACCEPTABLE_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationSolverMinimalAcceptableStep',
    },
};
