/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent } from 'react';
import { Grid } from '@mui/material';

import { SENSITIVITY_THRESHOLD } from '../../../utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { FloatInput } from '@gridsuite/commons-ui';

const GeneratorsCappingsThreshold: FunctionComponent = () => {
    return (
        <Grid container>
            <Grid
                item
                sx={{
                    fontWeight: 'bold',
                    marginBottom: '10px',
                }}
            >
                <FormattedMessage id={'generatorsCappingSensitivityValue'} />
            </Grid>
            <Grid container spacing={1}>
                <Grid item xs={4}>
                    <FloatInput
                        name={SENSITIVITY_THRESHOLD}
                        label="sensitivityThreshold"
                        formProps={{ margin: '1' }}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
export default GeneratorsCappingsThreshold;
