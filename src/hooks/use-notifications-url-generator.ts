/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    NotificationsUrlKeys,
    PREFIX_CONFIG_NOTIFICATION_WS,
    PREFIX_DIRECTORY_NOTIFICATION_WS,
    PREFIX_STUDY_NOTIFICATION_WS,
} from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type AppState } from 'redux/reducer.type';
import { getUrlWithToken, getWsBase } from 'services/utils';
import { APP_NAME } from 'utils/config-params';

const useNotificationsUrlGenerator = (): Partial<Record<NotificationsUrlKeys, string | undefined>> => {
    // The websocket API doesn't allow relative urls
    const wsBase = getWsBase();
    const tokenId = useSelector((state: AppState) => state.user?.id_token);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    // return a mapColumns with NOTIFICATIONS_URL_KEYS and undefined value if URL is not yet buildable (tokenId)
    // it will be used to register listeners as soon as possible.
    return useMemo(
        () => ({
            [NotificationsUrlKeys.CONFIG]: tokenId
                ? getUrlWithToken(
                      `${wsBase}${PREFIX_CONFIG_NOTIFICATION_WS}/notify?${new URLSearchParams({
                          appName: APP_NAME,
                      })}`
                  )
                : undefined,
            [NotificationsUrlKeys.GLOBAL_CONFIG]: tokenId
                ? getUrlWithToken(`${wsBase}${PREFIX_CONFIG_NOTIFICATION_WS}/global`)
                : undefined,
            [NotificationsUrlKeys.STUDY]:
                tokenId && studyUuid
                    ? getUrlWithToken(
                          `${wsBase}${PREFIX_STUDY_NOTIFICATION_WS}/notify?studyUuid=${encodeURIComponent(studyUuid)}`
                      )
                    : undefined,
            [NotificationsUrlKeys.DIRECTORY_DELETE_STUDY]:
                tokenId && studyUuid
                    ? getUrlWithToken(
                          `${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?updateType=deleteElement&elementUuid=${encodeURIComponent(
                              studyUuid
                          )}`
                      )
                    : undefined,
            [NotificationsUrlKeys.DIRECTORY]: tokenId
                ? getUrlWithToken(`${wsBase}${PREFIX_DIRECTORY_NOTIFICATION_WS}/notify?updateType=directories`)
                : undefined,
        }),
        [tokenId, wsBase, studyUuid]
    );
};

export default useNotificationsUrlGenerator;
