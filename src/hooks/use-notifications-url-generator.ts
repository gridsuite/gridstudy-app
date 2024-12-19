/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { NOTIFICATIONS_URL_KEYS, PREFIX_CONFIG_NOTIFICATION_WS } from '../components/utils/notificationsProvider-utils';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type AppState } from '../redux/reducer';
import { getUrlWithToken, getWsBase } from '../services/utils';
import { APP_NAME } from '../utils/config-params';

export default function useNotificationsUrlGenerator() {
    // The websocket API doesn't allow relative urls
    const wsBase = getWsBase();
    const tokenId = useSelector((state: AppState) => state.user?.id_token);
    // Add params to Url
    const urlParams = useCallback((mapper: Record<string, string>) => {
        const usp = new URLSearchParams();
        Object.entries(mapper).forEach(([key, value]) => {
            usp.append(key, value);
        });
        return usp;
    }, []);

    const urlMapper = useMemo(() => {
        // return a mapper with NOTIFICATIONS_URL_KEYS and undefined value if URL is not yet buildable (tokenId)
        // it will be used to register listeners as soon as possible.
        let mapper: Object = {
            [NOTIFICATIONS_URL_KEYS.CONFIG]: tokenId
                ? getUrlWithToken(
                      `${wsBase}${PREFIX_CONFIG_NOTIFICATION_WS}/notify?${urlParams({ appName: APP_NAME })}`
                  )
                : undefined,
        };
        return mapper;
    }, [wsBase, urlParams, tokenId]);
    return urlMapper;
};
