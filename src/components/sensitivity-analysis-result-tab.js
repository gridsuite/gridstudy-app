/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import { fetchSensitivityAnalysisResult } from '../utils/rest-api';
import WaitingLoader from './util/waiting-loader';
import SensitivityAnalysisResult from './sensitivity-analysis-result';

const sensitivityAnalysisResultInvalidations = ['sensitivityAnalysisResult'];

export const SensitivityAnalysisResultTab = ({ studyUuid, nodeUuid }) => {
    const [sensitivityAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSensitivityAnalysisResult,
        sensitivityAnalysisResultInvalidations
    );

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <SensitivityAnalysisResult result={sensitivityAnalysisResult} />
        </WaitingLoader>
    );
};
