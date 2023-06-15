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
            type: TYPES.text,
            description: 'DynamicSimulationSimplifiedSolverLinearSolverName',
        },
        recalculateStep: {
            type: TYPES.bool,
            description: 'DynamicSimulationSimplifiedSolverRecalculateStep',
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
