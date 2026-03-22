/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { UseFormClearErrors, useWatch } from 'react-hook-form';
import { makeComponents, TYPES } from '../util/make-component-utils';
import IdaSolverParameters from './solver/ida-solver-parameters';
import SimplifiedSolverParameters from './solver/simplified-solver-parameters';
import { TabPanel } from '../parameters';
import { Solver } from './dynamic-simulation-utils';
import { DynamicSimulationForm } from './dynamic-simulation.type';
import { SolverInfos, SolverType } from '../../../../services/study/dynamic-simulation.type';

interface SolverParametersProps {
    solver?: { solver?: SolverType; solvers?: SolverInfos[] };
    path: keyof DynamicSimulationForm;
    clearErrors: UseFormClearErrors<DynamicSimulationForm>;
}

const SolverParameters: FunctionComponent<SolverParametersProps> = ({ solver: solverParam, path, clearErrors }) => {
    const { solvers } = solverParam ?? {};

    const solver = useWatch({ name: `${path}.${Solver.SOLVER}` });

    const selectedSolver = useMemo(() => {
        return solvers?.find((elem) => elem.type === solver);
    }, [solvers, solver]);

    const solverOptions = useMemo(() => {
        return solvers?.reduce<{ id: string; label: string }[]>((arr, curr) => {
            return [
                ...arr,
                {
                    id: curr.type,
                    label: `DynamicSimulationSolver${curr.type}`,
                },
            ];
        }, []);
    }, [solvers]);

    useEffect(() => {
        clearErrors(path);
    }, [solver, clearErrors, path]);

    const defParams = {
        [Solver.SOLVER]: {
            type: TYPES.ENUM,
            label: 'DynamicSimulationSolverType',
            options: solverOptions,
        },
    };

    return (
        <Grid xl={8} container>
            {makeComponents(defParams, path)}
            <TabPanel value={selectedSolver?.type} index={SolverType.IDA}>
                <IdaSolverParameters path={`${path}.${Solver.SOLVERS}[0]`} />
            </TabPanel>
            <TabPanel value={selectedSolver?.type} index={SolverType.SIM}>
                <SimplifiedSolverParameters path={`${path}.${Solver.SOLVERS}[1]`} />
            </TabPanel>
        </Grid>
    );
};

export default SolverParameters;
