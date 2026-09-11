/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import { RefObject, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { ComputingType, NotificationsUrlKeys, RunningStatus, useNotificationsListener } from '@gridsuite/commons-ui';
import { OptionalServicesStatus } from '../utils/optional-services';
import { setComputingStatus, setComputingStatusParameters, setLastCompletedComputation } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import { isParameterizedComputingType, toComputingStatusParameters } from './computing-status-utils';
import { parseEventData, StudyUpdatedEventData } from '../../types/notification-types';

interface UseComputingStatusProps {
    (
        studyUuid: UUID,
        nodeUuid: UUID,
        currentRootNetworkUuid: UUID,
        computingStatusFetcher: (
            studyUuid: UUID,
            nodeUuid: UUID,
            currentRootNetworkUuid: UUID
        ) => Promise<string | null>,
        invalidations: string[],
        completions: string[],
        resultConversion: (x: string | null) => RunningStatus,
        computingType: ComputingType,
        computingStatusParametersFetcher?: (
            studyUuid: UUID,
            nodeUuid: UUID,
            currentRootNetworkUuid: UUID
        ) => Promise<string | null>,
        optionalServiceAvailabilityStatus?: OptionalServicesStatus
    ): void;
}

interface LastUpdateProps {
    eventData: StudyUpdatedEventData | null;
    computingStatusFetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>;
}

function isWorthUpdate(
    eventData: StudyUpdatedEventData | null,
    computingStatusFetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>,
    lastUpdateRef: RefObject<LastUpdateProps | null>,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    invalidations: string[]
): boolean {
    const headers = eventData?.headers;
    const updateType = headers?.updateType;
    const node = headers?.node;
    const nodes = headers?.nodes;
    const rootNetworkUuidFromNotification = headers?.rootNetworkUuid;
    if (rootNetworkUuidFromNotification && rootNetworkUuidFromNotification !== currentRootNetworkUuid) {
        return false;
    }
    if (computingStatusFetcher && lastUpdateRef.current?.computingStatusFetcher !== computingStatusFetcher) {
        return true;
    }
    if (eventData && lastUpdateRef.current?.eventData === eventData) {
        return false;
    }
    if (!updateType) {
        return false;
    }
    // if node is updated with 'all status' notification it is done in use-computating-status-at-once
    if (
        updateType === 'nodeBuildStatusUpdated' ||
        updateType === 'buildCompleted' ||
        updateType === 'all_computation_status' ||
        updateType === 'all_computation_status_without_loadflow'
    ) {
        return false;
    }
    if (invalidations.indexOf(updateType) <= -1) {
        return false;
    }
    if (node === undefined && nodes === undefined) {
        return true;
    }
    if (node === nodeUuid || nodes?.indexOf(nodeUuid) !== -1) {
        return true;
    }

    return false;
}

/**
 *  this hook loads <computingType> state into redux, then keeps it updated according to notifications
 * @param studyUuid current study uuid
 * @param nodeUuid current node uuid
 * @param currentRootNetworkUuid
 * @param computingStatusFetcher method fetching current <computingType> state
 * @param invalidations when receiving notifications, if updateType is included in <invalidations>, this hook will update
 * @param completions
 * @param resultConversion converts <fetcher> result to RunningStatus
 * @param computingType ComputingType targeted by this hook
 * @param computingStatusParametersFetcher method fetching status infos
 * @param optionalServiceAvailabilityStatus status of an optional service
 */
export const useComputingStatus: UseComputingStatusProps = (
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    computingStatusFetcher,
    invalidations,
    completions,
    resultConversion,
    computingType,
    computingStatusParametersFetcher,
    optionalServiceAvailabilityStatus = OptionalServicesStatus.Up
) => {
    const lastUpdateRef = useRef<LastUpdateProps | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    // Monotonic id identifying the latest in-flight request. A response is only
    // applied when its id is still the latest one, so an out-of-order response
    // from a previous fetcher (e.g. another node, another root network, or
    // another tab with a different result shape) cannot overwrite the current
    // result and crash consumers.
    const requestIdRef = useRef<number>(0);

    //the callback crosschecks the computation status and the content of the last update reference
    //in order to determine which computation just ended
    const isComputationCompleted = useCallback(
        (status: RunningStatus) => {
            const eventData = lastUpdateRef.current?.eventData;
            return (
                [RunningStatus.FAILED, RunningStatus.SUCCEED].includes(status) &&
                completions.includes(eventData?.headers?.updateType ?? '')
            );
        },
        [completions]
    );

    const handleComputingStatusParameters = useCallback(
        async (computationStatus: RunningStatus, isLatestRequest: () => boolean) => {
            if (
                computingStatusParametersFetcher &&
                computationStatus !== RunningStatus.IDLE &&
                isParameterizedComputingType(computingType)
            ) {
                const computingStatusParametersResult = await computingStatusParametersFetcher(
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
        [computingStatusParametersFetcher, computingType, currentRootNetworkUuid, dispatch, nodeUuid, studyUuid]
    );

    const update = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        const isLatestRequest = () => requestId === requestIdRef.current;

        //upon changing node we reset the last completed computation to prevent results misredirection
        dispatch(setLastCompletedComputation());

        try {
            // fetch computing status
            const computingStatusResult: string | null = await computingStatusFetcher(
                studyUuid,
                nodeUuid,
                currentRootNetworkUuid
            );
            if (!isLatestRequest()) {
                return;
            }
            // if request has not been canceled for any reason, fetch if necessary computingStatusParameters
            const status = resultConversion(computingStatusResult);
            dispatch(setComputingStatus(computingType, status));
            if (isComputationCompleted(status)) {
                dispatch(setLastCompletedComputation(computingType));
            }

            await handleComputingStatusParameters(status, isLatestRequest);
        } catch (e: any) {
            if (isLatestRequest()) {
                dispatch(setComputingStatus(computingType, RunningStatus.FAILED));
                console.error(e?.message);
            }
        }
    }, [
        dispatch,
        nodeUuid,
        currentRootNetworkUuid,
        computingStatusFetcher,
        studyUuid,
        resultConversion,
        handleComputingStatusParameters,
        computingType,
        isComputationCompleted,
    ]);

    const evaluateUpdate = useCallback(
        (event?: MessageEvent) => {
            if (
                !studyUuid ||
                !nodeUuid ||
                !currentRootNetworkUuid ||
                optionalServiceAvailabilityStatus !== OptionalServicesStatus.Up
            ) {
                return;
            }
            const eventData = parseEventData<StudyUpdatedEventData>(event ?? null);
            const isUpdateForUs = isWorthUpdate(
                eventData,
                computingStatusFetcher,
                lastUpdateRef,
                nodeUuid,
                currentRootNetworkUuid,
                invalidations
            );
            lastUpdateRef.current = { eventData, computingStatusFetcher };
            if (isUpdateForUs) {
                update();
            }
        },
        [
            computingStatusFetcher,
            currentRootNetworkUuid,
            invalidations,
            nodeUuid,
            optionalServiceAvailabilityStatus,
            studyUuid,
            update,
        ]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: evaluateUpdate,
    });
};
