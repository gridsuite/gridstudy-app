/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { LineFlowMode } from '@powsybl/network-viewer';
import {
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
} from '../../../../utils/config-params';
import LineSeparator from '../../commons/line-separator';
import { MuiSelectInput, parametersStyles, SwitchInput } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl';
import {
    INTL_LINE_FLOW_MODE_OPTIONS,
    INTL_MAP_BASE_MAP_OPTIONS,
    LINE_FLOW_MODE,
    MAP_BASE_MAP,
    MAP_MANUAL_REFRESH,
    TabValue,
} from './network-visualizations-utils';

export const MapParameters = () => {
    // fields definition
    const lineSwitch = (name: string, label: string) => (
        <>
            <Grid item xs={8} sx={parametersStyles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={parametersStyles.controlItem}>
                <SwitchInput name={`${TabValue.MAP}.${name}`} />
            </Grid>
        </>
    );

    const lineFlow = (name: string, label: string, options: { id: LineFlowMode; label: string }[]) => (
        <>
            <Grid item xs={5} sx={parametersStyles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item xs={4} sx={parametersStyles.controlItem}>
                <MuiSelectInput
                    fullWidth
                    name={`${TabValue.MAP}.${name}`}
                    size="small"
                    options={Object.values(options)?.map((option) => option)}
                />
            </Grid>
        </>
    );

    const mapBaseMap = (
        <>
            <Grid item xs={5} sx={parametersStyles.parameterName}>
                <FormattedMessage id={MAP_BASE_MAP} />
            </Grid>
            <Grid item xs={4} sx={parametersStyles.controlItem}>
                <MuiSelectInput
                    fullWidth
                    name={`${TabValue.MAP}.${PARAM_MAP_BASEMAP}`}
                    size="small"
                    options={Object.values(INTL_MAP_BASE_MAP_OPTIONS)?.map((option) => option)}
                />
            </Grid>
        </>
    );

    return (
        <Grid
            xl={6}
            container
            spacing={1}
            sx={parametersStyles.scrollableGrid}
            key={'mapParameters'}
            marginTop={-3}
            justifyContent={'space-between'}
        >
            {lineSwitch(PARAM_LINE_FULL_PATH, PARAM_LINE_FULL_PATH)}
            <LineSeparator />

            {lineSwitch(PARAM_LINE_PARALLEL_PATH, PARAM_LINE_PARALLEL_PATH)}
            <LineSeparator />

            {lineFlow(PARAM_LINE_FLOW_MODE, LINE_FLOW_MODE, INTL_LINE_FLOW_MODE_OPTIONS)}
            <LineSeparator />

            {lineSwitch(PARAM_MAP_MANUAL_REFRESH, MAP_MANUAL_REFRESH)}
            <LineSeparator />
            {mapBaseMap}
        </Grid>
    );
};
