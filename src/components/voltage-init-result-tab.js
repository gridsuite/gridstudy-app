/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './run-button/use-node-data';
import { fetchVoltageInitResult } from '../utils/rest-api';
import WaitingLoader from './utils/waiting-loader';
import VoltageInitResult from './voltage-init-result';
import { RunButtonType } from './utils/running-status';
import { useSelector } from 'react-redux';

const voltageInitResultInvalidations = ['voltageInitResult'];

export const VoltageInitResultTab = ({ studyUuid, nodeUuid }) => {
    const [voltageInitResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchVoltageInitResult,
        voltageInitResultInvalidations
    );

    const voltageInitStatus = useSelector(
        (state) => state.runButtonStatus[RunButtonType.VOLTAGE_INIT]
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
