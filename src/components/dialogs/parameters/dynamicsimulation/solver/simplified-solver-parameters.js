/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback, useMemo } from 'react';
import { debounce } from '@mui/material';

const SimplifiedSolverParameters = ({
    simplifiedSolver,
    onUpdateSimplifiedSolver,
}) => {
    const defParams = {
        hMin: {
            type: TYPES.double,
            description: 'DynamicSimulationSimplifiedSolverHMin',
        },
        hMax: {
            type: TYPES.double,
            description: 'DynamicSimulationSimplifiedSolverHMax',
        },
        kReduceStep: {
            type: TYPES.double,
            description: 'DynamicSimulationSimplifiedSolverKReduceStep',
        },
        nEff: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverNEff',
        },
        nDeadband: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverNDeadband',
        },
        maxNewtonTry: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMaxNewtonTry',
        },
        linearSolverName: {
            type: TYPES.string,
            description: 'DynamicSimulationSimplifiedSolverLinearSolverName',
        },
        recalculateStep: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverRecalculateStep',
        },
    };

    const handleUpdateSimplifiedSolver = useCallback(
        (newSimplifiedParameters) => {
            console.log('newSimplifiedParameters', newSimplifiedParameters);
            onUpdateSimplifiedSolver(newSimplifiedParameters);
        },
        [onUpdateSimplifiedSolver]
    );

    const delayedHandleUpdateSimplifiedSolver = useMemo(
        () => debounce(handleUpdateSimplifiedSolver, 500),
        [handleUpdateSimplifiedSolver]
    );

    return (
        <>
            {makeComponentsFor(
                defParams,
                simplifiedSolver,
                delayedHandleUpdateSimplifiedSolver
            )}
        </>
    );
};

export default SimplifiedSolverParameters;
