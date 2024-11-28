/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { forwardRef, MouseEvent, Ref, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha, Checkbox, SxProps, Theme, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TreeItem, treeItemClasses, TreeView } from '@mui/x-tree-view';

export enum CheckState {
    UNCHECKED = 'UNCHECKED',
    CHECKED = 'CHECKED',
    INDETERMINATE = 'INDETERMINATE',
}

const BorderedTreeItem = styled(TreeItem)(({ root }: { root: boolean }) => {
    const theme = useTheme();
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
        [`& .${treeItemClasses.label}`]: {
            whiteSpace: 'nowrap',
        },
    };
});

export interface ItemData {
    id: string;
    parentId?: string;
    name?: string;
}

export interface CheckboxTreeviewApi<TData extends ItemData = ItemData> {
    getSelectedItems: () => TData[];
}

interface CheckBoxTreeViewProps<TData extends ItemData = ItemData> {
    data: TData[];
    checkAll: boolean;
    onSelectionChanged?: (newSelection: TData[]) => void;
    getLabel: (element: TData) => string;
    sx: SxProps<Theme>;
}

function CheckboxTreeview<TData extends ItemData>(
    { data: items, checkAll, onSelectionChanged, getLabel, ...rest }: Readonly<CheckBoxTreeViewProps<TData>>,
    ref: Ref<CheckboxTreeviewApi<TData>>
) {
    const initialItemStates = useMemo<Record<string, CheckState>>(
        () => Object.fromEntries(items.map((elem) => [elem.id, checkAll ? CheckState.CHECKED : CheckState.UNCHECKED])),
        [items, checkAll]
    );

    const [itemStates, setItemStates] = useState(initialItemStates);

    // used to reset internal state when initial data changed
    const [prevItems, setPrevItems] = useState(items);
    if (items !== prevItems) {
        setPrevItems(items);
        setItemStates(initialItemStates);
    }

    const updateItemState = useCallback(
        (itemStates: Record<string, CheckState>, items: TData[], onClickedId: string) => {
            // recursive algo
            const updateStateParent = (itemStates: Record<string, CheckState>, items: TData[], childId: string) => {
                const child = items.find((elem) => elem.id === childId);
                const parent = items.find((elem) => elem.id === child?.parentId);

                if (!parent) {
                    // at root item
                    return;
                }

                const childrenIds = items.filter((elem) => elem.parentId === parent.id).map((elem) => elem.id);

                const childrenStates = childrenIds.map((id) => itemStates[id]);

                // recompute state of parent
                // default state
                itemStates[parent.id] = CheckState.INDETERMINATE;
                // all children checked => parent must be checked
                if (childrenStates.every((state) => state === CheckState.CHECKED)) {
                    itemStates[parent.id] = CheckState.CHECKED;
                }
                // all children unchecked => parent must be unchecked
                if (childrenStates.every((state) => state === CheckState.UNCHECKED)) {
                    itemStates[parent.id] = CheckState.UNCHECKED;
                }

                // recursive visit
                updateStateParent(itemStates, items, parent.id);
            };

            // recursive algo
            const setState = (
                itemStates: Record<string, CheckState>,
                items: TData[],
                id: string,
                newState: CheckState
            ) => {
                itemStates[id] = newState;

                // set all children the same state of current element
                const children = items.filter((elem) => elem.parentId === id);
                children.forEach((elem) => setState(itemStates, items, elem.id, newState));

                // update parent's state of the current element
                updateStateParent(itemStates, items, id);
            };

            // update item's state
            const newItemStates = Object.assign({}, itemStates);
            // get current state
            const currentState = itemStates[onClickedId];
            setState(
                newItemStates,
                items,
                onClickedId,
                currentState === CheckState.CHECKED ? CheckState.UNCHECKED : CheckState.CHECKED
            );

            return newItemStates;
        },
        []
    );

    const handleItemSelect = useCallback(
        (event: MouseEvent, id: string) => {
            event.stopPropagation();
            const newItemStates = updateItemState(itemStates, items, id);
            setItemStates(newItemStates);
            if (onSelectionChanged) {
                // compute selected items on newItemStates
                const selectedItems = items.filter(
                    (item) =>
                        newItemStates[item.id] === CheckState.CHECKED &&
                        !items.find((elem) => elem.parentId === item.id) // no children
                );
                onSelectionChanged(selectedItems);
            }
        },
        [itemStates, items, updateItemState, onSelectionChanged]
    );

    const handleExpand = (event: MouseEvent) => {
        event.stopPropagation();
    };

    // expose some api for the component by using ref
    useImperativeHandle(
        ref,
        () => ({
            getSelectedItems: () =>
                items.filter(
                    (item) =>
                        itemStates[item.id] === CheckState.CHECKED && !items.find((elem) => elem.parentId === item.id) // no children
                ),
        }),
        [items]
    );

    // render functions (recursive rendering)
    const renderChildren = (allItems: TData[], parentId: string) => {
        const children = allItems.filter((elem) => elem.parentId === parentId);
        return !children.length ? null : renderItems(allItems, children);
    };

    const renderItems = (allItems: TData[], itemsToRender: TData[] = []) => {
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
                            checked={CheckState.CHECKED === itemStates[elem.id]}
                            indeterminate={CheckState.INDETERMINATE === itemStates[elem.id]}
                            onClick={(event) => handleItemSelect(event, elem.id)}
                        />
                        {getLabel ? getLabel(elem) : elem.name}
                    </>
                }
            >
                {renderChildren(allItems, elem.id)}
            </BorderedTreeItem>
        ));
    };

    return (
        <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />} {...rest}>
            {renderItems(items)}
        </TreeView>
    );
}

export default forwardRef(CheckboxTreeview) as <T extends ItemData>(
    props: CheckBoxTreeViewProps<T> & { ref?: Ref<CheckboxTreeviewApi<T>> }
) => ReturnType<typeof CheckboxTreeview>;
