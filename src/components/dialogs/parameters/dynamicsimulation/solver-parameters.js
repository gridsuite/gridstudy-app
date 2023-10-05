/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useIntl } from 'react-intl';

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
                return getSimplifiedFormSchema();
            }
        })
    ),
});

export const emptyFormData = {
    [SOLVER_ID]: '',
    [SOLVERS]: [],
};

const SolverParameters = ({ solver, path, errors = {} }) => {
    const { solvers } = solver ?? {};
    const intl = useIntl();

    const solverId = useWatch({ name: `${path}.${SOLVER_ID}` });

    const [solversWithError, setSolversWithError] = useState([]);

    const selectedSolver = useMemo(() => {
        return solvers?.find((elem) => elem.id === solverId);
    }, [solvers, solverId]);

    const onError = useCallback((errors) => {
        const solversInError = [];
        if (errors[SOLVERS]?.[0]) {
            solversInError.push(SOLVER_TYPES.IDA);
        }
        if (errors[SOLVERS]?.[1]) {
            solversInError.push(SOLVER_TYPES.SIM);
        }

        setSolversWithError(solversInError);
    }, []);

    const errorsJSON = JSON.stringify(errors);

    useEffect(() => {
        onError(JSON.parse(errorsJSON));
    }, [errorsJSON, onError]);

    const buildSolverErrorMessage = useCallback(() => {
        // do not show message on the current selected solver
        if (solversWithError.includes(selectedSolver.type)) {
            return null;
        }

        // ignore current selected type in the message content
        return solversWithError
            .filter((elem) => elem !== selectedSolver.type)
            .map((elem) =>
                intl.formatMessage({
                    id: `DynamicSimulationSolver${elem}`,
                })
            )
            .join(', ')
            .concat(' ')
            .concat(
                intl.formatMessage({
                    id: `DynamicSimulationSolverInvalid`,
                })
            );
    }, [solversWithError, selectedSolver, intl]);

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
                        fullWidth
                        size={'small'}
                        formProps={
                            solversWithError.length && {
                                error: true,
                                helperText: buildSolverErrorMessage(),
                            }
                        }
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
