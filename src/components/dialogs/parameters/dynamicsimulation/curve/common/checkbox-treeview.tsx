/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { alpha, Checkbox, SxProps, Theme, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { treeItemClasses, TreeView, TreeItem } from '@mui/x-tree-view';

import { ModelVariable } from '../../dynamic-simulation.type';

enum CheckState {
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

export interface GetSelectedItemsHandle {
    api: {
        getSelectedItems: () => ModelVariable[];
    };
}

interface CheckBoxTreeViewProps {
    data: ModelVariable[];
    checkAll: boolean;
    onSelectionChanged?: (newSelection: ModelVariable[]) => void;
    getLabel: (element: ModelVariable) => string;
    sx: SxProps<Theme>;
}

interface ItemState {
    id: string;
    state: CheckState;
}

const CheckboxTreeview = forwardRef<GetSelectedItemsHandle, CheckBoxTreeViewProps>(
    ({ data: items, checkAll, onSelectionChanged, getLabel, ...rest }, ref) => {
        const initialItemStates = useMemo(() => {
            return items.map((elem) => ({
                id: elem.id,
                state: checkAll ? CheckState.CHECKED : CheckState.UNCHECKED,
            }));
        }, [items, checkAll]);

        const [itemStates, setItemStates] = useState(initialItemStates);

        // used to reset internal state when initial data changed
        const [prevItems, setPrevItems] = useState(items);
        if (items !== prevItems) {
            setPrevItems(items);
            setItemStates(initialItemStates);
        }

        const updateItemState = useCallback((itemStates: ItemState[], items: ModelVariable[], onClickedId: string) => {
            const getState = (itemStates: ItemState[], id: string) => {
                return itemStates.find((elem) => elem.id === id);
            };

            // recursive algo
            const updateStateParent = (itemStates: ItemState[], items: ModelVariable[], childId: string) => {
                const child = items.find((elem) => elem.id === childId);
                const parent = items.find((elem) => elem.id === child?.parentId);

                if (!parent) {
                    // at root item
                    return;
                }

                const childrenIds = items.filter((elem) => elem.parentId === parent.id).map((elem) => elem.id);

                const childrenStates = childrenIds.map((id) => getState(itemStates, id));

                // recompute state of parent
                const parentState = itemStates.find((elem) => elem.id === parent.id);
                if (parentState) {
                    // initial default state
                    parentState.state = CheckState.INDETERMINATE;
                    // all children checked => parent must be checked
                    if (childrenStates.every((elem) => elem?.state === CheckState.CHECKED)) {
                        parentState.state = CheckState.CHECKED;
                    }
                    // all children unchecked => parent must be unchecked
                    if (childrenStates.every((elem) => elem?.state === CheckState.UNCHECKED)) {
                        parentState.state = CheckState.UNCHECKED;
                    }
                }

                // recursive visit
                updateStateParent(itemStates, items, parent.id);
            };

            // recursive algo
            const setState = (itemStates: ItemState[], items: ModelVariable[], id: string, newState: CheckState) => {
                const itemToModify = itemStates.find((elem) => elem.id === id);
                if (itemToModify) {
                    itemToModify.state = newState;
                }
                // set all children the same state of current element
                const children = items.filter((elem) => elem.parentId === id);
                children.forEach((elem) => setState(itemStates, items, elem.id, newState));

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
                currentState?.state === CheckState.CHECKED ? CheckState.UNCHECKED : CheckState.CHECKED
            );

            return newItemStates;
        }, []);

        const handleItemSelect = useCallback(
            (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
                event.stopPropagation();
                const newItemStates = updateItemState(itemStates, items, id);
                setItemStates(newItemStates);
                if (onSelectionChanged) {
                    // compute selected items on newItemStates
                    const selectedItems = items.filter(
                        (item) =>
                            newItemStates.find((elem) => elem.id === item.id)?.state === CheckState.CHECKED &&
                            !items.find((elem) => elem.parentId === item.id) // no children
                    );
                    onSelectionChanged(selectedItems);
                }
            },
            [itemStates, items, updateItemState, onSelectionChanged]
        );

        const handleExpand = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
            event.stopPropagation();
        };

        const getState = useCallback(
            (id: string) => {
                return itemStates.find((elem) => elem.id === id)?.state;
            },
            [itemStates]
        );

        // expose some api for the component by using ref
        useImperativeHandle(
            ref,
            () => ({
                api: {
                    getSelectedItems: () =>
                        items.filter(
                            (item) =>
                                getState(item.id) === CheckState.CHECKED &&
                                !items.find((elem) => elem.parentId === item.id) // no children
                        ),
                },
            }),
            [items, getState]
        );

        // render functions (recursive rendering)
        const renderChildren = (allItems: ModelVariable[], parentId: string) => {
            const children = allItems.filter((elem) => elem.parentId === parentId);
            return !children.length ? null : renderItems(allItems, children);
        };

        const renderItems = (allItems: ModelVariable[], itemsToRender: ModelVariable[] = []) => {
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
                                indeterminate={CheckState.INDETERMINATE === getState(elem.id)}
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
);

export default CheckboxTreeview;
