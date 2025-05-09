/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { Paper, useTheme } from '@mui/material';
import RootNetworkPanelHeader from './root-network-panel-header';
import RootNetworkMinimizedPanelContent from './root-network-minimized-panel-content';
import RootNetworkNodeEditor from './root-network-node-editor';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, NotificationType, RootNetworksUpdatedEventData } from 'redux/reducer';
import { fetchRootNetworks } from 'services/root-network';
import { RootNetworkMetadata } from '../network-modifications/network-modification-menu.type';
import { setRootNetworks } from 'redux/actions';
import { useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import { NOTIFICATIONS_URL_KEYS } from 'components/utils/notificationsProvider-utils';

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
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const dispatch = useDispatch();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

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

    const dofetchRootNetworks = useCallback(() => {
        if (studyUuid) {
            fetchRootNetworks(studyUuid)
                .then((res: RootNetworkMetadata[]) => {
                    dispatch(setRootNetworks(res));
                    // This is used to hide the loader for creation, update and deletion of the root networks.
                    // All the root networks must be fully established before the loader can be safely removed.
                    if (res.every((network) => !network.isCreating)) {
                        setIsRootNetworksProcessing(false);
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                    });
                });
        }
    }, [studyUuid, dispatch, setIsRootNetworksProcessing, snackError]);

    const rootNetworksUpdateFailedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATE_FAILED) {
                dofetchRootNetworks();
                snackError({
                    messageId: 'importCaseFailure',
                    headerId: 'createRootNetworksError',
                });
            }
        },
        [dofetchRootNetworks, snackError]
    );

    const rootNetworkModifiedNotification = useCallback(
        (event: MessageEvent<string>) => {
            const parsedEventData: unknown = JSON.parse(event.data);
            const eventData = parsedEventData as RootNetworksUpdatedEventData;
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.ROOT_NETWORKS_UPDATED) {
                dofetchRootNetworks();
            }
        },
        [dofetchRootNetworks]
    );

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
                />
            )}
        </Paper>
    );
};

export default RootNetworkPanel;
