/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Grid } from '@mui/material';
import {
    PARAM_DEVELOPER_MODE,
    PARAM_FLUX_CONVENTION,
} from '../../../utils/config-params';
import { LabelledButton, useParameterState, styles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import Alert from '@mui/material/Alert';
import { fetchDefaultParametersValues } from '../../../services/utils';
import { ParamLine, ParameterType } from './widget';
import { mergeSx } from '../../utils/functions';

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

export const NetworkParameters = () => {
    const [, handleChangeFluxConvention] = useParameterState(
        PARAM_FLUX_CONVENTION
    );
    const [enableDeveloperMode, handleChangeEnableDeveloperMode] =
        useParameterState(PARAM_DEVELOPER_MODE);
    const resetNetworkParameters = () => {
        fetchDefaultParametersValues().then((defaultValues) => {
            const defaultFluxConvention = defaultValues.fluxConvention;
            if (
                Object.values(FluxConventions).includes(defaultFluxConvention)
            ) {
                handleChangeFluxConvention(defaultFluxConvention);
            }
            handleChangeEnableDeveloperMode(
                defaultValues?.enableDeveloperMode ?? false
            );
        });
    };

    return (
        <>
            <Grid
                container
                spacing={1}
                key={'networkParameters'}
                sx={styles.scrollableGrid}
            >
                <ParamLine
                    type={ParameterType.DropDown}
                    param_name_id={PARAM_FLUX_CONVENTION}
                    labelTitle="FluxConvention"
                    labelValue="flux-convention-select-label"
                    values={{
                        [FluxConventions.IIDM]: 'FluxConvention.iidm',
                        [FluxConventions.TARGET]: 'FluxConvention.target',
                    }}
                />
                <LineSeparator />
                <Grid item container xs={12}>
                    <ParamLine
                        type={ParameterType.Switch}
                        param_name_id={PARAM_DEVELOPER_MODE}
                        label="EnableDeveloperMode"
                    />
                    {enableDeveloperMode && (
                        <Alert severity={'warning'}>
                            <FormattedMessage id="DeveloperModeWarningMsg" />
                        </Alert>
                    )}
                </Grid>
            </Grid>
            <LineSeparator />
            <Grid
                container
                sx={mergeSx(styles.controlItem, styles.marginTopButton)}
            >
                <LabelledButton
                    callback={resetNetworkParameters}
                    label="resetToDefault"
                />
            </Grid>
        </>
    );
};
