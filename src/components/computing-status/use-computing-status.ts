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
import { OptionalServicesStatus } from '../utils/optional-services';
import { setComputingStatus, setLastCompletedComputation } from '../../redux/actions';
import { AppState, StudyUpdated } from 'redux/reducer';

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

const generateStatusFromComputingType = (base: string) => ({
    invalidations: [`${base}_status`, `${base}_failed`],
    completions: [`${base}Result`, `${base}_failed`],
});

type AnalysisStatusType = {
    invalidations: string[];
    completions: string[];
};
type ComputingTypeToStatusMapperType = Record<ComputingType, AnalysisStatusType>;
const computingTypeToStatusMapper: ComputingTypeToStatusMapperType = {
    [ComputingType.LOAD_FLOW]: generateStatusFromComputingType('loadflow'),
    [ComputingType.SECURITY_ANALYSIS]: generateStatusFromComputingType('securityAnalysis'),
    [ComputingType.SENSITIVITY_ANALYSIS]: generateStatusFromComputingType('sensitivityAnalysis'),
    [ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]: generateStatusFromComputingType('nonEvacuatedEnergy'),
    [ComputingType.SHORT_CIRCUIT]: generateStatusFromComputingType('shortCircuitAnalysis'),
    [ComputingType.SHORT_CIRCUIT_ONE_BUS]: generateStatusFromComputingType('oneBusShortCircuitAnalysis'),
    [ComputingType.DYNAMIC_SIMULATION]: generateStatusFromComputingType('dynamicSimulation'),
    [ComputingType.VOLTAGE_INITIALIZATION]: generateStatusFromComputingType('voltageInit'),
    [ComputingType.STATE_ESTIMATION]: generateStatusFromComputingType('stateEstimation'),
};

interface UseComputingStatusProps {
    (
        fetcher: (studyUuid: UUID, nodeUuid: UUID) => Promise<string>,
        resultConversion: (x: string) => RunningStatus,
        computingType: ComputingType,
        optionalServiceAvailabilityStatus?: OptionalServicesStatus
    ): void;
}
/**
 *  this hook loads <computingType> state into redux, then keeps it updated according to notifications
 * @param fetcher method fetching current <computingType> state
 * @param resultConversion converts <fetcher> result to RunningStatus
 * @param computingType ComputingType targeted by this hook
 * @param optionalServiceAvailabilityStatus status of an optional service
 */
export const useComputingStatus: UseComputingStatusProps = (
    fetcher,
    resultConversion,
    computingType,
    optionalServiceAvailabilityStatus = OptionalServicesStatus.Up
) => {
    const nodeUuid = useSelector((state: AppState) => state.currentTreeNode?.id);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const nodeUuidRef = useRef<UUID | null>(null);
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const lastUpdateRef = useRef<LastUpdateProps | null>(null);
    const dispatch = useDispatch();
    const status = computingTypeToStatusMapper[computingType];
    //the callback crosschecks the computation status and the content of the last update reference
    //in order to determine which computation just ended
    const isComputationCompleted = useCallback(
        (runningStatus: RunningStatus) =>
            [RunningStatus.FAILED, RunningStatus.SUCCEED].includes(runningStatus) &&
            status.completions.includes(lastUpdateRef.current?.studyUpdatedForce.eventData?.headers?.updateType ?? ''),
        [status.completions]
    );

    const update = useCallback(() => {
        // this is used to prevent race conditions from happening
        // if another request is sent, the previous one won't do anything
        let canceledRequest = false;

        //upon changing node we reset the last completed computation to prevent results misredirection
        dispatch(setLastCompletedComputation());

        nodeUuidRef.current = nodeUuid ?? null;
        if (nodeUuid && studyUuid) {
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
        }
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
            status.invalidations
        );
        lastUpdateRef.current = { studyUpdatedForce, fetcher };
        if (isUpdateForUs) {
            update();
        }
    }, [
        update,
        fetcher,
        nodeUuid,
        status.invalidations,
        studyUpdatedForce,
        studyUuid,
        optionalServiceAvailabilityStatus,
    ]);
};
