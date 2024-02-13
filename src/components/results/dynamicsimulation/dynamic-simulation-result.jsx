/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';
import DynamicSimulationResultChartTabs from './dynamic-simulation-result-chart-tabs';
import { Box } from '@mui/material';
import ComputingType from 'components/computing-status/computing-type';
import RunningStatus from 'components/utils/running-status';

const DynamicSimulationResult = ({ result, loadTimeSeries }) => {
    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const dynamicSimulationResultPresent =
        dynamicSimulationStatus === RunningStatus.SUCCEED ||
        dynamicSimulationStatus === RunningStatus.FAILED;

    return (
        <Box
            sx={{
                height: '100%',
            }}
        >
            <Box>
                {result && dynamicSimulationResultPresent && (
                    <DynamicSimulationResultTable
                        result={[
                            {
                                status: result.status,
                            },
                        ]}
                    />
                )}
            </Box>
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'hidden',
                }}
            >
                {result &&
                    result.timeseriesMetadatas &&
                    dynamicSimulationResultPresent && (
                        <DynamicSimulationResultChartTabs
                            result={{
                                timeseriesMetadatas: result.timeseriesMetadatas,
                            }}
                            loadTimeSeries={loadTimeSeries}
                        />
                    )}
            </Box>
        </Box>
    );
};

DynamicSimulationResult.propTypes = {
    result: PropTypes.shape({
        status: PropTypes.string,
        timeseriesMetadatas: PropTypes.arrayOf(
            PropTypes.shape({ name: PropTypes.string.isRequired })
        ),
    }),
    loadTimeSeries: PropTypes.func,
};

export default DynamicSimulationResult;
