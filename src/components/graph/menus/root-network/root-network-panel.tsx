/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useDispatch, useSelector } from 'react-redux';
import {
    AppState,
    NotificationType,
    RootNetworksDeletionStartedEventData,
    RootNetworksUpdatedEventData,
} from 'redux/reducer';
import { fetchRootNetworks } from 'services/root-network';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';
import { setCurrentRootNetworkUuid, setRootNetworks } from 'redux/actions';
import { useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { NOTIFICATIONS_URL_KEYS } from 'components/utils/notificationsProvider-utils';
import { UUID } from 'crypto';

const styles = {
    paper: {
        position: 'absolute',
        top: 16,
        left: 16,
        borderRadius: '8px',
        zIndex: 10,
        overflow: 'hidden',
    },
};

const RootNetworkPanel: FunctionComponent = () => {
    const [isRootNetworksProcessing, setIsRootNetworksProcessing] = useState(false);
    const [isRootNetworkPanelMinimized, setIsRootNetworkPanelMinimized] = useState(false);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);

    const [selectedItems, setSelectedItems] = useState<RootNetworkMetadata[]>([]);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const updateSelectedItems = useCallback((rootNetworks: RootNetworkMetadata[]) => {
        const toKeepIdsSet = new Set(rootNetworks.map((e) => e.rootNetworkUuid));
        setSelectedItems((oldselectedItems) => oldselectedItems.filter((s) => toKeepIdsSet.has(s.rootNetworkUuid)));
    }, []);

    const dispatch = useDispatch();

    const { snackError } = useSnackMessage();
    const currentRootNetworkUuidRef = useRef<UUID | null>(null);
    currentRootNetworkUuidRef.current = currentRootNetworkUuid;

    const rootNetworksRef = useRef<RootNetworkMetadata[]>([]);
    rootNetworksRef.current = rootNetworks;

    const theme = useTheme();
    // Set the panel's width and height based on designer's proposed values
    const panelStyle = useMemo(() => {
        const width = theme.spacing(isRootNetworkPanelMinimized ? 22 : 38);

        const minHeight = theme.spacing(
            isRootNetworkPanelMinimized ? (isMonoRootStudy ? 6 : 12) : isMonoRootStudy ? 14 : 38
        );

        return {
            ...styles.paper,
            width,
            minHeight,
        };
    }, [isRootNetworkPanelMinimized, isMonoRootStudy, theme]);

    const doFetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    updateSelectedItems(res);
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
    }, [studyUuid, updateSelectedItems, dispatch, snackError]);

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
        [dispatch]
    );

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworkDeletionStartedNotification,
    });

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworkModifiedNotification,
    });
    useNotificationsListener(NOTIFICATIONS_URL_KEYS.STUDY, {
        listenerCallbackMessage: rootNetworksUpdateFailedNotification,
    });

    return (
        <Paper elevation={3} sx={panelStyle}>
            <RootNetworkPanelHeader
                isRootNetworksProcessing={isRootNetworksProcessing}
                setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                isRootNetworkPanelMinimized={isRootNetworkPanelMinimized}
                setIsRootNetworkPanelMinimized={setIsRootNetworkPanelMinimized}
            />
            {isRootNetworkPanelMinimized && !isMonoRootStudy && <RootNetworkMinimizedPanelContent />}
            {!isRootNetworkPanelMinimized && (
                <RootNetworkNodeEditor
                    isRootNetworksProcessing={isRootNetworksProcessing}
                    setIsRootNetworksProcessing={setIsRootNetworksProcessing}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                />
            )}
        </Paper>
    );
};

export default RootNetworkPanel;
