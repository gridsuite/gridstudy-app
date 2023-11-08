/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback } from 'react';

const IdaSolverParameters = ({ idaSolver, onUpdateIdaSolver }) => {
    const defParams = {
        order: {
            type: TYPES.integer,
            description: 'DynamicSimulationIDASolverOrder',
        },
        initStep: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverInitStep',
        },
        minStep: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverMinStep',
        },
        maxStep: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverMaxStep',
        },
        absAccuracy: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverAbsAccuracy',
        },
        relAccuracy: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverRelAccuracy',
        },
        fnormtolAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverFnormtolAlg',
        },
        initialaddtolAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverInitialaddtolAlg',
        },
        scsteptolAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverScsteptolAlg',
        },
        mxnewtstepAlg: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMxnewtstepAlg',
        },
        msbsetAlg: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMsbsetAlg',
        },
        mxiterAlg: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMxiterAlg',
        },
        printflAlg: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverPrintflAlg',
        },
        fnormtolAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverFnormtolAlgJ',
        },
        initialaddtolAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverInitialaddtolAlgJ',
        },
        scsteptolAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverScsteptolAlgJ',
        },
        mxnewtstepAlgJ: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMxnewtstepAlgJ',
        },
        msbsetAlgJ: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMsbsetAlgJ',
        },
        mxiterAlgJ: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMxiterAlgJ',
        },
        printflAlgJ: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverPrintflAlgJ',
        },
        fnormtolAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverFnormtolAlgInit',
        },
        initialaddtolAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverInitialaddtolAlgInit',
        },
        scsteptolAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverScsteptolAlgInit',
        },
        mxnewtstepAlgInit: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMxnewtstepAlgInit',
        },
        msbsetAlgInit: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMsbsetAlgInit',
        },
        mxiterAlgInit: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMxiterAlgInit',
        },
        printflAlgInit: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverPrintflAlgInit',
        },
        maximumNumberSlowStepIncrease: {
            type: TYPES.integer,
            description: 'DynamicSimulationSolverMaximumNumberSlowStepIncrease',
        },
        minimalacceptablestep: {
            type: TYPES.float,
            description: 'DynamicSimulationSolverMinimalAcceptableStep',
        },
    };

    const handleUpdateIdaSolver = useCallback(
        (newIdaParameters) => {
            onUpdateIdaSolver(newIdaParameters);
        },
        [onUpdateIdaSolver]
    );

    return (
        <>{makeComponentsFor(defParams, idaSolver, handleUpdateIdaSolver)}</>
    );
};

export default IdaSolverParameters;
