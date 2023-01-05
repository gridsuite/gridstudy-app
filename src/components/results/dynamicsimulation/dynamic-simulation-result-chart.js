/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import DynamicSimulationResultSeriesList from './dynamic-simulation-result-series-list';
import { memo, useMemo, useState } from 'react';
import DynamicSimulationResultSeriesChart from './dynamic-simulation-result-series-chart';

const headers = ['Left Axis', 'Available Curves', 'Right Axis'];

const DynamicSimulationResultChart = ({ series }) => {
    console.log('Rerender DynamicSimulationResultChart', [series]);

    const [leftAxisSelected, setLeftAxisSelected] = useState([]);
    const [rightAxisSelected, setRightAxisSelected] = useState([]);

    const items = useMemo(() => {
        return series.map((s, index) => ({
            id: index,
            label: s.name,
        }));
    }, [series]);

    const leftSelectedSeries = useMemo(() => {
        return series.filter(
            (s, index) => leftAxisSelected.indexOf(index) !== -1
        );
    }, [series, leftAxisSelected]);

    const rightSelectedSeries = useMemo(() => {
        return series.filter(
            (s, index) => rightAxisSelected.indexOf(index) !== -1
        );
    }, [series, rightAxisSelected]);

    return (
        <Grid
            container
            direction={'row'}
            justifyContent={'space-between'}
            alignItems={'flex-start'}
        >
            <Grid item xs={9}>
                <DynamicSimulationResultSeriesChart
                    leftSeries={leftSelectedSeries}
                    rightSeries={rightSelectedSeries}
                />
            </Grid>
            <Grid item xs={3}>
                <DynamicSimulationResultSeriesList
                    items={items}
                    headers={headers}
                    onLeftAxisSelected={setLeftAxisSelected}
                    onRightAxisSelected={setRightAxisSelected}
                />
            </Grid>
        </Grid>
    );
};

export default memo(DynamicSimulationResultChart);
