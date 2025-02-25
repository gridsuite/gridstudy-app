/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RunningStatus } from './utils/running-status';

export const UPDATE_TYPE_HEADER = 'updateType';

function isWorthUpdate(
    studyUpdatedForce,
    fetcher,
    lastUpdateRef,
    nodeUuidRef,
    rootNetworkUuidRef,
    nodeUuid,
    rootNetworkUuid,
    invalidations
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

export function useNodeData(
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    fetcher,
    invalidations,
    defaultValue,
    resultConversion
) {
    const [result, setResult] = useState(defaultValue);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef();
    const rootNetworkUuidRef = useRef();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const lastUpdateRef = useRef();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        rootNetworkUuidRef.current = currentRootNetworkUuid;
        setIsPending(true);
        setErrorMessage(undefined);
        fetcher(studyUuid, nodeUuid, currentRootNetworkUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid && rootNetworkUuidRef.current === currentRootNetworkUuid) {
                    setResult(resultConversion ? resultConversion(res) : res);
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
