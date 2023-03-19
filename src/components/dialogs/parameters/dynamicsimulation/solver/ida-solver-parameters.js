/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback, useMemo } from 'react';
import { debounce } from '@mui/material';

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
    };

    const handleUpdateIdaSolver = useCallback(
        (newIdaParameters) => {
            onUpdateIdaSolver(newIdaParameters);
        },
        [onUpdateIdaSolver]
    );

    const delayedHandleUpdateIdaSolver = useMemo(
        () => debounce(handleUpdateIdaSolver, 500),
        [handleUpdateIdaSolver]
    );

    return (
        <>
            {makeComponentsFor(
                defParams,
                idaSolver,
                delayedHandleUpdateIdaSolver
            )}
        </>
    );
};

export default IdaSolverParameters;
