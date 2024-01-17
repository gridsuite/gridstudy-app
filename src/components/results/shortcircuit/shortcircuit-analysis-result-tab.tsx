/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, LinearProgress, Tab, Tabs } from '@mui/material';
import React, {
    FunctionComponent,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { ShortCircuitAnalysisResultTabs } from './shortcircuit-analysis-result.type';
import {
    computingTypeToShortcircuitTabRedirection,
    ResultTabIndexRedirection,
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
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';

interface ShortCircuitAnalysisResultTabProps {
    view: string;
}

export const ShortCircuitAnalysisResultTab: FunctionComponent<
    ShortCircuitAnalysisResultTabProps
> = ({ view }) => {
    const lastCompletedComputation = useSelector(
        (state: ReduxState) => state.lastCompletedComputation
    );

    const resultTabIndexRedirection = useMemo<ResultTabIndexRedirection>(
        () =>
            computingTypeToShortcircuitTabRedirection(lastCompletedComputation),
        [lastCompletedComputation]
    );

    const [tabIndex, setTabIndex] = useState<number>(resultTabIndexRedirection);

    const [resultOrLogIndex, setResultOrLogIndex] = useState(0);

    const AllBusesShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
    );
    const OneBusShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const setRedirectionLock = useResultsTab(
        resultTabIndexRedirection,
        setTabIndex,
        view
    );

    const handleTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setTabIndex(newIndex);
            //when we manually browse results we ought to block further redirections until the next completed computation
            setRedirectionLock(true);
        },
        [setTabIndex, setRedirectionLock]
    );

    const RESULTS_TAB_INDEX = 0;
    const LOGS_TAB_INDEX = 1;

    const handleSubTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setResultOrLogIndex(newIndex);
        },
        [setResultOrLogIndex]
    );

    const shortCircuitTabResultStatusSucceedOrFailed = useMemo(() => {
        return (
            (tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES &&
                (AllBusesShortCircuitStatus === RunningStatus.SUCCEED ||
                    AllBusesShortCircuitStatus === RunningStatus.FAILED)) ||
            (tabIndex === ShortCircuitAnalysisResultTabs.ONE_BUS &&
                (OneBusShortCircuitStatus === RunningStatus.SUCCEED ||
                    OneBusShortCircuitStatus === RunningStatus.FAILED))
        );
    }, [AllBusesShortCircuitStatus, OneBusShortCircuitStatus, tabIndex]);

    const shortCircuitTabIsRunning = useMemo(() => {
        return tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES
            ? AllBusesShortCircuitStatus
            : OneBusShortCircuitStatus;
    }, [AllBusesShortCircuitStatus, OneBusShortCircuitStatus, tabIndex]);

    const openLoader = useOpenLoaderShortWait({
        isLoading: shortCircuitTabIsRunning === RunningStatus.RUNNING,
        delay: RESULTS_LOADING_DELAY,
    });

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

            {resultOrLogIndex === RESULTS_TAB_INDEX &&
                (tabIndex === ShortCircuitAnalysisResultTabs.ALL_BUSES ? (
                    <ShortCircuitAnalysisAllBusesResult />
                ) : (
                    <ShortCircuitAnalysisOneBusResult />
                ))}

            {resultOrLogIndex === LOGS_TAB_INDEX && (
                <>
                    <Box sx={{ height: '4px' }}>
                        {openLoader && <LinearProgress />}
                    </Box>
                    {shortCircuitTabResultStatusSucceedOrFailed && (
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
            )}
        </>
    );
};
