/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNodeData } from '../../study-container';
import {
    fetchSelectiveShortCircuitAnalysisResult,
    fetchShortCircuitAnalysisResult,
} from '../../../utils/rest-api';
import WaitingLoader from '../../utils/waiting-loader';
import ShortCircuitAnalysisResult from './shortcircuit-analysis-result';
import { Tab, Tabs } from '@mui/material';
import { UUID } from 'crypto';
import { FunctionComponent, useCallback, useState } from 'react';
import { ShortcircuitAnalysisResult } from './shortcircuit-analysis-result.type';

interface ShortCircuitAnalysisResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
}

const shortCircuitAnalysisResultInvalidations = ['shortCircuitAnalysisResult'];

export const ShortCircuitAnalysisResultTab: FunctionComponent<
    ShortCircuitAnalysisResultTabProps
> = ({ studyUuid, nodeUuid }) => {
    const [tabIndex, setTabIndex] = useState(0);

    const [shortCircuitAnalysisResult, isWaitingShortCircuitAnalysisResult] =
        useNodeData(
            studyUuid,
            nodeUuid,
            fetchShortCircuitAnalysisResult,
            shortCircuitAnalysisResultInvalidations
        ) as [ShortcircuitAnalysisResult, boolean];

    const [
        selectiveShortCircuitAnalysisResult,
        isWaitingSelectiveShortCircuitAnalysisResult,
    ] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchSelectiveShortCircuitAnalysisResult,
        shortCircuitAnalysisResultInvalidations
    ) as [ShortcircuitAnalysisResult, boolean];

    const handleTabChange = useCallback(
        (event: React.SyntheticEvent, newIndex: number) => {
            setTabIndex(newIndex);
        },
        [setTabIndex]
    );

    return (
        <>
            <Tabs value={tabIndex} onChange={handleTabChange}>
                <Tab label={'Global'} />
                <Tab label={'Selectif'} />
            </Tabs>
            <WaitingLoader
                message={'LoadingRemoteData'}
                loading={
                    tabIndex === 0
                        ? isWaitingShortCircuitAnalysisResult
                        : isWaitingSelectiveShortCircuitAnalysisResult
                }
            >
                <ShortCircuitAnalysisResult
                    result={
                        tabIndex === 0
                            ? shortCircuitAnalysisResult
                            : selectiveShortCircuitAnalysisResult
                    }
                />
            </WaitingLoader>
        </>
    );
};
