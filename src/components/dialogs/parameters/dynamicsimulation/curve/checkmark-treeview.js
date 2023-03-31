/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

export const data = {
    id: 'root',
    name: 'Parent',
    children: [
        {
            id: '1',
            name: 'Child - 1',
        },
        {
            id: '3',
            name: 'Child - 3',
            children: [
                {
                    id: '4',
                    name: 'Child - 4',
                },
            ],
        },
    ],
};

export const data2 = [
    {
        id: 'parent-1',
        name: 'Parent 1',
    },
    {
        id: 'child-1-1',
        name: 'Child 1 1',
        parentId: 'parent-1',
    },
    {
        id: 'child-1-2',
        name: 'Child 1 2',
        parentId: 'parent-1',
    },
    {
        id: 'parent-2',
        name: 'Parent 2',
    },
    {
        id: 'child-2-1',
        name: 'Child 2 1',
        parentId: 'parent-2',
    },
    {
        id: 'child-2-1-1',
        name: 'Child 2 1 1',
        parentId: 'child-2-1',
    },
    {
        id: 'child-2-2',
        name: 'Child 2 2',
        parentId: 'parent-2',
    },
    {
        id: 'parent-3',
        name: 'Parent 3',
    },
];

export default function CheckmarkTreeView({ data }) {
    const renderTree = (nodes) =>
        nodes.map((node) => {
            <TreeItem key={node.id} nodeId={node.id} label={node.name}>
                {Array.isArray(nodes.children)
                    ? nodes.children.map((node) => renderTree(node))
                    : null}
            </TreeItem>;
        });

    return (
        <TreeView
            aria-label="rich object"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpanded={['root']}
            defaultExpandIcon={<ChevronRightIcon />}
            //sx={{ height: 110, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
        >
            {renderTree(data)}
        </TreeView>
    );
}
