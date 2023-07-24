/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { LineFlowMode, LineFlowColorMode } from '../../network/line-layer';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_MANUAL_REFRESH,
} from '../../../utils/config-params';
import { CloseButton, useParameterState, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import { ParamLine, ParameterType } from './widget/ParameterLine';

export const MapParameters = ({ hideParameters }) => {
    const classes = useStyles();

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

    const [lineFlowColorModeLocal] = useParameterState(
        PARAM_LINE_FLOW_COLOR_MODE
    );
    const isLineFlowNominal =
        lineFlowColorModeLocal === LineFlowColorMode.NOMINAL_VOLTAGE;

    return (
        <>
            <Grid
                container
                spacing={1}
                className={classes.scrollableGrid}
                key={'mapParameters'}
            >
                <ParamLine
                    type={ParameterType.Switch}
                    param_name_id={PARAM_LINE_FULL_PATH}
                    label="lineFullPath"
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.Switch}
                    param_name_id={PARAM_LINE_PARALLEL_PATH}
                    label="lineParallelPath"
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.DropDown}
                    param_name_id={PARAM_LINE_FLOW_MODE}
                    labelTitle="LineFlowMode"
                    labelValue="line-flow-mode-select-label"
                    values={{
                        [LineFlowMode.STATIC_ARROWS]: 'StaticArrows',
                        [LineFlowMode.ANIMATED_ARROWS]: 'AnimatedArrows',
                        [LineFlowMode.FEEDERS]: 'Feeders',
                    }}
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.DropDown}
                    param_name_id={PARAM_LINE_FLOW_COLOR_MODE}
                    labelTitle="LineFlowColorMode"
                    labelValue="line-flow-color-mode-select-label"
                    values={{
                        [LineFlowColorMode.NOMINAL_VOLTAGE]: 'NominalVoltage',
                        [LineFlowColorMode.OVERLOADS]: 'Overloads',
                    }}
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.Slider}
                    param_name_id={PARAM_LINE_FLOW_ALERT_THRESHOLD}
                    label="AlertThresholdLabel"
                    disabled={isLineFlowNominal}
                    marks={alertThresholdMarks}
                />
                <LineSeparator />
                <ParamLine
                    type={ParameterType.Switch}
                    param_name_id={PARAM_MAP_MANUAL_REFRESH}
                    label="MapManualRefresh"
                    marks={alertThresholdMarks}
                />
            </Grid>
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
