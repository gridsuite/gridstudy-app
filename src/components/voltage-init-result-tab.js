/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import {
    fetchVoltageInitResult,
    fetchVoltageInitStatus,
} from '../utils/rest-api';
import WaitingLoader from './utils/waiting-loader';
import VoltageInitResult from './voltage-init-result';
import {
    RunningStatus,
    getVoltageInitRunningStatus,
} from './utils/running-status';

const voltageInitResultInvalidations = ['voltageInitResult'];
const voltageInitStatusInvalidations = ['voltageInitStatus'];

export const VoltageInitResultTab = ({ studyUuid, nodeUuid }) => {
    const [voltageInitResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchVoltageInitResult,
        voltageInitResultInvalidations
    );

    const [voltageInitStatus] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        RunningStatus.IDLE,
        getVoltageInitRunningStatus
    );

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <VoltageInitResult
                result={voltageInitResult}
                status={voltageInitStatus}
            />
        </WaitingLoader>
    );
};
