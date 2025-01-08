/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import { fetchDefaultParametersValues } from '../../../services/utils';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import { mergeSx } from '../../utils/functions';
import { LabelledButton, styles, useParameterState } from './parameters';
import ParameterLineSwitch from './widget/parameter-line-switch';
import LineSeparator from '../commons/line-separator';
import { useSnackMessage } from '@gridsuite/commons-ui';

export const NetworkParameters = () => {
    const { snackError } = useSnackMessage();
    const [enableDeveloperMode, handleChangeEnableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const resetNetworkParameters = () => {
        fetchDefaultParametersValues()
            .then((defaultValues) => {
                handleChangeEnableDeveloperMode(defaultValues?.enableDeveloperMode ?? false);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsRetrievingError',
                });
            });
    };

    return (
        <>
            <Grid xl={6} sx={{ height: '100%' }}>
                <Grid
                    container
                    spacing={1}
                    key={'networkParameters'}
                    sx={styles.scrollableGrid}
                    marginTop={-3}
                    justifyContent={'space-between'}
                >
                    <Grid item container xs={12}>
                        <ParameterLineSwitch paramNameId={PARAM_DEVELOPER_MODE} label="EnableDeveloperMode" />
                        {enableDeveloperMode && (
                            <Alert severity={'warning'}>
                                <FormattedMessage id="DeveloperModeWarningMsg" />
                            </Alert>
                        )}
                    </Grid>
                </Grid>
                <LineSeparator />
            </Grid>
            <Grid container sx={mergeSx(styles.controlParametersItem, styles.marginTopButton)}>
                <LabelledButton callback={resetNetworkParameters} label="resetToDefault" />
            </Grid>
        </>
    );
};
