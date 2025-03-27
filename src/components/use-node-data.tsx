/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { UUID } from 'crypto';
import { AppState, NotificationType, StudyUpdated } from '../redux/reducer';
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
    // check whether StudyUpdated notification is StudyUpdatedStudy, otherwise do not perform update
    if (studyUpdatedForce.type !== NotificationType.STUDY) {
        return false;
    }

    const headers = studyUpdatedForce?.eventData?.headers;
    const updateType = headers?.[UPDATE_TYPE_HEADER];
    const node = headers?.node;
    const nodes = headers?.nodes;
    const rootNetworkFromNotif = headers?.rootNetwork;

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

export function useNodeData<T, R = T>({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    fetcher,
    invalidations,
    defaultValue,
    resultConversion = identity,
}: {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    fetcher?: (studyUuid: UUID, nodeUuid: UUID, rootNetworkUuid: UUID) => Promise<T | null>;
    invalidations: string[];
    defaultValue?: R;
    resultConversion?: (fetchedResult: T | null) => R | null;
}) {
    const [result, setResult] = useState<R | undefined>(defaultValue);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef<UUID>();
    const rootNetworkUuidRef = useRef<UUID>();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const lastUpdateRef = useRef<{
        studyUpdatedForce: StudyUpdated;
        fetcher: (studyUuid: UUID, nodeUuid: UUID, rootNetworkUuid: UUID) => Promise<T | null>;
    }>();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        rootNetworkUuidRef.current = rootNetworkUuid;
        setIsLoading(true);
        setErrorMessage(undefined);
        fetcher?.(studyUuid, nodeUuid, rootNetworkUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid && rootNetworkUuidRef.current === rootNetworkUuid) {
                    setResult(resultConversion(res) ?? undefined);
                }
            })
            .catch((err) => {
                setErrorMessage(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [nodeUuid, fetcher, rootNetworkUuid, studyUuid, resultConversion]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid || !rootNetworkUuid || !fetcher) {
            return;
        }
        const isUpdateForUs = isWorthUpdate(
            studyUpdatedForce,
            fetcher,
            lastUpdateRef,
            nodeUuidRef,
            rootNetworkUuidRef,
            nodeUuid,
            rootNetworkUuid,
            invalidations
        );
        lastUpdateRef.current = { studyUpdatedForce, fetcher };
        if (nodeUuidRef.current !== nodeUuid || rootNetworkUuidRef.current !== rootNetworkUuid || isUpdateForUs) {
            update();
        }
    }, [update, fetcher, nodeUuid, invalidations, rootNetworkUuid, studyUpdatedForce, studyUuid]);

    return { result, isLoading, setResult, errorMessage, update };
}
