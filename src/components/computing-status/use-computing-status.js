import { UPDATE_TYPE_HEADER } from 'components/study-container';
import { RunningStatus } from 'components/utils/running-status';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setComputingStatus } from 'redux/actions';

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

// this hook loads <computingType> state into redux, then keeps it updated according to notifications
/**
 *
 * @param {String} studyUuid current study uuid
 * @param {String} nodeUuid current node uuid
 * @param {Function} fetcher method fetching current <computingType> state
 * @param {Array} invalidations when receiving notifications, if updateType is included in <invalidations>, this hook will update
 * @param {Function} resultConversion converts <fetcher> result to RunningStatus
 * @param {ComputingType} computingType ComputingType targeted by this hook
 */
export function useComputingStatus(
    studyUuid,
    nodeUuid,
    fetcher,
    invalidations,
    resultConversion,
    computingType
) {
    const nodeUuidRef = useRef();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const lastUpdateRef = useRef();
    const dispatch = useDispatch();

    const update = useCallback(() => {
        let canceledRequest = false;

        nodeUuidRef.current = nodeUuid;
        fetcher(studyUuid, nodeUuid)
            .then((res) => {
                if (!canceledRequest && nodeUuidRef.current === nodeUuid) {
                    dispatch(
                        setComputingStatus(computingType, resultConversion(res))
                    );
                }
            })
            .catch(() => {
                dispatch(
                    setComputingStatus(computingType, RunningStatus.FAILED)
                );
            });

        return () => {
            canceledRequest = true;
        };
    }, [
        computingType,
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
        if (isUpdateForUs) {
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
}
