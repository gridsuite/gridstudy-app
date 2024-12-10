/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';

import { GENERATORS_CAPPINGS, SENSITIVITY_THRESHOLD } from '../../../utils/field-constants';
import { FormattedMessage } from 'react-intl';
import { FloatInput } from '@gridsuite/commons-ui';

const GeneratorsCappingsThreshold = () => {
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
            <Grid container spacing={1} paddingBottom={2}>
                <Grid item xs={4}>
                    <FloatInput name={`${GENERATORS_CAPPINGS}.${SENSITIVITY_THRESHOLD}`} label="sensitivityThreshold" />
                </Grid>
            </Grid>
        </Grid>
    );
};
export default GeneratorsCappingsThreshold;
