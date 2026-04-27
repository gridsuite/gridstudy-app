/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RunningStatus } from 'components/utils/running-status';
import type { UUID } from 'node:crypto';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ComputingType, NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { setComputingStatus, setLastCompletedComputation } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import { parseEventData, StudyUpdatedEventData } from '../../types/notification-types';
import { getRunningStatusByComputingType } from '../../services/study/study';

interface UseComputingStatusProps {
    (
        studyUuid: UUID,
        nodeUuid: UUID,
        currentRootNetworkUuid: UUID,
        computingStatusFetcher: (
            studyUuid: UUID,
            nodeUuid: UUID,
            currentRootNetworkUuid: UUID
        ) => Promise<Record<ComputingType, string> | null>
    ): void;
}

interface LastUpdateProps {
    eventData: StudyUpdatedEventData | null;
    allComputingStatusFetcher: (
        studyUuid: UUID,
        nodeUuid: UUID,
        currentRootNetworkUuid: UUID
    ) => Promise<Record<ComputingType, string> | null>;
}

function isWorthUpdate(
    eventData: StudyUpdatedEventData | null,
    nodeUuidRef: RefObject<UUID | null>,
    rootNetworkUuidRef: RefObject<UUID | null>,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID
): boolean {
    const headers = eventData?.headers;
    const updateType = headers?.updateType;
    if (rootNetworkUuidRef.current !== currentRootNetworkUuid) {
        return true;
    }
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (!updateType) {
        return false;
    }
    if (updateType === 'buildCompleted' || updateType === 'all_computation_status') {
        return true;
    }
    return rootNetworkUuidRef.current !== currentRootNetworkUuid;
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
 *  this hook loads <computingType> state into redux, then keeps it updated according to notifications
 * @param studyUuid current study uuid
 * @param nodeUuid current node uuid
 * @param allComputingStatusFetcher method fetching all <computingType> state
 * @param currentRootNetworkUuid
 * @param getCompletions
 */
export const useAllComputingStatusAtOnce: UseComputingStatusProps = (
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    allComputingStatusFetcher
) => {
    const nodeUuidRef = useRef<UUID | null>(null);
    const rootNetworkUuidRef = useRef<UUID | null>(null);
    const lastUpdateRef = useRef<LastUpdateProps | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const updateAll = useCallback(async () => {
        // this is used to prevent race conditions from happening
        // if another request is sent, the previous one won't do anything
        let canceledRequest = false;

        //upon changing node we reset the last completed computation to prevent results misredirection
        dispatch(setLastCompletedComputation());

        nodeUuidRef.current = nodeUuid;
        rootNetworkUuidRef.current = currentRootNetworkUuid;
        try {
            // fetch computing status
            const computingStatusResult: Record<ComputingType, string> | null = await allComputingStatusFetcher(
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
            // if request has not been canceled for any reason, fetch if necessary computingStatusParameters
            const allStatusInfos = computingStatusResult;
            if (allStatusInfos != null) {
                // for each status
                const allStatusInfosMap = new Map(Object.entries(allStatusInfos) as [ComputingType, string][]);
                allStatusInfosMap.forEach(async (statusValue, computingType) => {
                    const status = getRunningStatusByComputingType(statusValue, computingType);
                    dispatch(setComputingStatus(computingType, status));
                });
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
    }, [dispatch, nodeUuid, currentRootNetworkUuid, allComputingStatusFetcher, studyUuid]);

    const evaluateUpdate = useCallback(
        (event?: MessageEvent) => {
            if (!studyUuid || !nodeUuid || !currentRootNetworkUuid) {
                return;
            }
            const eventData = parseEventData<StudyUpdatedEventData>(event ?? null);
            const isUpdateForUs = isWorthUpdate(
                eventData,
                nodeUuidRef,
                rootNetworkUuidRef,
                nodeUuid,
                currentRootNetworkUuid
            );
            lastUpdateRef.current = { eventData, allComputingStatusFetcher };
            if (isUpdateForUs) {
                updateAll();
            }
        },
        [allComputingStatusFetcher, currentRootNetworkUuid, nodeUuid, studyUuid, updateAll]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: evaluateUpdate,
    });

    /* initial fetch and update */
    useEffect(() => {
        evaluateUpdate();
    }, [evaluateUpdate]);
};
