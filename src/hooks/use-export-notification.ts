/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    NotificationsUrlKeys,
    parseError,
    snackWithFallback,
    useNotificationsListener,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { useExportDownload } from './use-export-download';
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import { isExportNetworkNotification } from '../types/notification-types';
import { buildExportIdentifier, isExportSubscribed, unsetExportSubscription } from '../utils/export-network-utils';
import { useIntl } from 'react-intl/lib';

export default function useExportNotification() {
    const { snackError, snackSuccess } = useSnackMessage();
    const { downloadExportNetworkFile } = useExportDownload();
    const intl = useIntl();
    const userId = useSelector((state: AppState) => state.user?.profile.sub);

    const handleExportNotification = useCallback(
        (event: MessageEvent<string>) => {
            const eventData = JSON.parse(event.data);
            if (isExportNetworkNotification(eventData)) {
                const { userId: userIdNotif, exportUuid, exportToGridExplore, error } = eventData.headers;
                const exportIdentifierNotif = buildExportIdentifier(exportUuid);
                const isSubscribed = isExportSubscribed(exportIdentifierNotif);
                if (isSubscribed && userIdNotif === userId) {
                    unsetExportSubscription(exportIdentifierNotif);
                    if (error) {
                        snackWithFallback(snackError, parseError(error), { headerId: 'export.message.failed' });
                    } else {
                        exportToGridExplore
                            ? snackSuccess({
                                  messageTxt: intl.formatMessage({ id: 'export.message.succeeded' }, { fileName: '' }),
                                  persist: true,
                              })
                            : downloadExportNetworkFile(exportUuid);
                    }
                }
            }
        },
        [userId, snackError, downloadExportNetworkFile, snackSuccess, intl]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleExportNotification });
}
