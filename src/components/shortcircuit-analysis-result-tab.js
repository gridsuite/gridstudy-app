/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from './study-container';
import { fetchShortCircuitAnalysisResult } from '../utils/rest-api';
import WaitingLoader from './util/waiting-loader';
import ShortCircuitAnalysisResult from './shortcircuit-analysis-result';

const shortCircuitAnalysisResultInvalidations = ['shortCircuitAnalysisResult'];

export const ShortCircuitAnalysisResultTab = ({ studyUuid, nodeUuid, dormant }) => {
    const [shortCircuitAnalysisResult, isWaiting] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchShortCircuitAnalysisResult,
        shortCircuitAnalysisResultInvalidations,
        null,
        null,
        dormant
    );

    return (
        <WaitingLoader message={'LoadingRemoteData'} loading={isWaiting}>
            <ShortCircuitAnalysisResult result={shortCircuitAnalysisResult} />
        </WaitingLoader>
    );
};
