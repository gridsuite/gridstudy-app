/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RunningStatus } from 'components/utils/running-status';
import type { UUID } from 'node:crypto';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComputingType } from '@gridsuite/commons-ui';
import { AppState, StudyUpdated } from 'redux/reducer';
import { OptionalServicesStatus } from '../utils/optional-services';
import { setComputingStatus, setComputingStatusParameters, setLastCompletedComputation } from '../../redux/actions';
import { AppDispatch } from '../../redux/store';
import { isParameterizedComputingType, toComputingStatusParameters } from './computing-status-utils';
import { StudyUpdatedEventData } from 'types/notification-types';

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
    studyUpdatedForce: StudyUpdated;
    computingStatusFetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>;
}

function isWorthUpdate(
    studyUpdatedForce: StudyUpdated,
    computingStatusFetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<string | null>,
    lastUpdateRef: RefObject<LastUpdateProps>,
    nodeUuidRef: RefObject<UUID>,
    rootNetworkUuidRef: RefObject<UUID>,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    invalidations: string[]
): boolean {
    const studyUpdatedEventData = studyUpdatedForce?.eventData as StudyUpdatedEventData; // TODO narrowing by predicate
    const headers = studyUpdatedEventData?.headers;
    const updateType = headers?.updateType;
    const node = headers?.node;
    const nodes = headers?.nodes;
    const rootNetworkUuidFromNotification = headers?.rootNetworkUuid;
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (rootNetworkUuidRef.current !== currentRootNetworkUuid) {
        return true;
    }
    if (rootNetworkUuidFromNotification && rootNetworkUuidFromNotification !== currentRootNetworkUuid) {
        return false;
    }
    if (computingStatusFetcher && lastUpdateRef.current?.computingStatusFetcher !== computingStatusFetcher) {
        return true;
    }
    if (studyUpdatedForce && lastUpdateRef.current?.studyUpdatedForce === studyUpdatedForce) {
        return false;
    }
    if (!updateType) {
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
 * @param computingStatusFetcher method fetching current <computingType> state
 * @param invalidations when receiving notifications, if updateType is included in <invalidations>, this hook will update
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
    const nodeUuidRef = useRef<UUID | null>(null);
    const rootNetworkUuidRef = useRef<UUID | null>(null);

    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const lastUpdateRef = useRef<LastUpdateProps | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    //the callback crosschecks the computation status and the content of the last update reference
    //in order to determine which computation just ended
    const isComputationCompleted = useCallback(
        (status: RunningStatus) =>
            [RunningStatus.FAILED, RunningStatus.SUCCEED].includes(status) &&
            completions.includes(lastUpdateRef.current?.studyUpdatedForce.eventData?.headers?.updateType ?? ''),
        [completions]
    );

    const handleComputingStatusParameters = useCallback(
        async (computationStatus: RunningStatus, canceledRequest: boolean) => {
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
        [computingStatusParametersFetcher, computingType, currentRootNetworkUuid, dispatch, nodeUuid, studyUuid]
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
            const computingStatusResult: string | null = await computingStatusFetcher(
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
            const status = resultConversion(computingStatusResult);
            dispatch(setComputingStatus(computingType, status));
            if (isComputationCompleted(status)) {
                dispatch(setLastCompletedComputation(computingType));
            }

            await handleComputingStatusParameters(status, canceledRequest);
        } catch (e: any) {
            if (!canceledRequest) {
                dispatch(setComputingStatus(computingType, RunningStatus.FAILED));
                console.error(e?.message);
            }
        }

        return () => {
            canceledRequest = true;
        };
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

    /* initial fetch and update */
    useEffect(() => {
        if (
            !studyUuid ||
            !nodeUuid ||
            !currentRootNetworkUuid ||
            optionalServiceAvailabilityStatus !== OptionalServicesStatus.Up
        ) {
            return;
        }
        const isUpdateForUs = isWorthUpdate(
            studyUpdatedForce,
            computingStatusFetcher,
            lastUpdateRef,
            nodeUuidRef,
            rootNetworkUuidRef,
            nodeUuid,
            currentRootNetworkUuid,
            invalidations
        );
        lastUpdateRef.current = { studyUpdatedForce, computingStatusFetcher };
        if (isUpdateForUs) {
            update();
        }
    }, [
        update,
        computingStatusFetcher,
        nodeUuid,
        invalidations,
        currentRootNetworkUuid,
        studyUpdatedForce,
        studyUuid,
        optionalServiceAvailabilityStatus,
    ]);
};
