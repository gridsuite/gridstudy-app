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
import { setComputingStatus, setComputingStatusParameters, setLastCompletedComputation } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import { isParameterizedComputingType, toComputingStatusParameters } from './computing-status-utils';
import { NotificationType, parseEventData, StudyUpdatedEventData } from '../../types/notification-types';
import { getComputingStatusParametersFetcher, getRunningStatusByComputingType } from '../../services/study/study';

interface UseComputingStatusProps {
    (
        studyUuid: UUID,
        nodeUuid: UUID,
        currentRootNetworkUuid: UUID,
        computingStatusFetcher: (
            studyUuid: UUID,
            nodeUuid: UUID,
            currentRootNetworkUuid: UUID
        ) => Promise<Record<ComputingType, string> | null>,
        getCompletions: (computingType: ComputingType) => NotificationType[]
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
    nodeUuidRef: RefObject<UUID | null>,
    rootNetworkUuidRef: RefObject<UUID | null>,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID
): boolean {
    if (nodeUuidRef.current !== nodeUuid) {
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
    allComputingStatusFetcher,
    getCompletions
) => {
    const nodeUuidRef = useRef<UUID | null>(null);
    const rootNetworkUuidRef = useRef<UUID | null>(null);
    const lastUpdateRef = useRef<LastUpdateProps | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    //the callback crosschecks the computation status and the content of the last update reference
    //in order to determine which computation just ended
    const isComputationCompleted = useCallback((status: RunningStatus, completions: string[]) => {
        const eventData = lastUpdateRef.current?.eventData;
        return (
            [RunningStatus.FAILED, RunningStatus.SUCCEED].includes(status) &&
            completions.includes(eventData?.headers?.updateType ?? '')
        );
    }, []);

    const handleComputingStatusParameters = useCallback(
        async (
            computationStatus: RunningStatus,
            canceledRequest: boolean,
            computingType: ComputingType,
            computingStatusParametersFetcher:
                | ((studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>)
                | undefined
        ) => {
            if (
                computingStatusParametersFetcher &&
                computationStatus !== RunningStatus.IDLE &&
                isParameterizedComputingType(computingType)
            ) {
                nodeUuidRef.current = nodeUuid;
                rootNetworkUuidRef.current = currentRootNetworkUuid;
                const computingStatusParametersResult = await computingStatusParametersFetcher(
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
        [currentRootNetworkUuid, dispatch, nodeUuid, studyUuid]
    );

    const update = useCallback(async () => {
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
                    if (isComputationCompleted(status, getCompletions(computingType))) {
                        dispatch(setLastCompletedComputation(computingType));
                    }
                    await handleComputingStatusParameters(
                        status,
                        canceledRequest,
                        computingType,
                        getComputingStatusParametersFetcher(computingType)
                    );
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
    }, [
        getCompletions,
        dispatch,
        nodeUuid,
        currentRootNetworkUuid,
        allComputingStatusFetcher,
        studyUuid,
        handleComputingStatusParameters,
        isComputationCompleted,
    ]);

    const evaluateUpdate = useCallback(
        (event?: MessageEvent) => {
            if (!studyUuid || !nodeUuid || !currentRootNetworkUuid) {
                return;
            }
            const eventData = parseEventData<StudyUpdatedEventData>(event ?? null);
            const isUpdateForUs = isWorthUpdate(nodeUuidRef, rootNetworkUuidRef, nodeUuid, currentRootNetworkUuid);
            lastUpdateRef.current = { eventData, allComputingStatusFetcher };
            if (isUpdateForUs) {
                update();
            }
        },
        [allComputingStatusFetcher, currentRootNetworkUuid, nodeUuid, studyUuid, update]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: evaluateUpdate,
    });

    /* initial fetch and update */
    useEffect(() => {
        evaluateUpdate();
    }, [evaluateUpdate]);
};
