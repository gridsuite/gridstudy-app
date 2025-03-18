/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RunningStatus } from './utils/running-status';
import { UUID } from 'crypto';
import { AppState, StudyUpdated } from '../redux/reducer';
import { identity } from '@gridsuite/commons-ui';

export const UPDATE_TYPE_HEADER = 'updateType';

function isWorthUpdate<T>(
    studyUpdatedForce: StudyUpdated,
    fetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<T>,
    lastUpdateRef: RefObject<
        | {
              studyUpdatedForce: StudyUpdated;
              fetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<T>;
          }
        | undefined
    >,
    nodeUuidRef: RefObject<UUID | undefined>,
    rootNetworkUuidRef: RefObject<UUID | undefined>,
    nodeUuid: UUID,
    rootNetworkUuid: UUID,
    invalidations: string[]
) {
    const headers = studyUpdatedForce?.eventData?.headers;
    const updateType = headers?.[UPDATE_TYPE_HEADER];
    const node = headers?.['node'];
    const nodes = headers?.['nodes'];
    const rootNetworkFromNotif = headers?.['rootNetwork'];

    if (rootNetworkFromNotif && rootNetworkFromNotif !== rootNetworkUuid) {
        return false;
    }
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (rootNetworkUuidRef.current !== rootNetworkUuid) {
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

export function useNodeData<T, R = T>(
    studyUuid: UUID,
    nodeUuid: UUID,
    currentRootNetworkUuid: UUID,
    fetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<T | null>,
    invalidations: string[],
    defaultValue: R | undefined = undefined,
    resultConversion: (fetchedResult: T | null) => R | null = identity
) {
    const [result, setResult] = useState<R | RunningStatus | undefined>(defaultValue);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef<UUID>();
    const rootNetworkUuidRef = useRef<UUID>();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const lastUpdateRef = useRef<{
        studyUpdatedForce: StudyUpdated;
        fetcher: (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => Promise<T | null>;
    }>();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        rootNetworkUuidRef.current = currentRootNetworkUuid;
        setIsPending(true);
        setErrorMessage(undefined);
        fetcher(studyUuid, nodeUuid, currentRootNetworkUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid && rootNetworkUuidRef.current === currentRootNetworkUuid) {
                    setResult(resultConversion(res) ?? undefined);
                }
            })
            .catch((err) => {
                setErrorMessage(err.message);
                setResult(RunningStatus.FAILED);
            })
            .finally(() => setIsPending(false));
    }, [nodeUuid, fetcher, currentRootNetworkUuid, studyUuid, resultConversion]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid || !currentRootNetworkUuid || !fetcher) {
            return;
        }
        const isUpdateForUs = isWorthUpdate(
            studyUpdatedForce,
            fetcher,
            lastUpdateRef,
            nodeUuidRef,
            rootNetworkUuidRef,
            nodeUuid,
            currentRootNetworkUuid,
            invalidations
        );
        lastUpdateRef.current = { studyUpdatedForce, fetcher };
        if (
            nodeUuidRef.current !== nodeUuid ||
            rootNetworkUuidRef.current !== currentRootNetworkUuid ||
            isUpdateForUs
        ) {
            update();
        }
    }, [update, fetcher, nodeUuid, invalidations, currentRootNetworkUuid, studyUpdatedForce, studyUuid]);

    return [result, isPending, setResult, errorMessage, update];
}
