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
import WaitingLoader from '../../utils/waiting-loader';

export const LoadFlowResultTab: FunctionComponent<LoadFlowTabProps> = ({
    studyUuid,
    nodeUuid,
}) => {
    const loadflowResultInvalidations = ['loadflowResult'];

    const [loadflowResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchLoadFlowResult,
        loadflowResultInvalidations
    );
    const [tabIndex, setTabIndex] = useState(0);
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
                </Tabs>
            </div>
            <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
                <LoadFlowResult
                    result={loadflowResult}
                    studyUuid={studyUuid}
                    nodeUuid={nodeUuid}
                    tabIndex={tabIndex}
                />
            </WaitingLoader>
        </>
    );
};
