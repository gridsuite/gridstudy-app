/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage } from 'react-intl/lib';
import { LoadFlowTabProps } from './load-flow-result.type';
import { LoadFlowResult } from './load-flow-result';
import { useNodeData } from '../../study-container';
import { fetchLoadFlowResult } from '../../../services/study/loadflow';
import { LimiViolationResult } from './limit-violation-result';
import { REPORT_TYPES } from 'components/utils/report-type';
import RunningStatus from 'components/utils/running-status';
import { ReduxState } from 'redux/reducer.type';
import ComputingType from 'components/computing-status/computing-type';
import { useSelector } from 'react-redux';
import { ComputationReportViewer } from '../common/computation-report-viewer';

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
}) => {
    const loadflowResultInvalidations = ['loadflowResult'];

    const [tabIndex, setTabIndex] = useState(0);
    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const [loadflowResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchLoadFlowResult,
        loadflowResultInvalidations
    );
    return (
        <>
            <div>
                <Tabs
                    value={tabIndex}
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    <Tab
                        label={
                            <FormattedMessage
                                id={'LoadFlowResultsCurrentViolations'}
                            />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage
                                id={'LoadFlowResultsVoltageViolations'}
                            />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage id={'LoadFlowResultsStatus'} />
                        }
                    />
                    <Tab
                        label={
                            <FormattedMessage id={'ComputationResultsLogs'} />
                        }
                    />
                </Tabs>
            </div>

            {(tabIndex === 0 || tabIndex === 1) && (
                <LimiViolationResult
                    result={loadflowResult}
                    studyUuid={studyUuid}
                    nodeUuid={nodeUuid}
                    tabIndex={tabIndex}
                    isWaiting={isWaiting}
                />
            )}
            {tabIndex === 2 && (
                <LoadFlowResult
                    result={loadflowResult}
                    studyUuid={studyUuid}
                    nodeUuid={nodeUuid}
                    tabIndex={tabIndex}
                    isWaiting={isWaiting}
                />
            )}
            {tabIndex === 3 &&
                (loadFlowStatus === RunningStatus.SUCCEED ||
                    loadFlowStatus === RunningStatus.FAILED) && (
                    <ComputationReportViewer
                        reportType={REPORT_TYPES.LOADFLOW}
                    />
                )}
        </>
    );
};
