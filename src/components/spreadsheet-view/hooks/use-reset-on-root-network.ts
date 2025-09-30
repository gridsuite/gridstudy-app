import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../../../redux/reducer';
import { useEffect, useRef } from 'react';
import { resetEquipments } from '../../../redux/actions';

export function useResetOnRootNetwork() {
    const dispatch = useDispatch();
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const prevCurrentRootNetworkUuidRef = useRef(currentRootNetworkUuid);

    // Reset equipment data on root network change
    useEffect(() => {
        if (prevCurrentRootNetworkUuidRef.current !== currentRootNetworkUuid) {
            dispatch(resetEquipments());
            prevCurrentRootNetworkUuidRef.current = currentRootNetworkUuid;
        }
    }, [dispatch, currentRootNetworkUuid]);
}
