/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { ESTIM_ALGO_TYPE, ESTIM_LOG_LEVEL, PRINCIPAL_OBSERVABLE_ZONE } from 'components/utils/field-constants';
import { estimAlgoTypeValues, estimLogLevelValues, TabValue } from './state-estimation-parameters-utils';
import { FieldLabel, MuiSelectInput, SwitchInput } from '@gridsuite/commons-ui';
import { styles } from '../parameters-style';

export const StateEstimationGeneralParameters = () => {
    return (
        <Grid container>
            <Grid container item alignItems="center" spacing={2} direction={'row'}>
                <Grid item xs={10} sx={styles.parameterName}>
                    <FieldLabel label={'StateEstimationParametersPrincipalObservableZoneLabel'} />
                </Grid>
                <Grid item xs={2}>
                    <SwitchInput name={`${TabValue.GENERAL}.${PRINCIPAL_OBSERVABLE_ZONE}`} />
                </Grid>
            </Grid>

            <Grid container item spacing={1} paddingTop={3}>
                <Grid item xs={8} sx={styles.parameterName}>
                    <FieldLabel label={'StateEstimationParametersLogLevelLabel'} />
                </Grid>
                <Grid item xs={4}>
                    <MuiSelectInput
                        name={`${TabValue.GENERAL}.${ESTIM_LOG_LEVEL}`}
                        options={estimLogLevelValues}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid container item spacing={1} paddingTop={3}>
                <Grid item xs={8} sx={styles.parameterName}>
                    <FieldLabel label={'StateEstimationParametersAlgoTypeLabel'} />
                </Grid>
                <Grid item xs={4}>
                    <MuiSelectInput
                        name={`${TabValue.GENERAL}.${ESTIM_ALGO_TYPE}`}
                        options={estimAlgoTypeValues}
                        fullWidth
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
