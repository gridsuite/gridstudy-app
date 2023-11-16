/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback } from 'react';
import { commonDefParams } from './solver-constants';

const SimplifiedSolverParameters = ({
    simplifiedSolver,
    onUpdateSimplifiedSolver,
}) => {
    const defParams = {
        hMin: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverHMin',
        },
        hMax: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverHMax',
        },
        kReduceStep: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverKReduceStep',
        },
        maxNewtonTry: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMaxNewtonTry',
        },
        linearSolverName: {
            type: TYPES.text,
            description: 'DynamicSimulationSimplifiedSolverLinearSolverName',
        },
        fNormTol: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverFNormTol',
        },
        initialAddTol: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverInitialAddTol',
        },
        scStepTol: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverScStepTol',
        },
        mxNewTStep: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverMxNewTStep',
        },
        msbset: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMsbset',
        },
        mxIter: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMxIter',
        },
        printFl: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverPrintFl',
        },
        optimizeAlgebraicResidualsEvaluations: {
            type: TYPES.bool,
            description:
                'DynamicSimulationSimplifiedSolverOptimizeAlgebraicResidualsEvaluations',
        },
        skipNRIfInitialGuessOK: {
            type: TYPES.bool,
            description:
                'DynamicSimulationSimplifiedSolverSkipNRIfInitialGuessOK',
        },
        enableSilentZ: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverEnableSilentZ',
        },
        optimizeReInitAlgebraicResidualsEvaluations: {
            type: TYPES.bool,
            description:
                'DynamicSimulationSimplifiedSolverOptimizeReInitAlgebraicResidualsEvaluations',
        },
        minimumModeChangeTypeForAlgebraicRestoration: {
            type: TYPES.text,

            description:
                'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestoration',
        },
        minimumModeChangeTypeForAlgebraicRestorationInit: {
            type: TYPES.text,
            description:
                'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestorationInit',
        },
        ...commonDefParams,
    };

    const handleUpdateSimplifiedSolver = useCallback(
        (newSimplifiedParameters) => {
            onUpdateSimplifiedSolver(newSimplifiedParameters);
        },
        [onUpdateSimplifiedSolver]
    );

    return (
        <>
            {makeComponentsFor(
                defParams,
                simplifiedSolver,
                handleUpdateSimplifiedSolver
            )}
        </>
    );
};

export default SimplifiedSolverParameters;
