/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';

export const START_TIME = 'startTime';
export const STOP_TIME = 'stopTime';

export const formSchema = yup.object().shape({
    [START_TIME]: yup.number().required().nonNullable(),
    [STOP_TIME]: yup
        .number()
        .required()
        .when([START_TIME], ([startTime], schema) => {
            if (startTime) {
                return schema.min(startTime, 'DynamicSimulationStopTimeMustBeGreaterThanOrEqualToStartTime');
            }
            return schema;
        }),
});

export const emptyFormData = {
    [START_TIME]: 0,
    [STOP_TIME]: 0,
};

const defParams = {
    [START_TIME]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationStartTime',
    },
    [STOP_TIME]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationStopTime',
    },
};

const TimeDelayParameters = ({ path }: { path: string }) => {
    return (
        <Grid xl={8} container>
            {makeComponents(defParams, path)}
        </Grid>
    );
};

export default TimeDelayParameters;
