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
import { alpha, Checkbox } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import { treeItemClasses } from '@mui/lab';

export const CheckState = {
    UNCHECKED: 0,
    CHECKED: 1,
    INDETERMINATE: 2,
};

const BorderedTreeItem = styled(TreeItem)(({ theme, root }) => {
    const border = `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`;
    return {
        position: 'relative',
        '&:before': {
            pointerEvents: 'none',
            content: '""',
            position: 'absolute',
            width: 16,
            left: -16,
            top: 20,
            borderBottom: root ? 'none' : border,
        },
        [`& .${treeItemClasses.group}`]: {
            marginLeft: 15,
            paddingLeft: 18,
            borderLeft: border,
        },
    };
});

export default function CheckboxTreeview({ data: items, checkAll, ...rest }) {
    const [itemStates, setItemStates] = useState(
        useMemo(() => {
            return items.map((elem) => ({
                id: elem.id,
                state: checkAll ? CheckState.CHECKED : CheckState.UNCHECKED,
            }));
        }, [items, checkAll])
    );

    const updateItemState = useCallback((itemStates, items, onClickedId) => {
        const getState = (itemStates, id) => {
            return itemStates.find((elem) => elem.id === id);
        };

        const updateStateParent = (itemStates, items, childId) => {
            const child = items.find((elem) => elem.id === childId);
            const parent = items.find((elem) => elem.id === child.parentId);

            if (!parent) return; // at root item

            const childrenIds = items
                .filter((elem) => elem.parentId === parent.id)
                .map((elem) => elem.id);

            const childrenStates = childrenIds.map((id) =>
                getState(itemStates, id)
            );

            // recompute state of parent
            const parentState = itemStates.find(
                (elem) => elem.id === parent.id
            );
            // initial default state
            parentState.state = CheckState.INDETERMINATE;
            // all children checked => parent must be checked
            if (
                childrenStates.every(
                    (elem) => elem.state === CheckState.CHECKED
                )
            ) {
                parentState.state = CheckState.CHECKED;
            }
            // all children unchecked => parent must be unchecked
            if (
                childrenStates.every(
                    (elem) => elem.state === CheckState.UNCHECKED
                )
            ) {
                parentState.state = CheckState.UNCHECKED;
            }

            // recursive visit
            updateStateParent(itemStates, items, parent.id);
        };

        const setState = (itemStates, items, id, newState) => {
            itemStates.find((elem) => elem.id === id).state = newState;
            // set all children the same state of current element
            const children = items.filter((elem) => elem.parentId === id);
            children.forEach((elem) =>
                setState(itemStates, items, elem.id, newState)
            );

            // update parent's state of the current element
            updateStateParent(itemStates, items, id);
        };

        // update item's state
        const newItemStates = itemStates.map((elem) => ({ ...elem }));
        // get current state
        const currentState = getState(itemStates, onClickedId);
        setState(
            newItemStates,
            items,
            onClickedId,
            currentState.state === CheckState.CHECKED
                ? CheckState.UNCHECKED
                : CheckState.CHECKED
        );

        return newItemStates;
    }, []);

    const handleItemSelect = useCallback(
        (event, id) => {
            event.stopPropagation();
            const newItemStates = updateItemState(itemStates, items, id);
            setItemStates(newItemStates);
        },
        [itemStates, items, updateItemState]
    );

    const handleExpand = (event) => {
        event.stopPropagation();
    };

    const getState = useCallback(
        (id) => {
            return itemStates.find((elem) => elem.id === id).state;
        },
        [itemStates]
    );

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
            <BorderedTreeItem
                key={elem.id}
                nodeId={elem.id}
                onClick={handleExpand}
                root={!elem.parentId}
                label={
                    <>
                        <Checkbox
                            checked={CheckState.CHECKED === getState(elem.id)}
                            indeterminate={
                                CheckState.INDETERMINATE === getState(elem.id)
                            }
                            onClick={(event) =>
                                handleItemSelect(event, elem.id)
                            }
                        />
                        {elem.name}
                    </>
                }
            >
                {renderChildren(allItems, elem.id)}
            </BorderedTreeItem>
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
