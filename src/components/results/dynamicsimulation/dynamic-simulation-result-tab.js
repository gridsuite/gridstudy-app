/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useNodeData } from '../../study-container';
import {
    fetchDynamicSimulationResult,
    fetchDynamicSimulationResultTimeLine,
    fetchDynamicSimulationResultTimeSeries,
} from '../../../utils/rest-api';
import WaitingLoader from '../../util/waiting-loader';
import DynamicSimulationResult from './dynamic-simulation-result';

const dynamicSimulationResultInvalidations = ['DynamicSimulationResults'];
const loadingMessage = 'LoadingRemoteData';

const DynamicSimulationResultTab = ({ studyUuid, nodeUuid }) => {
    const [dynamicSimulationResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationResultTimeSeries,
        dynamicSimulationResultInvalidations
    );
    return (
        <WaitingLoader message={loadingMessage} loading={isWaiting}>
            <DynamicSimulationResult result={dynamicSimulationResult} />
        </WaitingLoader>
    );
};

export default DynamicSimulationResultTab;
