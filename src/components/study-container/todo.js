import { UPDATE_TYPE_HEADER } from 'components/study-container';
import RunningStatus from 'components/utils/running-status';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

function isWorthUpdate(
    studyUpdatedForce,
    fetcher,
    lastUpdateRef,
    nodeUuidRef,
    nodeUuid,
    invalidations
) {
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
    if (
        studyUpdatedForce &&
        lastUpdateRef.current?.studyUpdatedForce === studyUpdatedForce
    ) {
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
    fetcher,
    invalidations,
    defaultValue,
    resultConversion
) {
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
    }, [
        update,
        fetcher,
        nodeUuid,
        invalidations,
        studyUpdatedForce,
        studyUuid,
    ]);

    return [result, isPending, setResult, errorMessage, update];
}
