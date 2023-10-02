/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback } from 'react';
import yup from '../../../../utils/yup-config';

const SimplifiedSolverParameters = ({
    simplifiedSolver,
    onUpdateSimplifiedSolver,
}) => {
    const defParams = {
        hMin: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverHMin',
            validator: yup.number().required(),
        },
        hMax: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverHMax',
            validator: yup.number().required(),
        },
        kReduceStep: {
            type: TYPES.float,
            description: 'DynamicSimulationSimplifiedSolverKReduceStep',
            validator: yup.number().required(),
        },
        nEff: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverNEff',
            validator: yup.number().integer().required(),
        },
        nDeadband: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverNDeadband',
            validator: yup.number().integer().required(),
        },
        maxNewtonTry: {
            type: TYPES.integer,
            description: 'DynamicSimulationSimplifiedSolverMaxNewtonTry',
            validator: yup.number().integer().required(),
        },
        linearSolverName: {
            type: TYPES.text,
            description: 'DynamicSimulationSimplifiedSolverLinearSolverName',
            validator: yup.string().required(),
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
