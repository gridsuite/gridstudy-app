/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { Grid } from '@mui/material';

import {
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
} from '../../../utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { useStyles } from '../parameters';
import { FloatInput } from '@gridsuite/commons-ui';

interface IFlowInputParameters {
    formattedMessageId: string;
    name: string;
}

const SensitivityAnalysisFields: FunctionComponent = () => {
    const classes = useStyles();

    const flowInputParameters: IFlowInputParameters[] = [
        {
            formattedMessageId: 'flowFlowSensitivityValueThreshold',
            name: FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
        },
        {
            formattedMessageId: 'angleFlowSensitivityValueThreshold',
            name: ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
        },
        {
            formattedMessageId: 'flowVoltageSensitivityValueThreshold',
            name: FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
        },
    ];
    const renderInput = (input: IFlowInputParameters) => {
        return (
            <React.Fragment key={input.formattedMessageId}>
                <Grid
                    item
                    xs={8}
                    alignItems="center"
                    className={classes.parameterName}
                >
                    <FormattedMessage id={input.formattedMessageId} />
                </Grid>
                <Grid
                    item
                    xs={4}
                    className={classes.controlItem}
                    alignItems="center"
                >
                    <FloatInput
                        name={input.name}
                        label={''}
                        formProps={{ margin: '1' }}
                    />
                </Grid>
            </React.Fragment>
        );
    };

    return (
        <Grid container spacing={1}>
            {flowInputParameters.map((input) => renderInput(input))}
        </Grid>
    );
};
export default SensitivityAnalysisFields;
