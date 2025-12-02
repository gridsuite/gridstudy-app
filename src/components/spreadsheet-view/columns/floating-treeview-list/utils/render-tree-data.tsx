/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { RefObject } from 'react';
import { TreeNode } from './json-schema-parser';
import { TreeItem } from '@mui/x-tree-view';
import { TreeLabel } from '../tree-label';

export function renderTreeData(
    nodes: TreeNode[],
    query: string,
    itemRefs: RefObject<Record<string, HTMLLIElement | null>>,
    matches: TreeNode[],
    currentResultIndex: number
) {
    return nodes.map((node, index) => {
        const isActive = matches[currentResultIndex]?.id === node.id;
        return (
            <TreeItem
                key={`${index}${node.id}`}
                itemId={node.id}
                // @ts-ignore
                ref={(el) => (itemRefs.current[node.id] = el)}
                label={
                    <TreeLabel
                        key={`${index}${node.id}`}
                        text={node.label}
                        type={node.type}
                        highlight={query}
                        active={isActive}
                    />
                }
            >
                {node.children && renderTreeData(node.children, query, itemRefs, matches, currentResultIndex)}
            </TreeItem>
        );
    });
}
