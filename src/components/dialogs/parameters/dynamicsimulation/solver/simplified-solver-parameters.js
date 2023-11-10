/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponents } from '../../util/make-component-utils';
import React from 'react';
import {
    FloatInput,
    IntegerInput,
    SwitchInput,
    TextInput,
} from '@gridsuite/commons-ui';
import yup from '../../../../utils/yup-config';

const SIM_H_MIN = 'hMin';
const SIM_H_MAX = 'hMax';
const SIM_K_REDUCE_STEP = 'kReduceStep';
const SIM_N_EFF = 'nEff';
const SIM_N_DEADBAND = 'nDeadband';
const SIM_MAX_NEWTON_TRY = 'maxNewtonTry';
const SIM_LINEAR_SOLVER_NAME = 'linearSolverName';
const SIM_RECALCULATE_STEP = 'recalculateStep';

export const getFormSchema = () => {
    return yup.object().shape({
        [SIM_H_MIN]: yup.number().required(),
        [SIM_H_MAX]: yup.number().required(),
        [SIM_K_REDUCE_STEP]: yup.number().required(),
        [SIM_N_EFF]: yup.number().integer().required(),
        [SIM_N_DEADBAND]: yup.number().integer().required(),
        [SIM_MAX_NEWTON_TRY]: yup.number().integer().required(),
        [SIM_LINEAR_SOLVER_NAME]: yup.string().required(),
        [SIM_RECALCULATE_STEP]: yup.boolean().required(),
    });
};

const SimplifiedSolverParameters = ({ path }) => {
    const defParams = {
        [SIM_H_MIN]: {
            label: 'DynamicSimulationSimplifiedSolverHMin',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_H_MAX]: {
            label: 'DynamicSimulationSimplifiedSolverHMax',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_K_REDUCE_STEP]: {
            label: 'DynamicSimulationSimplifiedSolverKReduceStep',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_N_EFF]: {
            label: 'DynamicSimulationSimplifiedSolverNEff',
            render: (defParam, key) => {
                return <IntegerInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_N_DEADBAND]: {
            label: 'DynamicSimulationSimplifiedSolverNDeadband',
            render: (defParam, key) => {
                return <IntegerInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_MAX_NEWTON_TRY]: {
            label: 'DynamicSimulationSimplifiedSolverMaxNewtonTry',
            render: (defParam, key) => {
                return <IntegerInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_LINEAR_SOLVER_NAME]: {
            label: 'DynamicSimulationSimplifiedSolverLinearSolverName',
            render: (defParam, key) => {
                return <TextInput name={`${path}.${key}`} label={''} />;
            },
        },
        [SIM_RECALCULATE_STEP]: {
            label: 'DynamicSimulationSimplifiedSolverRecalculateStep',
            render: (defParam, key) => {
                return <SwitchInput name={`${path}.${key}`} label={''} />;
            },
        },
    };

    return <>{makeComponents(defParams)}</>;
};

export default SimplifiedSolverParameters;
