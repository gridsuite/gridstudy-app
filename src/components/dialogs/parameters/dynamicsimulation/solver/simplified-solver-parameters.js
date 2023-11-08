/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback } from 'react';

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
        fnormtol: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverFnormtol',
        },
        initialaddtol: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverInitialaddtol',
        },
        scsteptol: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverScsteptol',
        },
        mxnewtstep: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverMxnewtstep',
        },
        msbset: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMsbset',
        },
        mxiter: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMxiter',
        },
        printfl: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverPrintfl',
        },
        optimizeAlgebraicResidualsEvaluations: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverOptimizeAlgebraicResidualsEvaluations',
        },
        skipNRIfInitialGuessOK: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverSkipNRIfInitialGuessOK',
        },
        enableSilentZ: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverEnableSilentZ',
        },
        optimizeReinitAlgebraicResidualsEvaluations: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverOptimizeReinitAlgebraicResidualsEvaluations',
        },
        minimumModeChangeTypeForAlgebraicRestoration: {
            type: TYPES.text,
            description: 'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestoration',
        },
        minimumModeChangeTypeForAlgebraicRestorationInit: {
            type: TYPES.text,
            description: 'DynamicSimulationSimplifiedSolverMinimumModeChangeTypeForAlgebraicRestorationInit',
        },
        fnormtolAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverFnormtolAlg',
        },
        initialaddtolAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverInitialaddtolAlg',
        },
        scsteptolAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverScsteptolAlg',
        },
        mxnewtstepAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMxnewtstepAlg',
        },
        msbsetAlg: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMsbsetAlg',
        },
        mxiterAlg: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMxiterAlg',
        },
        printflAlg: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverPrintflAlg',
        },
        fnormtolAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverFnormtolAlgJ',
        },
        initialaddtolAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverInitialaddtolAlgJ',
        },
        scsteptolAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverScsteptolAlgJ',
        },
        mxnewtstepAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMxnewtstepAlgJ',
        },
        msbsetAlgJ: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMsbsetAlgJ',
        },
        mxiterAlgJ: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMxiterAlgJ',
        },
        printflAlgJ: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverPrintflAlgJ',
        },
        fnormtolAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverFnormtolAlgInit',
        },
        initialaddtolAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverInitialaddtolAlgInit',
        },
        scsteptolAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverScsteptolAlgInit',
        },
        mxnewtstepAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMxnewtstepAlgInit',
        },
        msbsetAlgInit: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMsbsetAlgInit',
        },
        mxiterAlgInit: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMxiterAlgInit',
        },
        printflAlgInit: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverPrintflAlgInit',
        },
        maximumNumberSlowStepIncrease: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMaximumNumberSlowStepIncrease',
        },
        minimalacceptablestep: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMinimalAcceptableStep',
        },
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
