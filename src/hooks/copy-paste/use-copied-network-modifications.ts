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
import { NetworkModificationCopyType } from 'components/graph/menus/network-modifications/network-modification-menu.type';

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

    const dispatchEmptyCopiedNetworkModifications = useCallback(
        (snackInfoMessage = null) => {
            if (copyInfos?.originStudyUuid && snackInfoMessage) {
                snackInfo({
                    messageId: snackInfoMessage,
                });
            }
            dispatch(setCopiedNetworkModifications(emptyCopiedNetworkModificationsSelection));
        },
        [copyInfos?.originStudyUuid, dispatch, snackInfo]
    );

    const cleanCurrentTabClipboard = useCallback(
        (snackInfoMessage?: string) => {
            dispatchEmptyCopiedNetworkModifications();
            if (snackInfoMessage) {
                snackInfo({
                    messageId: snackInfoMessage,
                });
            }
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

    const cleanClipboard = useCallback(() => {
        cleanCurrentTabClipboard('copiedModificationsInvalidationMsg');
        cleanOtherTabsClipboard('copiedModificationsInvalidationMsgFromOtherStudy');
    }, [cleanCurrentTabClipboard, cleanOtherTabsClipboard]);

    const copyNetworkModifications = (copiedNetworkModifications: CopiedNetworkModifications) => {
        isInitiatingCopyTab.current = true;
        dispatchCopiedNetworkModifications(copiedNetworkModifications);
        switch (copiedNetworkModifications.copyInfos?.copyType) {
            case NetworkModificationCopyType.COPY:
                broadcastChannel.postMessage({
                    copiedNetworkModifications: copiedNetworkModifications,
                    message: 'copiedModificationsUpdateMsg',
                });
                break;
            case NetworkModificationCopyType.MOVE:
                cleanOtherTabsClipboard('copiedModificationsInvalidationMsg');
                break;
        }
    };

    return {
        networkModificationsToCopy,
        copyInfos,
        copyNetworkModifications,
        cleanCurrentTabClipboard,
        cleanOtherTabsClipboard,
        cleanClipboard,
    };
};
