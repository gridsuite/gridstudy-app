/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponents, TYPES } from '../util/make-component-utils';
import { TimeDelay } from './dynamic-simulation-utils';

const defParams = {
    [TimeDelay.START_TIME]: {
        type: TYPES.FLOAT,
        label: 'DynamicSimulationStartTime',
    },
    [TimeDelay.STOP_TIME]: {
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
