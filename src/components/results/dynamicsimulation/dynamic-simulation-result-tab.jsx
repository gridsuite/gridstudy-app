/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import TabPanelLazy from '../common/tab-panel-lazy';
import DynamicSimulationResultTimeSeries from './dynamic-simulation-result-time-series';
import DynamicSimulationResultSynthesis from './dynamic-simulation-result-synthesis';
import DynamicSimulationResultTimeline from './dynamic-simulation-result-timeline';
import DynamicSimulationResultLogs from './dynamic-simulation-result-logs';

const styles = {
    resultContainer: {
        flexGrow: 1,
    },
};

const TAB_INDEX_TIME_SERIES = 'DynamicSimulationTabTimeSeries';
const TAB_INDEX_TIMELINE = 'DynamicSimulationTabTimeline';
const TAB_INDEX_STATUS = 'DynamicSimulationTabStatus';
const TAB_INDEX_LOGS = 'ComputationResultsLogs';

const DynamicSimulationResultTab = ({ studyUuid, nodeUuid, currentRootNetworkUuid }) => {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(TAB_INDEX_TIME_SERIES);

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
                            id: TAB_INDEX_TIMELINE,
                        })}
                        value={TAB_INDEX_TIMELINE}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_STATUS,
                        })}
                        value={TAB_INDEX_STATUS}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_LOGS,
                        })}
                        value={TAB_INDEX_LOGS}
                    />
                </Tabs>
            </Box>
            <Box sx={styles.resultContainer}>
                <TabPanelLazy selected={tabIndex === TAB_INDEX_TIME_SERIES}>
                    <DynamicSimulationResultTimeSeries
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                </TabPanelLazy>
                <TabPanelLazy selected={tabIndex === TAB_INDEX_TIMELINE}>
                    <DynamicSimulationResultTimeline
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                </TabPanelLazy>
                <TabPanelLazy selected={tabIndex === TAB_INDEX_STATUS}>
                    <DynamicSimulationResultSynthesis
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                </TabPanelLazy>
                <TabPanelLazy selected={tabIndex === TAB_INDEX_LOGS}>
                    <DynamicSimulationResultLogs />
                </TabPanelLazy>
            </Box>
        </>
    );
};

export default DynamicSimulationResultTab;
