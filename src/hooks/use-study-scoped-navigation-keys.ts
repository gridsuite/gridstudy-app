/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BASE_KEYS } from 'constants/study-navigation-sync-constants';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

// Shared hook for computing study-scoped localStorage keys
export const useStudyScopedNavigationKeys = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    return useMemo(
        () => ({
            SYNC_ENABLED: `${BASE_KEYS.SYNC_ENABLED}-${studyUuid}`,
            ROOT_NETWORK_UUID: `${BASE_KEYS.ROOT_NETWORK_UUID}-${studyUuid}`,
            TREE_NODE: `${BASE_KEYS.TREE_NODE}-${studyUuid}`,
        }),
        [studyUuid]
    );
};
