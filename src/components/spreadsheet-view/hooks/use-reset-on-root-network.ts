/*
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
