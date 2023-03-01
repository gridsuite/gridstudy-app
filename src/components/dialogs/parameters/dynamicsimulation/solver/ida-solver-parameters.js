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
            type: TYPES.double,
            description: 'DynamicSimulationIDASolverInitStep',
        },
        minStep: {
            type: TYPES.double,
            description: 'DynamicSimulationIDASolverMinStep',
        },
        maxStep: {
            type: TYPES.double,
            description: 'DynamicSimulationIDASolverMaxStep',
        },
        absAccuracy: {
            type: TYPES.double,
            description: 'DynamicSimulationIDASolverAbsAccuracy',
        },
        relAccuracy: {
            type: TYPES.double,
            description: 'DynamicSimulationIDASolverRelAccuracy',
        },
    };

    const handleUpdateIdaSolver = useCallback(
        (newIdaParameters) => {
            console.log('newIdaParameters', newIdaParameters);
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
