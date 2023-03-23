/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';
import { useCallback, useMemo } from 'react';
import IdaSolverParameters from './solver/ida-solver-parameters';
import SimplifiedSolverParameters from './solver/simplified-solver-parameters';

const SOLVER_TYPES = {
    IDA: 'IDA',
    SIM: 'SIM',
};

const SolverParameters = ({ solver, onUpdateSolver }) => {
    const { solverId, solvers } = solver;

    const handleUpdateSolver = useCallback(
        (newSolver) => {
            onUpdateSolver({ ...solver, ...newSolver });
        },
        [onUpdateSolver, solver]
    );

    const handleUpdateSolverParameters = useCallback(
        (newSolverParameters) => {
            const newSolvers = Array.from(solvers);
            const foundIndex = newSolvers.findIndex(
                (elem) => elem.id === newSolverParameters.id
            );
            newSolvers.splice(foundIndex, 1, newSolverParameters);
            onUpdateSolver({ ...solver, solvers: newSolvers });
        },
        [onUpdateSolver, solver, solvers]
    );

    const defParams = {
        solverId: {
            type: TYPES.enum,
            description: 'DynamicSimulationSolverType',
            values: solvers.reduce((obj, curr) => {
                obj[curr.id] = `DynamicSimulationSolver${curr.type}`;
                return obj;
            }, {}),
        },
    };

    const selectedSolver = useMemo(() => {
        return solvers.find((elem) => elem.id === solverId);
    }, [solvers, solverId]);

    return (
        solver && (
            <Grid container>
                {makeComponentsFor(defParams, solver, handleUpdateSolver)}
                {selectedSolver?.type === SOLVER_TYPES.IDA && (
                    <IdaSolverParameters
                        idaSolver={selectedSolver}
                        onUpdateIdaSolver={handleUpdateSolverParameters}
                    />
                )}
                {selectedSolver?.type === SOLVER_TYPES.SIM && (
                    <SimplifiedSolverParameters
                        simplifiedSolver={selectedSolver}
                        onUpdateSimplifiedSolver={handleUpdateSolverParameters}
                    />
                )}
            </Grid>
        )
    );
};

export default SolverParameters;
