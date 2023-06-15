import { UPDATE_TYPE_HEADER } from 'components/study-container';
import { RunningStatus } from 'components/utils/running-status';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setRunButtonStatus } from 'redux/actions';

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
    resultConversion,
    runButtonType
) {
    const [result, setResult] = useState();
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const lastUpdateRef = useRef();
    const dispatch = useDispatch();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        setIsPending(true);
        setErrorMessage(undefined);
        fetcher(studyUuid, nodeUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid) {
                    if (!runButtonType) {
                        setResult(
                            resultConversion ? resultConversion(res) : res
                        );
                    } else {
                        dispatch(
                            setRunButtonStatus(
                                runButtonType,
                                resultConversion ? resultConversion(res) : res
                            )
                        );
                    }
                }
            })
            .catch((err) => {
                setErrorMessage(err.message);
                if (!runButtonType) {
                    setResult(RunningStatus.FAILED);
                } else {
                    dispatch(
                        setRunButtonStatus(runButtonType, RunningStatus.FAILED)
                    );
                }
            })
            .finally(() => setIsPending(false));
    }, [
        runButtonType,
        nodeUuid,
        fetcher,
        studyUuid,
        resultConversion,
        dispatch,
    ]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid) {
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

    return [result, isPending, errorMessage, update];
}
