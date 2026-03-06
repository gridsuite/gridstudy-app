/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { AppState } from '../../../redux/reducer.type';
import { useStableComputedSet } from '../../../hooks/use-stable-computed-set';
import type { UUID } from 'node:crypto';
import { useNodeAliases, validAlias } from './use-node-aliases';
import { NodeType } from '../../graph/tree-node.type';
import { isStatusBuilt } from '../../graph/util/model-functions';

export function useBuiltNodesIds() {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);
    const isTreeModelUpToDate = useSelector((state: AppState) => state.isNetworkModificationTreeModelUpToDate);

    const { nodeAliases } = useNodeAliases();

    return useStableComputedSet(() => {
        if (!isTreeModelUpToDate) {
            return new Set<UUID>();
        }
        const aliasedNodesIds = nodeAliases
            ?.filter((nodeAlias) => validAlias(nodeAlias))
            .map((nodeAlias) => nodeAlias.id);
        if (currentNode?.id) {
            aliasedNodesIds?.push(currentNode.id);
        }

        const ids = new Set<UUID>();
        if (aliasedNodesIds && aliasedNodesIds.length > 0 && treeNodes) {
            for (const treeNode of treeNodes) {
                if (
                    aliasedNodesIds.includes(treeNode.id) &&
                    (treeNode.type === NodeType.ROOT || isStatusBuilt(treeNode.data.globalBuildStatus))
                ) {
                    ids.add(treeNode.id);
                }
            }
        }
        return ids;
    }, [nodeAliases, treeNodes]);
}
