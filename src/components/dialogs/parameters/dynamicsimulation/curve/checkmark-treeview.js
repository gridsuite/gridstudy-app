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

export default function CheckmarkTreeView({ data: items, ...rest }) {
    const renderChildren = (allItems, parentId) => {
        const children = allItems.filter((elem) => elem.parentId === parentId);
        return !children.length ? null : renderItems(allItems, children);
    };

    const renderItems = (allItems, itemsToRender = []) => {
        if (!itemsToRender.length) {
            // first level => auto lookup root items
            itemsToRender = allItems.filter((item) => !item.parentId);
        }

        return itemsToRender.map((elem) => (
            <TreeItem key={elem.id} nodeId={elem.id} label={elem.name}>
                {renderChildren(allItems, elem.id)}
            </TreeItem>
        ));
    };

    return (
        <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            {...rest}
        >
            {renderItems(items)}
        </TreeView>
    );
}
