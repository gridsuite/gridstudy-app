/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid, Slider } from '@mui/material';
import { LineFlowColorMode, LineFlowMode } from '@powsybl/network-viewer';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
} from '../../../../utils/config-params';
import LineSeparator from '../../commons/line-separator';
import { mergeSx, MuiSelectInput, SwitchInput } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl';
import {
    ALERT_THRESHOLD_LABEL,
    INTL_LINE_FLOW_COLOR_MODE_OPTIONS,
    INTL_LINE_FLOW_MODE_OPTIONS,
    INTL_MAP_BASE_MAP_OPTIONS,
    LINE_FLOW_COLOR_MODE,
    LINE_FLOW_MODE,
    MAP_BASE_MAP,
    MAP_MANUAL_REFRESH,
    TabValue,
} from './network-visualizations-utils';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { styles } from '../parameters-style';

export const MapParameters = () => {
    const { setValue, getValues, control } = useFormContext();
    const alertThresholdMarks = [
        {
            value: 0,
            label: '0',
        },
        {
            value: 100,
            label: '100',
        },
    ];
    const watchLineFlowColorMode = useWatch({
        name: `${TabValue.MAP}.${PARAM_LINE_FLOW_COLOR_MODE}`,
    });

    const onSliderChange = (value: number) => {
        const dirty = { shouldDirty: true };
        setValue(`${TabValue.MAP}.${PARAM_LINE_FLOW_ALERT_THRESHOLD}`, value, dirty);
    };

    // fields definition
    const lineSwitch = (name: string, label: string) => (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <SwitchInput name={`${TabValue.MAP}.${name}`} />
            </Grid>
        </>
    );

    const lineFlow = (
        name: string,
        label: string,
        options: { id: LineFlowColorMode | LineFlowMode; label: string }[]
    ) => (
        <>
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item xs={4} sx={styles.controlItem}>
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
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={MAP_BASE_MAP} />
            </Grid>
            <Grid item xs={4} sx={styles.controlItem}>
                <MuiSelectInput
                    fullWidth
                    name={`${TabValue.MAP}.${PARAM_MAP_BASEMAP}`}
                    size="small"
                    options={Object.values(INTL_MAP_BASE_MAP_OPTIONS)?.map((option) => option)}
                />
            </Grid>
        </>
    );

    const slider = (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={ALERT_THRESHOLD_LABEL} />
            </Grid>
            <Grid item container xs={4} sx={mergeSx(styles.controlItem, { paddingRight: 2 })}>
                <Controller
                    name={`${TabValue.MAP}.${PARAM_LINE_FLOW_ALERT_THRESHOLD}`}
                    control={control}
                    render={() => (
                        <Slider
                            name={`${TabValue.MAP}.${PARAM_LINE_FLOW_ALERT_THRESHOLD}`}
                            onChange={(_event, newValue) => {
                                onSliderChange(Number(newValue));
                            }}
                            valueLabelDisplay="auto"
                            max={100}
                            min={0}
                            value={Number(getValues(`${TabValue.MAP}.${PARAM_LINE_FLOW_ALERT_THRESHOLD}`))}
                            marks={alertThresholdMarks}
                            disabled={watchLineFlowColorMode === LineFlowColorMode.NOMINAL_VOLTAGE}
                        />
                    )}
                />
            </Grid>
        </>
    );

    return (
        <Grid
            xl={6}
            container
            spacing={1}
            sx={styles.scrollableGrid}
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

            {lineFlow(PARAM_LINE_FLOW_COLOR_MODE, LINE_FLOW_COLOR_MODE, INTL_LINE_FLOW_COLOR_MODE_OPTIONS)}
            <LineSeparator />

            {slider}
            <LineSeparator />

            {lineSwitch(PARAM_MAP_MANUAL_REFRESH, MAP_MANUAL_REFRESH)}
            <LineSeparator />
            {mapBaseMap}
        </Grid>
    );
};
