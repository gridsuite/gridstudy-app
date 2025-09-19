/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import type { AppState } from '../../../redux/reducer';
import { useStableComputedSet } from '../../../hooks/use-stable-computed-set';
import type { UUID } from 'crypto';
import { validAlias } from './use-node-aliases';
import { NodeType } from '../../graph/tree-node.type';
import { isStatusBuilt } from '../../graph/util/model-functions';
import type { NodeAlias } from '../types/node-alias.type';

export function useBuiltNodesIds(nodeAliases: NodeAlias[] | undefined) {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const treeNodes = useSelector((state: AppState) => state.networkModificationTreeModel?.treeNodes);

    return useStableComputedSet(() => {
        const aliasedNodesIds = nodeAliases
            ?.filter((nodeAlias) => validAlias(nodeAlias))
            .map((nodeAlias) => nodeAlias.id);
        if (currentNode?.id) {
            aliasedNodesIds?.push(currentNode.id);
        }

        const ids = new Set<UUID>();
        if (aliasedNodesIds && aliasedNodesIds.length > 0) {
            treeNodes?.forEach((treeNode) => {
                if (
                    aliasedNodesIds.includes(treeNode.id) &&
                    (treeNode.type === NodeType.ROOT || isStatusBuilt(treeNode.data.globalBuildStatus))
                ) {
                    ids.add(treeNode.id);
                }
            });
        }
        return ids;
    }, [nodeAliases, treeNodes]);
}
