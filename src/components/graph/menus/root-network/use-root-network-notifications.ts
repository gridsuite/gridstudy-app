/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SetStateAction, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { NotificationsUrlKeys, useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchRootNetworks } from 'services/root-network';
import { setMonoRootStudy, setRootNetworks } from 'redux/actions';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';
import {
    isRootNetworkDeletionStartedNotification,
    isRootNetworksUpdatedNotification,
    isRootNetworkUpdateFailedNotification,
} from 'types/notification-types';
import { useSyncNavigationActions } from 'hooks/use-sync-navigation-actions';

type UseRootNetworkNotificationsProps = {
    setIsRootNetworksProcessing: React.Dispatch<SetStateAction<boolean>>;
};

export const useRootNetworkNotifications = ({ setIsRootNetworksProcessing }: UseRootNetworkNotificationsProps) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const { setCurrentRootNetworkUuidWithSync } = useSyncNavigationActions();

    const doFetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    dispatch(setRootNetworks(res));

                    // This is used to hide the loader for creation, update and deletion of the root networks.
                    // All the root networks must be fully established before the loader can be safely removed.
                    if (res.every((network) => !network.isCreating)) {
                        setIsRootNetworksProcessing(false);
                    }
                    if (res.length > 1) {
                        dispatch(setMonoRootStudy(false));
                    }
                })
                .catch((error) => {
                    snackError({ messageTxt: error.message });
                });
        }
    }, [studyUuid, dispatch, setIsRootNetworksProcessing, snackError]);

    const rootNetworksUpdatedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const eventData: unknown = JSON.parse(event.data);
            if (isRootNetworksUpdatedNotification(eventData)) {
                doFetchRootNetworks();
            }
        },
        [doFetchRootNetworks]
    );

    const rootNetworksUpdateFailedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const eventData: unknown = JSON.parse(event.data);
            if (isRootNetworkUpdateFailedNotification(eventData)) {
                doFetchRootNetworks();
                snackError({
                    messageId: 'importCaseFailure',
                    headerId: 'createRootNetworksError',
                });
            }
        },
        [doFetchRootNetworks, snackError]
    );
    const rootNetworkDeletionStartedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const eventData: unknown = JSON.parse(event.data);
            if (isRootNetworkDeletionStartedNotification(eventData)) {
                if (!rootNetworks) {
                    return;
                }
                // If the current root network isn't going to be deleted, we don't need to do anything
                const deletedRootNetworksUuids = eventData.headers.rootNetworksUuids;
                if (currentRootNetworkUuid && !deletedRootNetworksUuids.includes(currentRootNetworkUuid)) {
                    return;
                }
                // Choice: if the current root network is going to be deleted, we select the first root network that won't be deleted
                const newSelectedRootNetwork = rootNetworks.find(
                    (rootNetwork) => !deletedRootNetworksUuids.includes(rootNetwork.rootNetworkUuid)
                );
                if (newSelectedRootNetwork) {
                    setCurrentRootNetworkUuidWithSync(newSelectedRootNetwork.rootNetworkUuid);
                }
            }
        },
        [currentRootNetworkUuid, rootNetworks, setCurrentRootNetworkUuidWithSync]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: rootNetworksUpdatedNotification,
    });
    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: rootNetworksUpdateFailedNotification,
    });
    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: rootNetworkDeletionStartedNotification,
    });
};
