/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getComputationRunningStatus } from 'components/utils/running-status';
import type { UUID } from 'node:crypto';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
    BuildStatus,
    ComputingType,
    NotificationsUrlKeys,
    RunningStatus,
    useNotificationsListener,
} from '@gridsuite/commons-ui';
import { setComputingStatus, setComputingStatusParameters, setLastCompletedComputation } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import { parseEventData, StudyUpdatedEventData } from '../../types/notification-types';
import { isParameterizedComputingType, toComputingStatusParameters } from './computing-status-utils';

interface UseComputingStatusProps {
    (
        studyUuid: UUID,
        nodeUuid: UUID,
        currentRootNetworkUuid: UUID,
        currentNodeBuildStatus: BuildStatus,
        computingStatusFetcher: (
            studyUuid: UUID,
            nodeUuid: UUID,
            currentRootNetworkUuid: UUID
        ) => Promise<Record<string, string> | null>,
        computingStatusParametersFetcherMap: Map<
            ComputingType,
            (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>
        >
    ): void;
}

function isWorthUpdate(
    updateType: string | undefined,
    nodeUuidRef: RefObject<UUID | undefined>,
    rootNetworkUuidRef: RefObject<UUID | undefined>,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    notificationNode: UUID | undefined
): boolean {
    if (rootNetworkUuidRef.current !== currentRootNetworkUuid) {
        return true;
    }
    // if notification is about a node that is not current node, no need to update current node computation status
    if (notificationNode && notificationNode !== nodeUuid) {
        return false;
    }
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (!updateType) {
        return false;
    }
    return updateType === 'all_computation_status' || updateType === 'all_computation_status_without_loadflow';
}

/**
 *  this hook loads all <computingType> state into redux at once, then updates it according to notifications for all computation
 * @param studyUuid current study uuid
 * @param nodeUuid current node uuid
 * @param currentNodeBuildStatus
 * @param allComputingStatusFetcher method fetching all <computingType> state
 * @param currentRootNetworkUuid
 * @param computingStatusParametersFetcherMap
 */
export const useAllComputingStatusAtOnce: UseComputingStatusProps = (
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    currentNodeBuildStatus,
    allComputingStatusFetcher,
    computingStatusParametersFetcherMap
) => {
    const nodeUuidRef = useRef<UUID>(undefined);
    const rootNetworkUuidRef = useRef<UUID>(undefined);
    const dispatch = useDispatch<AppDispatch>();
    // Monotonic id identifying the latest in-flight request. A response is only
    // applied when its id is still the latest one, so an out-of-order response
    // from a previous fetcher (e.g. another node, another root network, or
    // another tab with a different result shape) cannot overwrite the current
    // result and crash consumers.
    const requestIdRef = useRef<number>(0);

    const handleComputingStatusParameters = useCallback(
        async (computationStatus: RunningStatus, isLatestRequest: () => boolean, computingType: ComputingType) => {
            const computingStatusParametersFetcher = computingStatusParametersFetcherMap.get(computingType);
            if (
                computingStatusParametersFetcher &&
                computationStatus !== RunningStatus.IDLE &&
                isParameterizedComputingType(computingType)
            ) {
                const computingStatusParametersResult = await computingStatusParametersFetcher?.(
                    studyUuid,
                    nodeUuid,
                    currentRootNetworkUuid
                );
                if (!isLatestRequest()) {
                    return;
                }
                dispatch(
                    setComputingStatusParameters(
                        computingType,
                        toComputingStatusParameters(computingStatusParametersResult, computingType)
                    )
                );
            }
        },
        [computingStatusParametersFetcherMap, currentRootNetworkUuid, dispatch, nodeUuid, studyUuid]
    );

    const updateAll = useCallback(
        async (updateType: string | undefined) => {
            // save context of the request for later comparison
            nodeUuidRef.current = nodeUuid;
            rootNetworkUuidRef.current = currentRootNetworkUuid;
            const requestId = ++requestIdRef.current;
            const isLatestRequest = () => requestId === requestIdRef.current;
            //upon changing node we reset the last completed computation to prevent results misredirection
            dispatch(setLastCompletedComputation());

            try {
                // fetch computing statuses
                const computingStatusesResult: Record<string, string> | null = await allComputingStatusFetcher(
                    studyUuid,
                    nodeUuid,
                    currentRootNetworkUuid
                );
                if (!isLatestRequest()) {
                    return;
                }
                // if request has not been canceled for any reason
                if (computingStatusesResult != null) {
                    // for each status
                    const allStatusInfosMap = new Map(
                        Object.entries(computingStatusesResult) as [ComputingType, string][]
                    );
                    await Promise.all(
                        Array.from(allStatusInfosMap).map(async ([computingType, statusValue]) => {
                            if (!(
                                computingType === ComputingType.LOAD_FLOW &&
                                updateType === 'all_computation_status_without_loadflow'
                            )) {
                                const status = getComputationRunningStatus(statusValue, computingType);
                                dispatch(setComputingStatus(computingType, status));
                                await handleComputingStatusParameters(status, isLatestRequest, computingType);
                            }
                        })
                    );
                }
            } catch (e: any) {
                if (isLatestRequest()) {
                    // for each status
                    for (const computingType of Object.values(ComputingType)) {
                        dispatch(setComputingStatus(computingType, RunningStatus.FAILED));
                        console.error(e?.message);
                    }
                }
            }
        },
        [
            dispatch,
            nodeUuid,
            currentRootNetworkUuid,
            allComputingStatusFetcher,
            studyUuid,
            handleComputingStatusParameters,
        ]
    );

    const evaluateUpdate = useCallback(
        (event?: MessageEvent) => {
            if (!studyUuid || !nodeUuid || !currentRootNetworkUuid) {
                return;
            }
            const eventData = parseEventData<StudyUpdatedEventData>(event ?? null);
            const headers = eventData?.headers;
            const updateType = headers?.updateType;
            const notificationNode = headers?.node;
            // no need to request the back if node is not built
            if (currentNodeBuildStatus === BuildStatus.NOT_BUILT) {
                Object.values(ComputingType).forEach((computingType: ComputingType) => {
                    dispatch(setComputingStatus(computingType, RunningStatus.IDLE));
                });
                nodeUuidRef.current = nodeUuid;
                return;
            }
            const isUpdateForUs = isWorthUpdate(
                updateType,
                nodeUuidRef,
                rootNetworkUuidRef,
                nodeUuid,
                currentRootNetworkUuid,
                notificationNode
            );
            if (isUpdateForUs) {
                updateAll(updateType);
            }
        },
        [currentNodeBuildStatus, currentRootNetworkUuid, dispatch, nodeUuid, studyUuid, updateAll]
    );

    // evaluate at each notification
    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: evaluateUpdate,
    });

    /* initial fetch and update */
    useEffect(() => {
        evaluateUpdate();
    }, [evaluateUpdate]);
};
