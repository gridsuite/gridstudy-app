/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { makeComponents } from '../util/make-component-utils';
import { FloatInput } from '@gridsuite/commons-ui';

export const TIME_DELAY = 'timeDelay';

export const START_TIME = 'startTime';
export const STOP_TIME = 'stopTime';

export const formSchema = yup.object().shape({
    [START_TIME]: yup.number().required(),
    [STOP_TIME]: yup
        .number()
        .required()
        .when([START_TIME], ([startTime], schema) => {
            if (startTime) {
                return schema.min(
                    startTime,
                    'DynamicSimulationStartTimeGreaterThanOrEqualToStopTime'
                );
            }
        }),
});

export const emptyFormData = {
    [START_TIME]: 0,
    [STOP_TIME]: 0,
};

const TimeDelayParameters = ({ path }) => {
    // define param structure for rendering inputs
    const defParams = {
        [START_TIME]: {
            label: 'DynamicSimulationStartTime',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
        [STOP_TIME]: {
            label: 'DynamicSimulationStopTime',
            render: (defParam, key) => {
                return <FloatInput name={`${path}.${key}`} label={''} />;
            },
        },
    };

    return <Grid container>{makeComponents(defParams)}</Grid>;
};

export default TimeDelayParameters;
