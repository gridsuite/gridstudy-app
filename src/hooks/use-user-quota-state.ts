/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    fetchUserQuotaState,
    NotificationsUrlKeys,
    snackWithFallback,
    useNotificationsListener,
    useSnackMessage,
    type UserQuotaState,
} from '@gridsuite/commons-ui';
import { type AppState } from 'redux/reducer.type';

export default function useUserQuotaState() {
    const userName = useSelector((state: AppState) => state.user?.profile.sub);
    const [userQuotaState, setUserQuotaState] = useState<Record<string, UserQuotaState>>({});
    // quota notifications can trigger overlapping fetches, so only the latest response is applied
    const requestIdRef = useRef<number>(0);
    const { snackError } = useSnackMessage();

    const fetchQuotaState = useCallback(() => {
        if (userName) {
            const requestId = ++requestIdRef.current;
            fetchUserQuotaState(userName)
                .then((quotaState) => {
                    if (requestId === requestIdRef.current) {
                        setUserQuotaState(quotaState);
                    }
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FetchUserQuotaStateError' });
                });
        }
    }, [userName, snackError]);

    useEffect(() => {
        fetchQuotaState();
    }, [fetchQuotaState]);

    useNotificationsListener(NotificationsUrlKeys.QUOTA, {
        listenerCallbackMessage: fetchQuotaState,
        listenerCallbackOnReopen: fetchQuotaState,
    });

    return userQuotaState;
}
