import { useCallback } from 'react';
import {
    isNodeDeletedNotification,
    isNodeEditedNotification,
    isSpreadsheetNodeAliasesUpdatedNotification,
} from '../../../types/notification-types';
import { NotificationsUrlKeys, useNotificationsListener } from '@gridsuite/commons-ui';
import { useNodeAliases } from './use-node-aliases';

export function useNodeAliasesUpdateOnNotification() {
    const { nodeAliases, fetchNodeAliases } = useNodeAliases();

    const listenerAliasesUpdated = useCallback(
        (event: MessageEvent) => {
            const eventData = JSON.parse(event.data);
            if (isSpreadsheetNodeAliasesUpdatedNotification(eventData)) {
                // aliases change notification
                fetchNodeAliases();
            } else if (isNodeEditedNotification(eventData)) {
                if (nodeAliases.map((node) => node.id).includes(eventData.headers.node)) {
                    fetchNodeAliases();
                }
            } else if (isNodeDeletedNotification(eventData)) {
                if (
                    eventData.headers.nodes.some((deletedNode) =>
                        nodeAliases.map((node) => node.id).includes(deletedNode)
                    )
                ) {
                    fetchNodeAliases();
                }
            }
        },
        [fetchNodeAliases, nodeAliases]
    );

    const listenerAliasesOnOpen = useCallback(fetchNodeAliases, [fetchNodeAliases, nodeAliases]);

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: listenerAliasesUpdated,
        listenerCallbackOnReopen: listenerAliasesOnOpen,
        propsId: 'node-aliases',
    });
}
