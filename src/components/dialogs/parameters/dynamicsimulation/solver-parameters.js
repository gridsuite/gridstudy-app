/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { SelectInput } from '@gridsuite/commons-ui';
import { makeComponents } from '../util/make-component-utils';
import IdaSolverParameters, {
    getFormSchema as getIdaFormSchema,
} from './solver/ida-solver-parameters';
import SimplifiedSolverParameters, {
    getFormSchema as getSimplifiedFormSchema,
} from './solver/simplified-solver-parameters';
import { TabPanel } from '../parameters';

export const SOLVER_TYPES = {
    IDA: 'IDA',
    SIM: 'SIM',
};

export const SOLVER_ID = 'solverId';

export const SOLVERS = 'solvers';

export const formSchema = yup.object().shape({
    [SOLVER_ID]: yup.string().required(),
    [SOLVERS]: yup.array().of(
        yup.lazy((item) => {
            const { type } = item;
            if (type === SOLVER_TYPES.IDA) {
                return getIdaFormSchema();
            } else if (type === SOLVER_TYPES.SIM) {
                return getSimplifiedFormSchema(yup.object());
            }
        })
    ),
});

export const emptyFormData = {
    [SOLVER_ID]: '',
    [SOLVERS]: [],
};

const SolverParameters = ({ solver, path }) => {
    const { solvers } = solver ?? {};

    const solverId = useWatch({ name: `${path}.${SOLVER_ID}` });

    const selectedSolver = useMemo(() => {
        return solvers?.find((elem) => elem.id === solverId);
    }, [solvers, solverId]);

    const defParams = {
        [SOLVER_ID]: {
            label: 'DynamicSimulationSolverType',
            values: solvers?.reduce((arr, curr) => {
                return [
                    ...arr,
                    {
                        id: curr.id,
                        label: `DynamicSimulationSolver${curr.type}`,
                    },
                ];
            }, []),
            render: (defParam, key) => {
                return (
                    <SelectInput
                        name={`${path}.${key}`}
                        label={''}
                        options={defParam.values}
                    />
                );
            },
        },
    };

    return (
        <Grid container>
            {makeComponents(defParams)}
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
