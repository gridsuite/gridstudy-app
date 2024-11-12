/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { Grid } from '@mui/material';

import {
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
} from '../../../utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { FloatInput } from '@gridsuite/commons-ui';

const SensitivityAnalysisFields: FunctionComponent = () => {
    return (
        <Grid container>
            <Grid
                item
                sx={{
                    fontWeight: 'bold',
                    marginBottom: '10px',
                }}
            >
                <FormattedMessage id={'flowSensitivityValue'} />
            </Grid>
            <Grid container spacing={1}>
                <Grid item xs={4}>
                    <FloatInput
                        name={FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD}
                        label="flowFlowSensitivityValueThreshold"
                    />
                </Grid>
                <Grid item xs={4}>
                    <FloatInput
                        name={ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD}
                        label="angleFlowSensitivityValueThreshold"
                    />
                </Grid>
                <Grid item xs={4}>
                    <FloatInput
                        name={FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD}
                        label="flowVoltageSensitivityValueThreshold"
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
export default SensitivityAnalysisFields;
