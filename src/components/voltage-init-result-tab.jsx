/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import WaitingLoader from './utils/waiting-loader';
import VoltageInitResult from './voltage-init-result';
import { useSelector } from 'react-redux';
import { ComputingType } from './computing-status/computing-type';
import { fetchVoltageInitResult } from '../services/study/voltage-init';
import RunningStatus from './utils/running-status';

const voltageInitResultInvalidations = ['voltageInitResult'];

export const VoltageInitResultTab = ({ studyUuid, nodeUuid }) => {
    const voltageInitStatus = useSelector((state) => state.computingStatus[ComputingType.VOLTAGE_INITIALIZATION]);

    const [voltageInitResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchVoltageInitResult,
        voltageInitResultInvalidations
    );

    const voltageInitResultToShow =
        (voltageInitStatus === RunningStatus.SUCCEED || voltageInitStatus === RunningStatus.FAILED) && voltageInitResult
            ? voltageInitResult
            : null;

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <VoltageInitResult result={voltageInitResultToShow} status={voltageInitStatus} />
        </WaitingLoader>
    );
};
