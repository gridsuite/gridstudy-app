/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { makeComponents, TYPES } from '../util/make-component-utils';
import IdaSolverParameters, { getFormSchema as getIdaFormSchema } from './solver/ida-solver-parameters';
import SimplifiedSolverParameters, {
    getFormSchema as getSimplifiedFormSchema,
} from './solver/simplified-solver-parameters';
import { TabPanel } from '../parameters';

const SOLVER_TYPES = {
    IDA: 'IDA',
    SIM: 'SIM',
};

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
                if (type === SOLVER_TYPES.IDA) {
                    return getIdaFormSchema();
                } else if (type === SOLVER_TYPES.SIM) {
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

const SolverParameters = ({ solver, path, clearErrors }) => {
    const { solvers } = solver ?? {};

    const solverId = useWatch({ name: `${path}.${SOLVER_ID}` });

    const selectedSolver = useMemo(() => {
        return solvers?.find((elem) => elem.id === solverId);
    }, [solvers, solverId]);

    const solverOptions = useMemo(() => {
        return solvers?.reduce((arr, curr) => {
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
        <Grid xl={6} container>
            {makeComponents(defParams, path)}
            <TabPanel value={selectedSolver?.type} index={SOLVER_TYPES.IDA}>
                <IdaSolverParameters path={`${path}.${SOLVERS}[0]`} />
            </TabPanel>
            <TabPanel value={selectedSolver?.type} index={SOLVER_TYPES.SIM}>
                <SimplifiedSolverParameters path={`${path}.${SOLVERS}[1]`} />
            </TabPanel>
        </Grid>
    );
};

export default SolverParameters;
