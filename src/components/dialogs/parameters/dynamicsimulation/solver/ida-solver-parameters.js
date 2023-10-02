/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponentsFor, TYPES } from '../../util/make-component-utils';
import { useCallback } from 'react';
import yup from '../../../../utils/yup-config';

const IdaSolverParameters = ({ idaSolver, onUpdateIdaSolver }) => {
    const defParams = {
        order: {
            type: TYPES.integer,
            description: 'DynamicSimulationIDASolverOrder',
            validator: yup.number().integer().required(),
        },
        initStep: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverInitStep',
            validator: yup.number().required(),
        },
        minStep: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverMinStep',
            validator: yup.number().required(),
        },
        maxStep: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverMaxStep',
            validator: yup.number().required(),
        },
        absAccuracy: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverAbsAccuracy',
            validator: yup.number().required(),
        },
        relAccuracy: {
            type: TYPES.float,
            description: 'DynamicSimulationIDASolverRelAccuracy',
            validator: yup.number().required(),
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
