/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Tab, Tabs } from '@mui/material';
import { FunctionComponent, useCallback, useState } from 'react';
import { ShortCircuitAnalysisResultTabs } from './shortcircuit-analysis-result.type';
import {
    ResultTabIndexRedirection,
    ResultsTabsLevel,
    useResultsTab,
} from '../use-results-tab';
import { FormattedMessage } from 'react-intl';
import { ComputationReportViewer } from '../common/computation-report-viewer';

import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { ComputingType } from '../../computing-status/computing-type';
import { RunningStatus } from '../../utils/running-status';
import { ShortCircuitAnalysisOneBusResult } from './shortcircuit-analysis-one-bus-result';
import { ShortCircuitAnalysisAllBusesResult } from 'components/results/shortcircuit/shortcircuit-analysis-all-buses-result';
import { REPORT_TYPES } from '../../utils/report-type';

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

            {resultOrLogIndex === 0 &&
                (tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES ? (
                    <ShortCircuitAnalysisAllBusesResult />
                ) : (
                    <ShortCircuitAnalysisOneBusResult />
                ))}

            {resultOrLogIndex === 1 &&
                ((tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES &&
                    AllBusesShortCircuitStatus === RunningStatus.SUCCEED) ||
                    (tabIndex === ShortCircuitAnalysisResultTabs.ONE_BUS &&
                        OneBusShortCircuitStatus ===
                            RunningStatus.SUCCEED)) && (
                    <ComputationReportViewer
                        reportType={
                            tabIndex ===
                            ShortCircuitAnalysisResultTabs.ALL_BUSES
                                ? REPORT_TYPES.ALL_BUSES_SHORTCIRCUIT_ANALYSIS
                                : REPORT_TYPES.ONE_BUS_SHORTCIRCUIT_ANALYSIS
                        }
                    />
                )}
        </>
    );
};
