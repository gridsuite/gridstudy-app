/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import { fetchLoadFlowResult } from '../utils/rest-api';
import WaitingLoader from './utils/waiting-loader';
import { RunButtonType } from './utils/running-status';
import LoadFlowResult from './loadflow-result';
import { useSelector } from 'react-redux';

const loadflowResultInvalidations = ['loadflowResult'];

export const LoadFlowResultTab = ({ studyUuid, nodeUuid }) => {
    const loadflowStatus = useSelector(
        (state) => state.runButtonStatus[RunButtonType.LOADFLOW]
    );
    const [loadflowResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchLoadFlowResult,
        loadflowResultInvalidations
    );

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <LoadFlowResult
                result={loadflowResult}
                status={loadflowStatus}
                studyUuid={studyUuid}
                nodeUuid={nodeUuid}
            />
        </WaitingLoader>
    );
};
