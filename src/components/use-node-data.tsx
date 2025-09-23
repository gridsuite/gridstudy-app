/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { AppState, StudyUpdated } from '../redux/reducer';
import { identity, useDebounce } from '@gridsuite/commons-ui';
import { StudyUpdatedEventData } from 'types/notification-types';

export type ResultFetcher<T> = (studyUuid: UUID, nodeUuid: UUID, rootNetworkUuid: UUID) => Promise<T | null>;

type LastUpdateParams<T> = {
    studyUpdatedForce: StudyUpdated;
    fetcher: ResultFetcher<T>;
};

/**
 * Parameters for checking whether it should perform a fetch to get new result.
 *
 * @template T - The type of result returned by the fetch.
 */
type ShouldUpdateParams<T> = {
    studyUpdatedForce: StudyUpdated;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    fetcher: ResultFetcher<T>;
    invalidations: string[];
    lastUpdateRef: RefObject<LastUpdateParams<T> | undefined>;
    nodeUuidRef: RefObject<UUID | undefined>;
    rootNetworkUuidRef: RefObject<UUID | undefined>;
};

function shouldUpdate<T>({
    studyUpdatedForce,
    nodeUuid,
    rootNetworkUuid,
    fetcher,
    invalidations,
    lastUpdateRef,
    nodeUuidRef,
    rootNetworkUuidRef,
}: ShouldUpdateParams<T>) {
    const studyUpdatedEventData = studyUpdatedForce?.eventData as StudyUpdatedEventData; // TODO narrowing by predicate
    const headers = studyUpdatedEventData?.headers;
    const updateType = headers?.updateType;
    const nodeUuidFromNotif = headers?.node;
    const nodeUuidsFromNotif = headers?.nodes;
    const rootNetworkFromNotif = headers?.rootNetworkUuid;

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
    if (nodeUuidFromNotif === undefined && nodeUuidsFromNotif === undefined) {
        return true;
    }
    if (nodeUuidFromNotif === nodeUuid || nodeUuidsFromNotif?.indexOf(nodeUuid) !== -1) {
        return true;
    }

    return false;
}

/**
 * Parameters for fetching and processing results.
 *
 * @template T - The type of result returned by the fetch.
 * @template R - The type of result after conversion (defaults to `T` if no conversion is provided).
 */
export type UseNodeDataParams<T, R = T> = {
    studyUuid: UUID;
    nodeUuid: UUID;
    rootNetworkUuid: UUID;
    fetcher: ResultFetcher<T> | undefined;
    invalidations: string[];
    defaultValue?: R;
    resultConverter?: (fetchedResult: T | null) => R | null;
};

export function useNodeData<T, R = T>({
    studyUuid,
    nodeUuid,
    rootNetworkUuid,
    fetcher,
    invalidations,
    defaultValue,
    resultConverter = identity,
}: UseNodeDataParams<T, R>) {
    const [result, setResult] = useState<R | undefined>(defaultValue);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef<UUID>();
    const rootNetworkUuidRef = useRef<UUID>();
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);
    const lastUpdateRef = useRef<LastUpdateParams<T>>();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        rootNetworkUuidRef.current = rootNetworkUuid;
        setIsLoading(true);
        setErrorMessage(undefined);
        fetcher?.(studyUuid, nodeUuid, rootNetworkUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid && rootNetworkUuidRef.current === rootNetworkUuid) {
                    setResult(resultConverter(res) ?? undefined);
                }
            })
            .catch((err) => {
                setErrorMessage(err.message);
            })
            .finally(() => setIsLoading(false));
    }, [nodeUuid, fetcher, rootNetworkUuid, studyUuid, resultConverter]);

    // Debounce the update to avoid excessive calls
    const debouncedUpdate = useDebounce(update, 1000);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid || !rootNetworkUuid || !fetcher) {
            return;
        }
        const isUpdateForUs = shouldUpdate({
            studyUpdatedForce,
            rootNetworkUuid,
            nodeUuid,
            fetcher,
            invalidations,
            lastUpdateRef,
            nodeUuidRef,
            rootNetworkUuidRef,
        });
        lastUpdateRef.current = { studyUpdatedForce, fetcher };
        if (nodeUuidRef.current !== nodeUuid || rootNetworkUuidRef.current !== rootNetworkUuid || isUpdateForUs) {
            debouncedUpdate();
        }
    }, [debouncedUpdate, fetcher, nodeUuid, invalidations, rootNetworkUuid, studyUpdatedForce, studyUuid]);

    return { result, isLoading, setResult, errorMessage, update };
}
