/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ComputingType from '../../computing-status/computing-type';
import { Box, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import RunningStatus from '../../utils/running-status';
import TabPanelLazy from '../common/tab-panel-lazy';
import DynamicSimulationResultTimeSeries from './dynamic-simulation-result-time-series';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';

const TAB_INDEX_TIME_SERIES = 'DynamicSimulationTabTimeSeries';
const TAB_INDEX_STATUS = 'DynamicSimulationTabStatus';

const DynamicSimulationResultTab = ({ studyUuid, nodeUuid }) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(TAB_INDEX_TIME_SERIES);

    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const dynamicSimulationResultPresent =
        dynamicSimulationStatus === RunningStatus.SUCCEED ||
        dynamicSimulationStatus === RunningStatus.FAILED;
    const handleTabChange = (_, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    return (
        <>
            <Box>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_TIME_SERIES,
                        })}
                        value={TAB_INDEX_TIME_SERIES}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_STATUS,
                        })}
                        value={TAB_INDEX_STATUS}
                    />
                </Tabs>
            </Box>
            <Box>
                <TabPanelLazy
                    key={TAB_INDEX_TIME_SERIES}
                    selected={tabIndex === TAB_INDEX_TIME_SERIES}
                >
                    {dynamicSimulationResultPresent && (
                        <DynamicSimulationResultTimeSeries
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                        />
                    )}
                </TabPanelLazy>
                <TabPanelLazy
                    key={TAB_INDEX_STATUS}
                    selected={tabIndex === TAB_INDEX_STATUS}
                >
                    {dynamicSimulationResultPresent && (
                        <DynamicSimulationResultTable
                            studyUuid={studyUuid}
                            nodeUuid={nodeUuid}
                        />
                    )}
                </TabPanelLazy>
            </Box>
        </>
    );
};

export default DynamicSimulationResultTab;
