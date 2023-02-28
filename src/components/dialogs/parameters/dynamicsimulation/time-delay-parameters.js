/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Typography } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';
import { useCallback } from 'react';

const TimeDelayParameters = ({ timeDelay, onUpdateTimeDelay }) => {
    const handleUpdateTimeDelay = useCallback(
        (newTimeDelay) => {
            onUpdateTimeDelay({ timeDelay: newTimeDelay });
        },
        [onUpdateTimeDelay]
    );

    const defParams = {
        startTime: {
            type: TYPES.integer,
            description: 'DynamicSimulationStartTime',
        },
        stopTime: {
            type: TYPES.integer,
            description: 'DynamicSimulationStartTime',
        },
    };
    return (
        <Grid container>
            <Typography>
                {`Time delay : ${JSON.stringify(timeDelay)}`}
            </Typography>
            {makeComponentsFor(defParams, timeDelay, handleUpdateTimeDelay)}
        </Grid>
    );
};

export default TimeDelayParameters;
