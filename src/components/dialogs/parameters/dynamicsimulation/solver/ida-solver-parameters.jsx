/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponents, TYPES } from '../../util/make-component-utils';
import yup from '../../../../utils/yup-config';
import {
    commonDefParams,
    getFormSchema as getCommonSolverFormSchema,
} from './common-solver-parameters';

const IDA_ORDER = 'order';
const IDA_INIT_STEP = 'initStep';
const IDA_MIN_STEP = 'minStep';
const IDA_MAX_STEP = 'maxStep';
const IDA_ABS_ACCURACY = 'absAccuracy';
const IDA_REL_ACCURACY = 'relAccuracy';

export const getFormSchema = () =>
    yup.object().shape({
        [IDA_ORDER]: yup
            .number()
            .integer()
            .oneOf([1, 2], 'DynamicSimulationIDASolverOrderMustBeOneOfValues')
            .required(),
        [IDA_INIT_STEP]: yup.number().required(),
        [IDA_MIN_STEP]: yup.number().required(),
        [IDA_MAX_STEP]: yup.number().required(),
        [IDA_ABS_ACCURACY]: yup.number().required(),
        [IDA_REL_ACCURACY]: yup.number().required(),
        ...getCommonSolverFormSchema(),
    });

const defParams = {
    [IDA_ORDER]: {
        type: TYPES.INTEGER,
        label: 'DynamicSimulationIDASolverOrder',
    },
    [IDA_INIT_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverInitStep',
    },
    [IDA_MIN_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverMinStep',
    },
    [IDA_MAX_STEP]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverMaxStep',
    },
    [IDA_ABS_ACCURACY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverAbsAccuracy',
    },
    [IDA_REL_ACCURACY]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationIDASolverRelAccuracy',
    },
    ...commonDefParams,
};

const IdaSolverParameters = ({ path }) => {
    return <>{makeComponents(defParams, path)}</>;
};

export default IdaSolverParameters;
