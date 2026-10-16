/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo } from 'react';
import type { UUID } from 'node:crypto';
import { useSelector } from 'react-redux';
import { ComputingType, RunningStatus } from '@gridsuite/commons-ui';
import { AppState } from 'redux/reducer.type';
import { useNodeData } from 'components/use-node-data';
import { fetchLogicalControlsResult } from '../../../services/study/state-estimation';
import { logicalControlsResultInvalidations } from '../../computing-status/use-all-computing-status';
import { LogicalControlsResult } from '../stateestimation/logicalcontrols/logical-controls-result';

interface LogicalControlsResultTabProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
}

export const LogicalControlsResultTab: FunctionComponent<LogicalControlsResultTabProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}) => {
    const logicalControlsStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.LOGICAL_CONTROLS]
    );

    const { result: logicalControlsResult, isLoading: isLoadingResult } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchLogicalControlsResult,
        invalidations: logicalControlsResultInvalidations,
    });

    const isComputationDone =
        logicalControlsStatus === RunningStatus.SUCCEED || logicalControlsStatus === RunningStatus.FAILED;
    const isRunning =
        logicalControlsStatus === RunningStatus.RUNNING || logicalControlsStatus === RunningStatus.PRELOADING;

    const result = useMemo(
        () => (isComputationDone && logicalControlsResult ? logicalControlsResult : undefined),
        [isComputationDone, logicalControlsResult]
    );

    return (
        <LogicalControlsResult
            result={result}
            isLoadingResult={isRunning || isLoadingResult}
            exportCsvResetKey={`${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}`}
        />
    );
};
