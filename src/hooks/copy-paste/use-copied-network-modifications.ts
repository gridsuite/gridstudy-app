/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, CopiedNetworkModifications } from 'redux/reducer';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { setCopiedNetworkModifications } from 'redux/actions';

const networkModificationsCopyChannel = new BroadcastChannel('NetworkModificationsCopyBroadcastChannel');

const emptyCopiedNetworkModificationsSelection: CopiedNetworkModifications = {
    networkModificationUuids: [],
    copyInfos: null,
};

export const useCopiedNetworkModifications = () => {
    const dispatch = useDispatch();
    const { snackInfo } = useSnackMessage();

    const networkModificationsToCopy = useSelector(
        (state: AppState) => state.copiedNetworkModifications.networkModificationUuids
    );
    const copyInfos = useSelector((state: AppState) => state.copiedNetworkModifications.copyInfos);
    const isInitiatingCopyTab = useRef(false);

    const [broadcastChannel] = useState(() => {
        const broadcast = networkModificationsCopyChannel;
        broadcast.onmessage = (event) => {
            console.info('message received from broadcast channel: ', event.data);
            isInitiatingCopyTab.current = false;
            if (
                JSON.stringify(emptyCopiedNetworkModificationsSelection) ===
                JSON.stringify(event.data.copiedNetworkModifications)
            ) {
                cleanCurrentTabClipboard(event.data.message);
            } else {
                dispatchCopiedNetworkModifications(event.data.copiedNetworkModifications);
                snackInfo({ messageId: event.data.message });
            }
        };
        return broadcast;
    });

    const dispatchCopiedNetworkModifications = useCallback(
        (networkModificationsToCopy: CopiedNetworkModifications) => {
            dispatch(setCopiedNetworkModifications(networkModificationsToCopy));
        },
        [dispatch]
    );

    const dispatchEmptyCopiedNetworkModifications = useCallback(() => {
        dispatch(setCopiedNetworkModifications(emptyCopiedNetworkModificationsSelection));
    }, [dispatch]);

    const cleanCurrentTabClipboard = useCallback(
        (snackInfoMessage?: string) => {
            if (snackInfoMessage) {
                snackInfo({
                    messageId: snackInfoMessage,
                });
            }
            dispatchEmptyCopiedNetworkModifications();
        },
        [dispatchEmptyCopiedNetworkModifications, snackInfo]
    );
    const cleanOtherTabsClipboard = useCallback(
        (snackInfoMessage?: string) => {
            if (true === isInitiatingCopyTab.current) {
                broadcastChannel.postMessage({
                    copiedNetworkModifications: emptyCopiedNetworkModificationsSelection,
                    message: snackInfoMessage,
                });
                isInitiatingCopyTab.current = false;
            }
        },
        [broadcastChannel]
    );

    const cleanClipboard = useCallback(
        (showSnackInfo = true, snackInfoMessage?: string) => {
            cleanCurrentTabClipboard(
                showSnackInfo ? (snackInfoMessage ?? 'copiedModificationsInvalidationMsg') : undefined
            );
            cleanOtherTabsClipboard(
                showSnackInfo ? (snackInfoMessage ?? 'copiedModificationsInvalidationMsgFromOtherStudy') : undefined
            );
        },
        [cleanCurrentTabClipboard, cleanOtherTabsClipboard]
    );

    const copyNetworkModifications = (copiedNetworkModifications: CopiedNetworkModifications) => {
        isInitiatingCopyTab.current = true;
        dispatchCopiedNetworkModifications(copiedNetworkModifications);
        broadcastChannel.postMessage({
            copiedNetworkModifications: copiedNetworkModifications,
            message: 'copiedModificationsUpdateMsg',
        });
    };

    const cutNetworkModifications = (copiedNetworkModifications: CopiedNetworkModifications) => {
        isInitiatingCopyTab.current = true;
        dispatchCopiedNetworkModifications(copiedNetworkModifications);
        cleanOtherTabsClipboard('copiedModificationsInvalidationMsgFromOtherStudy');
    };

    return {
        networkModificationsToCopy,
        copyInfos,
        copyNetworkModifications,
        cutNetworkModifications,
        cleanClipboard,
    };
};
