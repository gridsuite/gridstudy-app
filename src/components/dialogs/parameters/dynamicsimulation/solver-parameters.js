/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';
import { useCallback, useMemo } from 'react';
import IdaSolverParameters from './solver/ida-solver-parameters';
import SimplifiedSolverParameters from './solver/simplified-solver-parameters';

const SOLVER_TYPES = {
    IDA: 'IDA',
    SIMPLIFIED: 'Simplified',
};

const SolverParameters = ({ solver, onUpdateSolver }) => {
    const { value, values } = solver;
    console.log('solver', [solver]);

    const handleUpdateSolver = useCallback(
        (newSolver) => {
            onUpdateSolver(newSolver);
        },
        [onUpdateSolver]
    );

    const handleUpdateSolverParameters = useCallback(
        (newSolverParameters) => {
            const newValues = Array.from(solver.values);
            const foundIndex = newValues.findIndex(
                (elem) => elem.id === newSolverParameters.id
            );
            newValues.splice(foundIndex, 1, newSolverParameters);
            onUpdateSolver({ ...solver, values: newValues });
        },
        [onUpdateSolver, solver]
    );

    const defParams = {
        value: {
            type: TYPES.enum,
            description: 'DynamicSimulationSolverType',
            values: values.reduce((obj, curr) => {
                obj[curr.id] = `DynamicSimulationSolver${curr.name}`;
                return obj;
            }, {}),
        },
    };

    const selectedSolver = useMemo(() => {
        return values.find((elem) => elem.id === value);
    }, [values, value]);

    return (
        <Grid container>
            <Typography
                sx={{ wordBreak: 'break-word' }}
            >{`Solver : ${JSON.stringify(solver)}`}</Typography>
            {makeComponentsFor(defParams, solver, handleUpdateSolver)}
            {selectedSolver?.name === SOLVER_TYPES.IDA && (
                <IdaSolverParameters
                    idaSolver={selectedSolver}
                    onUpdateIdaSolver={handleUpdateSolverParameters}
                />
            )}
            {selectedSolver?.name === SOLVER_TYPES.SIMPLIFIED && (
                <SimplifiedSolverParameters
                    simplifiedSolver={selectedSolver}
                    onUpdateSimplifiedSolver={handleUpdateSolverParameters}
                />
            )}
        </Grid>
    );
};

export default SolverParameters;
