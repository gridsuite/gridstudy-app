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
    ResultsTabsLevel,
    ResultTabIndexRedirection,
    useResultsTab,
} from '../use-results-tab';
import { ShortCircuitAnalysisResult } from './shortcircuit-analysis-result';
import { FormattedMessage } from 'react-intl';
import { ComputationReportViewer } from '../common/computation-report-viewer';
import { Box } from '@mui/system';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { ComputingType } from '../../computing-status/computing-type';
import { RunningStatus } from '../../utils/running-status';

interface ShortCircuitAnalysisResultTabProps {
    resultTabIndexRedirection: ResultTabIndexRedirection;
}

export const ShortCircuitAnalysisResultTab: FunctionComponent<
    ShortCircuitAnalysisResultTabProps
> = ({ resultTabIndexRedirection }) => {
    const [tabIndex, setTabIndex] = useState(
        resultTabIndexRedirection?.[ResultsTabsLevel.ONE] ?? 0
    );
    const [resultOrLogIndex, setResultOrLogIndex] = useState(0);

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const AllBusesShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
    );
    const OneBusShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    useResultsTab(resultTabIndexRedirection, setTabIndex, ResultsTabsLevel.ONE);

    const handleTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setTabIndex(newIndex);
        },
        [setTabIndex]
    );

    const handleSubTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setResultOrLogIndex(newIndex);
        },
        [setResultOrLogIndex]
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
            </Tabs>

            <Tabs value={resultOrLogIndex} onChange={handleSubTabChange}>
                <Tab label={<FormattedMessage id={'Results'} />} />
                <Tab
                    label={<FormattedMessage id={'ComputationResultsLogs'} />}
                />
            </Tabs>

            {resultOrLogIndex === 0 && (
                <ShortCircuitAnalysisResult
                    analysisType={
                        tabIndex === ShortcircuitAnalysisResultTabs.ALL_BUSES
                            ? ShortcircuitAnalysisType.ALL_BUSES
                            : ShortcircuitAnalysisType.ONE_BUS
                    }
                />
            )}
            {resultOrLogIndex === 1 &&
                ((tabIndex === ShortcircuitAnalysisResultTabs.ALL_BUSES &&
                    AllBusesShortCircuitStatus === RunningStatus.SUCCEED) ||
                    (tabIndex === ShortcircuitAnalysisResultTabs.ONE_BUS &&
                        OneBusShortCircuitStatus ===
                            RunningStatus.SUCCEED)) && (
                    <>
                        <Box sx={{ height: '4px' }}></Box>
                        <ComputationReportViewer
                            studyUuid={studyUuid}
                            nodeUuid={currentNode?.id}
                            reportType={
                                tabIndex ===
                                ShortcircuitAnalysisResultTabs.ALL_BUSES
                                    ? ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS
                                    : ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS
                            }
                        />
                    </>
                )}
        </>
    );
};
