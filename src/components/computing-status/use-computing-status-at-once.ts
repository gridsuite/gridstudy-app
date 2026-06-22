/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { getComputationRunningStatus, RunningStatus } from 'components/utils/running-status';
import type { UUID } from 'node:crypto';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ComputingType, NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { setComputingStatus, setComputingStatusParameters, setLastCompletedComputation } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import { parseEventData, StudyUpdatedEventData } from '../../types/notification-types';
import { isParameterizedComputingType, toComputingStatusParameters } from './computing-status-utils';

interface UseComputingStatusProps {
    (
        studyUuid: UUID,
        nodeUuid: UUID,
        currentRootNetworkUuid: UUID,
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
    nodeUuidRef: RefObject<UUID | null>,
    rootNetworkUuidRef: RefObject<UUID | null>,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID
): boolean {
    if (rootNetworkUuidRef.current !== currentRootNetworkUuid) {
        return true;
    }
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (!updateType) {
        return false;
    }
    return updateType === 'all_computation_status' || updateType === 'all_computation_status_without_loadflow';
}

const shouldRequestBeCanceled = (
    canceledRequest: boolean,
    previousNodeUuid: UUID,
    currentNodeUuid: UUID,
    previousRootNetworkUuid: UUID,
    currentRootNetworkUuid: UUID
) => {
    return (
        canceledRequest || previousNodeUuid !== currentNodeUuid || previousRootNetworkUuid !== currentRootNetworkUuid
    );
};

/**
 *  this hook loads all <computingType> state into redux at once, then updates it according to notifications for all computation
 * @param studyUuid current study uuid
 * @param nodeUuid current node uuid
 * @param allComputingStatusFetcher method fetching all <computingType> state
 * @param currentRootNetworkUuid
 * @param computingStatusParametersFetcherMap
 */
export const useAllComputingStatusAtOnce: UseComputingStatusProps = (
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    allComputingStatusFetcher,
    computingStatusParametersFetcherMap
) => {
    const nodeUuidRef = useRef<UUID | null>(null);
    const rootNetworkUuidRef = useRef<UUID | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const handleComputingStatusParameters = useCallback(
        async (computationStatus: RunningStatus, canceledRequest: boolean, computingType: ComputingType) => {
            const computingStatusParametersFetcher = computingStatusParametersFetcherMap.get(computingType);
            if (
                computingStatusParametersFetcher &&
                computationStatus !== RunningStatus.IDLE &&
                isParameterizedComputingType(computingType)
            ) {
                nodeUuidRef.current = nodeUuid;
                rootNetworkUuidRef.current = currentRootNetworkUuid;

                const computingStatusParametersResult = await computingStatusParametersFetcher?.(
                    studyUuid,
                    nodeUuid,
                    currentRootNetworkUuid
                );
                if (
                    shouldRequestBeCanceled(
                        canceledRequest,
                        nodeUuidRef.current,
                        nodeUuid,
                        rootNetworkUuidRef.current,
                        currentRootNetworkUuid
                    )
                ) {
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
            // this is used to prevent race conditions from happening
            // if another request is sent, the previous one won't do anything
            let canceledRequest = false;

            //upon changing node we reset the last completed computation to prevent results misredirection
            dispatch(setLastCompletedComputation());

            nodeUuidRef.current = nodeUuid;
            rootNetworkUuidRef.current = currentRootNetworkUuid;
            try {
                // fetch computing statuses
                const computingStatusesResult: Record<string, string> | null = await allComputingStatusFetcher(
                    studyUuid,
                    nodeUuid,
                    currentRootNetworkUuid
                );
                if (
                    shouldRequestBeCanceled(
                        canceledRequest,
                        nodeUuidRef.current,
                        nodeUuid,
                        rootNetworkUuidRef.current,
                        currentRootNetworkUuid
                    )
                ) {
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
                            if (
                                !(
                                    computingType === ComputingType.LOAD_FLOW &&
                                    updateType === 'all_computation_status_without_loadflow'
                                )
                            ) {
                                const status = getComputationRunningStatus(statusValue, computingType);
                                dispatch(setComputingStatus(computingType, status));
                                await handleComputingStatusParameters(status, canceledRequest, computingType);
                            }
                        })
                    );
                }
            } catch (e: any) {
                if (!canceledRequest) {
                    // for each status
                    for (const computingType of Object.values(ComputingType)) {
                        dispatch(setComputingStatus(computingType, RunningStatus.FAILED));
                        console.error(e?.message);
                    }
                }
            }

            return () => {
                canceledRequest = true;
            };
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
            const isUpdateForUs = isWorthUpdate(
                updateType,
                nodeUuidRef,
                rootNetworkUuidRef,
                nodeUuid,
                currentRootNetworkUuid
            );
            if (isUpdateForUs) {
                updateAll(updateType);
            }
        },
        [currentRootNetworkUuid, nodeUuid, studyUuid, updateAll]
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
