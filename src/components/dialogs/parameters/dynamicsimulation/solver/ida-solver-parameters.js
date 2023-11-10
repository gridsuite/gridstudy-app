/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { makeComponents } from '../../util/make-component-utils';
import { FloatInput, IntegerInput } from '@gridsuite/commons-ui';
import yup from '../../../../utils/yup-config';

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
    });

const IdaSolverParameters = ({ path }) => {
    const defParams = {
        [IDA_ORDER]: {
            label: 'DynamicSimulationIDASolverOrder',
            render: (defParam, key) => {
                return <IntegerInput name={`${path}.${key}`} label={''} />;
            },
        },
        [IDA_INIT_STEP]: {
            label: 'DynamicSimulationIDASolverInitStep',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [IDA_MIN_STEP]: {
            label: 'DynamicSimulationIDASolverMinStep',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [IDA_MAX_STEP]: {
            label: 'DynamicSimulationIDASolverMaxStep',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [IDA_ABS_ACCURACY]: {
            label: 'DynamicSimulationIDASolverAbsAccuracy',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [IDA_REL_ACCURACY]: {
            label: 'DynamicSimulationIDASolverRelAccuracy',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
    };

    return <>{makeComponents(defParams)}</>;
};

export default IdaSolverParameters;
