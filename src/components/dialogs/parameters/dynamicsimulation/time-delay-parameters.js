/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { makeComponentsFor, TYPES } from '../util/make-component-utils';
import { useCallback } from 'react';

const TimeDelayParameters = ({ timeDelay, onUpdateTimeDelay }) => {
    const handleUpdateTimeDelay = useCallback(
        (newTimeDelay) => {
            onUpdateTimeDelay(newTimeDelay);
        },
        [onUpdateTimeDelay]
    );

    const defParams = {
        startTime: {
            type: TYPES.float,
            description: 'DynamicSimulationStartTime',
        },
        stopTime: {
            type: TYPES.float,
            description: 'DynamicSimulationStopTime',
        },
    };
    return (
        timeDelay && (
            <Grid container>
                {makeComponentsFor(defParams, timeDelay, handleUpdateTimeDelay)}
            </Grid>
        )
    );
};

export default TimeDelayParameters;
