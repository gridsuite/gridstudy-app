/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import TabPanelLazy from '../common/tab-panel-lazy';
import DynamicSimulationResultTimeSeries from './dynamic-simulation-result-time-series';
import DynamicSimulationResultTable from './dynamic-simulation-result-table';
import DynamicSimulationResultTimeLine from './dynamic-simulation-result-time-line';

const styles = {
    resultContainer: {
        flexGrow: 1,
    },
};

const TAB_INDEX_TIME_SERIES = 'DynamicSimulationTabTimeSeries';
const TAB_INDEX_TIME_LINE = 'DynamicSimulationTabTimeLine';
const TAB_INDEX_STATUS = 'DynamicSimulationTabStatus';

const DynamicSimulationResultTab = ({ studyUuid, nodeUuid }) => {
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
                            id: TAB_INDEX_TIME_LINE,
                        })}
                        value={TAB_INDEX_TIME_LINE}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: TAB_INDEX_STATUS,
                        })}
                        value={TAB_INDEX_STATUS}
                    />
                </Tabs>
            </Box>
            <Box sx={styles.resultContainer}>
                <TabPanelLazy
                    key={TAB_INDEX_TIME_SERIES}
                    selected={tabIndex === TAB_INDEX_TIME_SERIES}
                >
                    <DynamicSimulationResultTimeSeries
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                    />
                </TabPanelLazy>
                <TabPanelLazy
                    key={TAB_INDEX_TIME_SERIES}
                    selected={tabIndex === TAB_INDEX_TIME_LINE}
                >
                    <DynamicSimulationResultTimeLine
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                    />
                </TabPanelLazy>
                <TabPanelLazy
                    key={TAB_INDEX_STATUS}
                    selected={tabIndex === TAB_INDEX_STATUS}
                >
                    <DynamicSimulationResultTable
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                    />
                </TabPanelLazy>
            </Box>
        </>
    );
};

export default DynamicSimulationResultTab;
