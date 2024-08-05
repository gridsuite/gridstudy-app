/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UPDATE_TYPE_HEADER } from 'components/study-container';
import { RunningStatus } from 'components/utils/running-status';
import { UUID } from 'crypto';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ComputingType } from './computing-type';
import { ReduxState, StudyUpdated } from 'redux/reducer.type';
import { OptionalServicesStatus } from '../utils/optional-services';
import { setComputingStatus, setLastCompletedComputation } from '../../redux/actions';

interface UseComputingStatusProps {
    (
        studyUuid: UUID,
        nodeUuid: UUID,
        fetcher: (studyUuid: UUID, nodeUuid: UUID) => Promise<string>,
        invalidations: string[],
        completions: string[],
        resultConversion: (x: string) => RunningStatus,
        computingType: ComputingType,
        optionalServiceAvailabilityStatus?: OptionalServicesStatus
    ): void;
}

interface LastUpdateProps {
    studyUpdatedForce: StudyUpdated;
    fetcher: (studyUuid: UUID, nodeUuid: UUID) => Promise<string>;
}

function isWorthUpdate(
    studyUpdatedForce: StudyUpdated,
    fetcher: (studyUuid: UUID, nodeUuid: UUID) => Promise<string>,
    lastUpdateRef: RefObject<LastUpdateProps>,
    nodeUuidRef: RefObject<UUID>,
    nodeUuid: UUID,
    invalidations: string[]
): boolean {
    const headers = studyUpdatedForce?.eventData?.headers;
    const updateType = headers?.[UPDATE_TYPE_HEADER];
    const node = headers?.['node'];
    const nodes = headers?.['nodes'];
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (fetcher && lastUpdateRef.current?.fetcher !== fetcher) {
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

/**
 *  this hook loads <computingType> state into redux, then keeps it updated according to notifications
 * @param studyUuid current study uuid
 * @param nodeUuid current node uuid
 * @param fetcher method fetching current <computingType> state
 * @param invalidations when receiving notifications, if updateType is included in <invalidations>, this hook will update
 * @param resultConversion converts <fetcher> result to RunningStatus
 * @param computingType ComputingType targeted by this hook
 * @param optionalServiceAvailabilityStatus status of an optional service
 */
export const useComputingStatus: UseComputingStatusProps = (
    studyUuid,
    nodeUuid,
    fetcher,
    invalidations,
    completions,
    resultConversion,
    computingType,
    optionalServiceAvailabilityStatus = OptionalServicesStatus.Up
) => {
    const nodeUuidRef = useRef<UUID | null>(null);
    const studyUpdatedForce = useSelector((state: ReduxState) => state.studyUpdated);
    const lastUpdateRef = useRef<LastUpdateProps | null>(null);
    const dispatch = useDispatch();

    //the callback crosschecks the computation status and the content of the last update reference
    //in order to determine which computation just ended
    const isComputationCompleted = useCallback(
        (status: RunningStatus) =>
            [RunningStatus.FAILED, RunningStatus.SUCCEED].includes(status) &&
            completions.includes(lastUpdateRef.current?.studyUpdatedForce.eventData?.headers?.updateType ?? ''),
        [completions]
    );

    const update = useCallback(() => {
        // this is used to prevent race conditions from happening
        // if another request is sent, the previous one won't do anything
        let canceledRequest = false;

        //upon changing node we reset the last completed computation to prevent results misredirection
        dispatch(setLastCompletedComputation());

        nodeUuidRef.current = nodeUuid;
        fetcher(studyUuid, nodeUuid)
            .then((res: string) => {
                if (!canceledRequest && nodeUuidRef.current === nodeUuid) {
                    const status = resultConversion(res);
                    dispatch(setComputingStatus(computingType, status));
                    if (isComputationCompleted(status)) {
                        dispatch(setLastCompletedComputation(computingType));
                    }
                }
            })
            .catch(() => {
                if (!canceledRequest) {
                    dispatch(setComputingStatus(computingType, RunningStatus.FAILED));
                }
            });

        return () => {
            canceledRequest = true;
        };
    }, [nodeUuid, fetcher, studyUuid, resultConversion, dispatch, computingType, isComputationCompleted]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid || optionalServiceAvailabilityStatus !== OptionalServicesStatus.Up) {
            return;
        }

        const isUpdateForUs = isWorthUpdate(
            studyUpdatedForce,
            fetcher,
            lastUpdateRef,
            nodeUuidRef,
            nodeUuid,
            invalidations
        );
        lastUpdateRef.current = { studyUpdatedForce, fetcher };
        if (isUpdateForUs) {
            update();
        }
    }, [update, fetcher, nodeUuid, invalidations, studyUpdatedForce, studyUuid, optionalServiceAvailabilityStatus]);
};
