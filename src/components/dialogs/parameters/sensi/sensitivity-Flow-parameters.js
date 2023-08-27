/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Grid } from '@mui/material';

import {
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
} from '../../../utils/field-constants';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import { FormattedMessage } from 'react-intl';
import { useStyles } from '../parameters';
const SensitivityAnalysisFields = () => {
    const classes = useStyles();

    const flowFlowSensitivityValueThresholdField = (
        <FloatInput
            name={FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD}
            label={''}
            formProps={{ margin: 'normal' }}
        />
    );

    const angleFlowSensitivityValueThresholdField = (
        <FloatInput
            name={ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD}
            label={''}
            formProps={{ margin: 'normal' }}
        />
    );

    const flowFlowSensitivityValueThresholdFieldField = (
        <FloatInput
            name={FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD}
            label={''}
            formProps={{ margin: 'normal' }}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={8} className={classes.parameterName}>
                    <FormattedMessage
                        id={'flowFlowSensitivityValueThreshold'}
                    />
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    {flowFlowSensitivityValueThresholdField}
                </Grid>

                <Grid item xs={8} className={classes.parameterName}>
                    <FormattedMessage
                        id={'angleFlowSensitivityValueThreshold'}
                    />
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    {angleFlowSensitivityValueThresholdField}
                </Grid>

                <Grid item xs={8} className={classes.parameterName}>
                    <FormattedMessage
                        id={'flowVoltageSensitivityValueThreshold'}
                    />
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    {flowFlowSensitivityValueThresholdFieldField}
                </Grid>
            </Grid>
        </>
    );
};
export default SensitivityAnalysisFields;
