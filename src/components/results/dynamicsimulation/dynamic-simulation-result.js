/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';
import DynamicSimulationResultChartTabs from './dynamic-simulation-result-chart-tabs';

const DynamicSimulationResult = ({ result = [] }) => {
    /* fake result status */
    const componentResults = [
        {
            status: 'CONVERGED',
        },
    ];

    const dynamicSimulationNotif = useSelector(
        (state) => state.dynamicSimulationNotif
    );

    return (
        <Grid container justifyContent={'column'} alignItems={'flex-end'}>
            <Grid item xs={12}>
                {result && dynamicSimulationNotif && (
                    <DynamicSimulationResultTable result={componentResults} />
                )}
            </Grid>
            <Grid item xs={12}>
                {result && dynamicSimulationNotif && (
                    <DynamicSimulationResultChartTabs result={result} />
                )}
            </Grid>
        </Grid>
    );
};

export default DynamicSimulationResult;
