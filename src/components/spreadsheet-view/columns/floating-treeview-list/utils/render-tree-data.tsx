/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MutableRefObject } from 'react';
import { TreeNode } from './json-schema-parser';
import { TreeItem } from '@mui/x-tree-view';
import { TreeLabel } from '../tree-label';

export function renderTreeData(
    nodes: TreeNode[],
    query: string,
    itemRefs: MutableRefObject<Record<string, HTMLLIElement | null>>,
    matches: TreeNode[],
    currentResultIndex: number
) {
    return nodes.map((node) => {
        const isActive = matches[currentResultIndex]?.id === node.id;
        return (
            <TreeItem
                key={node.id}
                itemId={node.id}
                ref={(el) => (itemRefs.current[node.id] = el)}
                label={<TreeLabel text={node.label} type={node.type} highlight={query} active={isActive} />}
            >
                {node.children && renderTreeData(node.children, query, itemRefs, matches, currentResultIndex)}
            </TreeItem>
        );
    });
}
