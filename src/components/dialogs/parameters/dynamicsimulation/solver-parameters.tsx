/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { FunctionComponent, useEffect, useMemo } from 'react';
import { UseFormClearErrors, useWatch } from 'react-hook-form';
import { makeComponents, TYPES } from '../util/make-component-utils';
import IdaSolverParameters, { getFormSchema as getIdaFormSchema } from './solver/ida-solver-parameters';
import SimplifiedSolverParameters, {
    getFormSchema as getSimplifiedFormSchema,
} from './solver/simplified-solver-parameters';
import { TabPanel } from '../parameters';
import { DynamicSimulationForm } from './dynamic-simulation-parameters';
import { SolverTypeInfos } from 'services/study/dynamic-simulation.type';

export const SOLVER_ID = 'solverId';

export const SOLVERS = 'solvers';

export const formSchema = yup.object().shape({
    [SOLVER_ID]: yup.string().required(),
    [SOLVERS]: yup.array().when([SOLVER_ID], ([solverId], schema) =>
        schema.of(
            yup.lazy((item) => {
                const { id, type } = item;

                // ignore validation if not current selected solver
                if (solverId !== id) {
                    return yup.object().default(undefined);
                }

                // chose the right schema for each type of solver
                if (type === SolverTypeInfos.IDA) {
                    return getIdaFormSchema();
                } else {
                    return getSimplifiedFormSchema();
                }
            })
        )
    ),
});

export const emptyFormData = {
    [SOLVER_ID]: '',
    [SOLVERS]: [],
};

interface SolverParametersProps {
    solver?: { solverId: string; solvers: Record<string, any>[] };
    path: keyof DynamicSimulationForm;
    clearErrors: UseFormClearErrors<DynamicSimulationForm>;
}

const SolverParameters: FunctionComponent<SolverParametersProps> = ({ solver, path, clearErrors }) => {
    const { solvers } = solver ?? {};

    const solverId = useWatch({ name: `${path}.${SOLVER_ID}` });

    const selectedSolver = useMemo(() => {
        return solvers?.find((elem) => elem.id === solverId);
    }, [solvers, solverId]);

    const solverOptions = useMemo(() => {
        return solvers?.reduce<{ id: string; label: string }[]>((arr, curr) => {
            return [
                ...arr,
                {
                    id: curr.id,
                    label: `DynamicSimulationSolver${curr.type}`,
                },
            ];
        }, []);
    }, [solvers]);

    useEffect(() => {
        clearErrors(path);
    }, [solverId, clearErrors, path]);

    const defParams = {
        [SOLVER_ID]: {
            type: TYPES.ENUM,
            label: 'DynamicSimulationSolverType',
            options: solverOptions,
        },
    };

    return (
        <Grid xl={8} container>
            {makeComponents(defParams, path)}
            <TabPanel value={selectedSolver?.type} index={SolverTypeInfos.IDA}>
                <IdaSolverParameters path={`${path}.${SOLVERS}[0]`} />
            </TabPanel>
            <TabPanel value={selectedSolver?.type} index={SolverTypeInfos.SIM}>
                <SimplifiedSolverParameters path={`${path}.${SOLVERS}[1]`} />
            </TabPanel>
        </Grid>
    );
};

export default SolverParameters;
