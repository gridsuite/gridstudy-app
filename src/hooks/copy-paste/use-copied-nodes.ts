/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { CopyType } from 'components/network-modification.type';
import { UUID } from 'node:crypto';
import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNodeSelectionForCopy } from 'redux/actions';
import { AppState, NodeSelectionForCopy } from 'redux/reducer';

export const nodeCopyChannel = new BroadcastChannel('NodeCopyChannel');

const emptyNodeSelectionForCopy: NodeSelectionForCopy = {
    sourceStudyUuid: null,
    nodeId: null,
    copyType: null,
    nodeType: null,
    allChildren: null,
};

export const useCopiedNodes = () => {
    const dispatch = useDispatch();
    const { snackInfo } = useSnackMessage();

    const selectionForCopy = useSelector((state: AppState) => state.nodeSelectionForCopy);
    const nodeSelectionForCopyRef = useRef<NodeSelectionForCopy>(null);
    nodeSelectionForCopyRef.current = selectionForCopy;
    const isInitiatingCopyTab = useRef(false);

    const dispatchNodeSelectionForCopy = useCallback(
        (sourceStudyUuid: UUID, nodeId: UUID, copyType: CopyType) => {
            dispatch(
                setNodeSelectionForCopy({
                    sourceStudyUuid: sourceStudyUuid,
                    nodeId: nodeId,
                    copyType: copyType,
                })
            );
        },
        [dispatch]
    );

    const dispatchEmptyNodeSelectionForCopy = useCallback(
        (snackInfoMessage?: string) => {
            if (nodeSelectionForCopyRef.current?.nodeId && snackInfoMessage) {
                snackInfo({
                    messageId: snackInfoMessage,
                });
            }
            dispatch(setNodeSelectionForCopy(emptyNodeSelectionForCopy));
        },
        [dispatch, snackInfo]
    );

    const [broadcastChannel] = useState(() => {
        const broadcast = nodeCopyChannel;
        broadcast.onmessage = (event) => {
            console.info('message received from broadcast channel: ', event.data);
            isInitiatingCopyTab.current = false;
            if (JSON.stringify(emptyNodeSelectionForCopy) === JSON.stringify(event.data.nodeToCopy)) {
                dispatchEmptyNodeSelectionForCopy(event.data.message);
            } else {
                dispatchNodeSelectionForCopy(
                    event.data.nodeToCopy.sourceStudyUuid,
                    event.data.nodeToCopy.nodeId,
                    event.data.nodeToCopy.copyType
                );
                snackInfo({ messageId: event.data.message });
            }
        };
        return broadcast;
    });

    const cleanCurrentTabClipboard = useCallback(
        (snackInfoMessage?: string) => {
            dispatchEmptyNodeSelectionForCopy(snackInfoMessage);
        },
        [dispatchEmptyNodeSelectionForCopy]
    );

    const cleanOtherTabsClipboard = useCallback(
        (snackInfoMessage?: string) => {
            if (true === isInitiatingCopyTab.current) {
                broadcastChannel.postMessage({
                    nodeToCopy: emptyNodeSelectionForCopy,
                    message: snackInfoMessage,
                });
                isInitiatingCopyTab.current = false;
            }
        },
        [broadcastChannel]
    );

    const cleanClipboard = useCallback(() => {
        cleanCurrentTabClipboard('copiedNodeInvalidationMsg');
        cleanOtherTabsClipboard('copiedNodeInvalidationMsgFromOtherStudy');
    }, [cleanCurrentTabClipboard, cleanOtherTabsClipboard]);

    const copyToCurrentTabNode = (sourceStudyUuid: UUID, nodeId: UUID, copyType: CopyType) => {
        dispatchNodeSelectionForCopy(sourceStudyUuid, nodeId, copyType);
        isInitiatingCopyTab.current = true;
    };

    const copyToAllTabsNetworkModifications = (sourceStudyUuid: UUID, nodeId: UUID, copyType: CopyType) => {
        copyToCurrentTabNode(sourceStudyUuid, nodeId, copyType);
        broadcastChannel.postMessage({
            nodeToCopy: { sourceStudyUuid: sourceStudyUuid, nodeId: nodeId, copyType: copyType },
            message: 'copiedNodeUpdateMsg',
        });
    };

    return {
        selectionForCopy,
        copyToCurrentTabNode,
        copyToAllTabsNetworkModifications,
        dispatchEmptyNodeSelectionForCopy,
        cleanCurrentTabClipboard,
        cleanOtherTabsClipboard,
        cleanClipboard,
    };
};
