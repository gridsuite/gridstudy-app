/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponents, TYPES } from '../../util/make-component-utils';
import { IdaSolver } from '../dynamic-simulation-utils';
import { commonDefParams } from './common-solver-parameters';

const defParams = {
    [IdaSolver.ORDER]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationIDASolverOrder',
    },
    [IdaSolver.INIT_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverInitStep',
    },
    [IdaSolver.MIN_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverMinStep',
    },
    [IdaSolver.MAX_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverMaxStep',
    },
    [IdaSolver.ABS_ACCURACY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverAbsAccuracy',
    },
    [IdaSolver.REL_ACCURACY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverRelAccuracy',
    },
    ...commonDefParams,
};

const IdaSolverParameters = ({ path }: { path: string }) => {
    return <>{makeComponents(defParams, path)}</>;
};

export default IdaSolverParameters;
