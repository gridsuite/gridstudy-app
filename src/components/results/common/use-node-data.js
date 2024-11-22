/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import RunningStatus from '../../utils/running-status';
import { isWorthUpdate } from '../../computing-status/use-computing-status';

export function useNodeData(studyUuid, nodeUuid, fetcher, invalidations, defaultValue, resultConversion) {
    const [result, setResult] = useState(defaultValue);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const lastUpdateRef = useRef();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        setIsPending(true);
        setErrorMessage(undefined);
        fetcher(studyUuid, nodeUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid) {
                    setResult(resultConversion ? resultConversion(res) : res);
                }
            })
            .catch((err) => {
                setErrorMessage(err.message);
                setResult(RunningStatus.FAILED);
            })
            .finally(() => setIsPending(false));
    }, [nodeUuid, fetcher, studyUuid, resultConversion]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid || !fetcher) {
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
        if (nodeUuidRef.current !== nodeUuid || isUpdateForUs) {
            update();
        }
    }, [update, fetcher, nodeUuid, invalidations, studyUpdatedForce, studyUuid]);

    return [result, isPending, setResult, errorMessage, update];
}
