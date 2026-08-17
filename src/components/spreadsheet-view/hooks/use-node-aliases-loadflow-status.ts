/*
 * Copyright © 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { NotificationsUrlKeys, RunningStatus, useNotificationsListener } from '@gridsuite/commons-ui';
import { AppState } from '../../../redux/reducer.type';
import type { RootState } from '../../../redux/store';
import { updateAliasedNodesValidity } from '../../../redux/actions';
import { fetchLoadFlowStatus } from '../../../services/study/loadflow';
import { getLoadFlowRunningStatus } from '../../utils/running-status';
import { isSecurityModificationNode } from '../../graph/tree-node.type';
import { loadFlowStatusInvalidations } from '../../computing-status/use-all-computing-status';
import { parseEventData, StudyUpdatedEventData } from '../../../types/notification-types';
import { NodeValidity } from '../columns/utils/column-validity';
import { useNodeAliases, validAlias } from './use-node-aliases';
import { useBuiltNodesIds } from './use-built-nodes-ids';

const REFRESH_ON = new Set<string>([...loadFlowStatusInvalidations, 'all_computation_status']);

export function useNodeAliasesLoadFlowStatus() {
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const { nodeAliases } = useNodeAliases();
    const builtNodesIds = useBuiltNodesIds();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const abortControllerRef = useRef<AbortController | undefined>(undefined);

    const update = useCallback(() => {
        abortControllerRef.current?.abort();

        // an unbuilt node has no variant, so no values in the row and nothing to judge
        const aliases = (nodeAliases ?? []).filter((alias) => validAlias(alias) && builtNodesIds.has(alias.id!));
        if (!studyUuid || !currentRootNetworkUuid || aliases.length === 0) {
            // rewriting an already empty map would rebuild every column definition for nothing
            if (Object.keys(store.getState().aliasedNodesValidity).length > 0) {
                dispatch(updateAliasedNodesValidity({}));
            }
            return;
        }
        // read, not subscribed to: a node stays a security node, and tree activity must not fetch
        const treeNodes = store.getState().networkModificationTreeModel?.treeNodes;
        const abortController = new AbortController();
        const { signal } = abortController;
        abortControllerRef.current = abortController;

        Promise.all(
            aliases.map((alias) =>
                fetchLoadFlowStatus(studyUuid, alias.id!, currentRootNetworkUuid, { signal })
                    .then(getLoadFlowRunningStatus)
                    .catch(() => RunningStatus.IDLE)
                    .then((loadFlowStatus): [string, NodeValidity] => [
                        alias.alias,
                        {
                            loadFlowStatus,
                            isSecurityNode: isSecurityModificationNode(
                                treeNodes?.find((treeNode) => treeNode.id === alias.id)
                            ),
                        },
                    ])
            )
        ).then((aliasedNodesValidity) => {
            if (!signal.aborted) {
                dispatch(updateAliasedNodesValidity(Object.fromEntries(aliasedNodesValidity)));
            }
        });
    }, [builtNodesIds, currentRootNetworkUuid, dispatch, nodeAliases, store, studyUuid]);

    useEffect(() => {
        update();
        return () => abortControllerRef.current?.abort();
    }, [update]);

    const onNotification = useCallback(
        (event: MessageEvent) => {
            const headers = parseEventData<StudyUpdatedEventData>(event)?.headers;
            if (!headers?.updateType || !REFRESH_ON.has(headers.updateType)) {
                return;
            }
            if (headers.rootNetworkUuid && headers.rootNetworkUuid !== currentRootNetworkUuid) {
                return;
            }
            const impactedNodes = headers.node ? [headers.node] : (headers.nodes ?? []);
            const aliasedNodesIds = new Set((nodeAliases ?? []).map((alias) => alias.id));
            if (impactedNodes.length > 0 && !impactedNodes.some((nodeId) => aliasedNodesIds.has(nodeId))) {
                return;
            }
            update();
        },
        [currentRootNetworkUuid, nodeAliases, update]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: onNotification,
        listenerCallbackOnReopen: update,
        propsId: 'node-aliases-loadflow-status',
    });
}
