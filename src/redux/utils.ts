/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CurrentTreeNode, NodeType, RootNode } from '../components/graph/tree-node.type';

// type guard to check if the node is a Root
export function isReactFlowRootNodeData(node: CurrentTreeNode): node is RootNode {
    return node.type === NodeType.ROOT;
}
