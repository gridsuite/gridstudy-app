/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tab, Tabs } from '@mui/material';
import { FunctionComponent, useCallback, useState } from 'react';
import {
    ShortcircuitAnalysisResultTabs,
    ShortcircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import {
    ResultTabIndexRedirection,
    ResultsTabsLevel,
    useResultsTab,
} from '../use-results-tab';
import { ShortCircuitAnalysisResult } from './shortcircuit-analysis-result';
import { FormattedMessage } from 'react-intl';
import {
    ComputationReportType,
    ComputationReportViewer,
} from '../common/computation-report-viewer';
import { Box } from '@mui/system';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';

interface ShortCircuitAnalysisResultTabProps {
    resultTabIndexRedirection: ResultTabIndexRedirection;
}

export const ShortCircuitAnalysisResultTab: FunctionComponent<
    ShortCircuitAnalysisResultTabProps
> = ({ resultTabIndexRedirection }) => {
    const [tabIndex, setTabIndex] = useState(
        resultTabIndexRedirection?.[ResultsTabsLevel.ONE] ?? 0
    );

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    useResultsTab(resultTabIndexRedirection, setTabIndex, ResultsTabsLevel.ONE);

    const handleTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setTabIndex(newIndex);
        },
        [setTabIndex]
    );

    return (
        <>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab
                    label={
                        <FormattedMessage
                            id={'ShortCircuitAnalysisTabAllBuses'}
                        />
                    }
                />
                <Tab
                    label={
                        <FormattedMessage
                            id={'ShortCircuitAnalysisTabOneBus'}
                        />
                    }
                />
                <Tab
                    label={<FormattedMessage id={'ComputationResultsLogs'} />}
                />
            </Tabs>
            {tabIndex === ShortcircuitAnalysisResultTabs.ALL_BUSES && (
                <ShortCircuitAnalysisResult
                    analysisType={ShortcircuitAnalysisType.ALL_BUSES}
                />
            )}
            {tabIndex === ShortcircuitAnalysisResultTabs.ONE_BUS && (
                <ShortCircuitAnalysisResult
                    analysisType={ShortcircuitAnalysisType.ONE_BUS}
                />
            )}
            {tabIndex === ShortcircuitAnalysisResultTabs.LOGS && (
                <>
                    <Box sx={{ height: '4px' }}></Box>
                    <ComputationReportViewer
                        studyUuid={studyUuid}
                        nodeUuid={currentNode?.id}
                        reportType={
                            ComputationReportType.SHORT_CIRCUIT_ANALYSIS
                        }
                    />
                </>
            )}
        </>
    );
};
