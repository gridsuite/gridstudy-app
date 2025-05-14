/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SetStateAction, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UUID } from 'crypto';

import {
    AppState,
    NotificationType,
    RootNetworksDeletionStartedEventData,
    RootNetworksUpdatedEventData,
} from 'redux/reducer';

import { useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchRootNetworks } from 'services/root-network';
import { setCurrentRootNetworkUuid, setRootNetworks } from 'redux/actions';
import { NOTIFICATIONS_URL_KEYS } from 'components/utils/notificationsProvider-utils';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';

type UseRootNetworkNotificationsProps = {
    setIsRootNetworksProcessing: React.Dispatch<SetStateAction<boolean>>;
    updateSelectedItems?: (items: RootNetworkMetadata[]) => void;
};

export const useRootNetworkNotifications = ({
    setIsRootNetworksProcessing,
    updateSelectedItems,
}: UseRootNetworkNotificationsProps) => {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const currentRootNetworkUuidRef = useRef<UUID | null>(null);
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;

    const rootNetworksRef = useRef<RootNetworkMetadata[]>([]);
    rootNetworksRef.current = rootNetworks;

    const doFetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    if (updateSelectedItems) {
                        updateSelectedItems(res);
                    }
                    dispatch(setRootNetworks(res));

                    // This is used to hide the loader for creation, update and deletion of the root networks.
                    // All the root networks must be fully established before the loader can be safely removed.
                    if (res.every((network) => !network.isCreating)) {
                        setIsRootNetworksProcessing(false);
                    }
                })
                .catch((error) => {
                    snackError({ messageTxt: error.message });
                });
        }
    }, [studyUuid, updateSelectedItems, dispatch, setIsRootNetworksProcessing, snackError]);

    const rootNetworkModifiedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATED) {
                doFetchRootNetworks();
            }
        },
        [doFetchRootNetworks]
    );

    const rootNetworksUpdateFailedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATE_FAILED) {
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
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksDeletionStartedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_DELETION_STARTED) {
                if (!rootNetworksRef.current) {
                    return;
                }
                // If the current root network isn't going to be deleted, we don't need to do anything
                const deletedRootNetworksUuids = eventData.headers.rootNetworksUuids;
                if (
                    currentRootNetworkUuidRef.current &&
                    !deletedRootNetworksUuids.includes(currentRootNetworkUuidRef.current)
                ) {
                    return;
                }
                // Choice: if the current root network is going to be deleted, we select the first root network that won't be deleted
                const newSelectedRootNetwork = rootNetworksRef.current.find(
                    (rootNetwork) => !deletedRootNetworksUuids.includes(rootNetwork.rootNetworkUuid)
                );
                if (newSelectedRootNetwork) {
                    dispatch(setCurrentRootNetworkUuid(newSelectedRootNetwork.rootNetworkUuid));
                }
            }
        },
        [currentRootNetworkUuidRef, dispatch, rootNetworksRef]
    );

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworkModifiedNotification,
    });
    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworksUpdateFailedNotification,
    });
    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworkDeletionStartedNotification,
    });
};
