/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Grid } from '@mui/material';
import { LineFlowColorMode, LineFlowMode } from '@powsybl/diagram-viewer';
import { useState } from 'react';
import {
    MAP_BASEMAP_CARTO,
    MAP_BASEMAP_CARTO_NOLABEL,
    MAP_BASEMAP_MAPBOX,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
} from '../../../../utils/config-params';
import { LineSeparator } from '../../dialog-utils';
import { styles, useParameterState } from '../parameters';
import ParameterLineDropdown from '../widget/parameter-line-dropdown';
import ParameterLineSlider from '../widget/parameter-line-slider';
import ParameterLineSwitch from '../widget/parameter-line-switch';

export const MapParameters = () => {
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

    const [lineFlowColorModeLocal] = useParameterState(PARAM_LINE_FLOW_COLOR_MODE);

    const [disabledFlowAlertThreshold, setDisabledFlowAlertThreshold] = useState(
        lineFlowColorModeLocal === LineFlowColorMode.NOMINAL_VOLTAGE
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
            <ParameterLineSwitch paramNameId={PARAM_LINE_FULL_PATH} label="lineFullPath" />
            <LineSeparator />
            <ParameterLineSwitch paramNameId={PARAM_LINE_PARALLEL_PATH} label="lineParallelPath" />
            <LineSeparator />
            <ParameterLineDropdown
                paramNameId={PARAM_LINE_FLOW_MODE}
                labelTitle="LineFlowMode"
                labelValue="line-flow-mode-select-label"
                values={{
                    [LineFlowMode.STATIC_ARROWS]: 'StaticArrows',
                    [LineFlowMode.ANIMATED_ARROWS]: 'AnimatedArrows',
                    [LineFlowMode.FEEDERS]: 'Feeders',
                }}
            />
            <LineSeparator />
            <ParameterLineDropdown
                paramNameId={PARAM_LINE_FLOW_COLOR_MODE}
                labelTitle="LineFlowColorMode"
                labelValue="line-flow-color-mode-select-label"
                values={{
                    [LineFlowColorMode.NOMINAL_VOLTAGE]: 'NominalVoltage',
                    [LineFlowColorMode.OVERLOADS]: 'Overloads',
                }}
                onPreChange={(event) => {
                    setDisabledFlowAlertThreshold(event.target.value === LineFlowColorMode.NOMINAL_VOLTAGE);
                }}
            />
            <LineSeparator />
            <ParameterLineSlider
                paramNameId={PARAM_LINE_FLOW_ALERT_THRESHOLD}
                label="AlertThresholdLabel"
                disabled={disabledFlowAlertThreshold}
                marks={alertThresholdMarks}
            />
            <LineSeparator />
            <ParameterLineSwitch paramNameId={PARAM_MAP_MANUAL_REFRESH} label="MapManualRefresh" />
            <LineSeparator />
            <ParameterLineDropdown
                paramNameId={PARAM_MAP_BASEMAP}
                labelTitle="MapBaseMap"
                labelValue="map-base-map-select-label"
                values={{
                    [MAP_BASEMAP_MAPBOX]: 'Mapbox',
                    [MAP_BASEMAP_CARTO]: 'Carto',
                    [MAP_BASEMAP_CARTO_NOLABEL]: 'CartoNoLabel',
                }}
            />
        </Grid>
    );
};
