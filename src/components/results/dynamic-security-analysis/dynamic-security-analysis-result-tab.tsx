/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SyntheticEvent, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import TabPanelLazy from '../common/tab-panel-lazy';
import { UUID } from 'crypto';
import DynamicSecurityAnalysisResultSynthesis from './dynamic-security-analysis-result-synthesis';
import DynamicSecurityAnalysisResultLogs from './dynamic-security-analysis-result-logs';

const styles = {
    resultContainer: {
        flexGrow: 1,
    },
};

const TAB_INDEX_STATUS = 'DynamicSecurityAnalysisTabStatus';
const TAB_INDEX_LOGS = 'ComputationResultsLogs';

interface DynamicSecurityAnalysisResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

function DynamicSecurityAnalysisResultTab({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}: Readonly<DynamicSecurityAnalysisResultTabProps>) {
    const intl = useIntl();

    const [tabIndex, setTabIndex] = useState(TAB_INDEX_STATUS);

    const handleTabChange = (event: SyntheticEvent, newTabIndex: string) => {
        setTabIndex(newTabIndex);
    };

    return (
        <>
            <Box>
                <Tabs value={tabIndex} onChange={handleTabChange}>
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
                <TabPanelLazy selected={tabIndex === TAB_INDEX_STATUS}>
                    <DynamicSecurityAnalysisResultSynthesis
                        studyUuid={studyUuid}
                        nodeUuid={nodeUuid}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                    />
                </TabPanelLazy>
                <TabPanelLazy selected={tabIndex === TAB_INDEX_LOGS}>
                    <DynamicSecurityAnalysisResultLogs />
                </TabPanelLazy>
            </Box>
        </>
    );
}

export default DynamicSecurityAnalysisResultTab;
