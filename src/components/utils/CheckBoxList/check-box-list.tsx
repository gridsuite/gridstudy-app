/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    FunctionComponent,
    MouseEvent,
    useCallback,
    useState,
} from 'react';
import { Box, Divider, IconButton, List, ListItem } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Draggable } from 'react-beautiful-dnd';
import CheckBoxItem from './check-box-item';

interface CheckboxListProps {
    itemRenderer?: (params: {
        item: any;
        index: number;
        checked: boolean;
        toggleSelection: (id: any) => void;
    }) => React.ReactNode;
    values: any[];
    selectedItems: any[];
    setSelectedItems: (selectedItems: any[]) => void;
    defaultSelected?: any[];
    itemComparator?: (val1: any, val2: any) => boolean;
    getValueId: (value: any) => any;
    getValueLabel?: (value: any) => string;
    checkboxListSx?: any;
    labelSx?: any;
    enableKeyboardSelection?: boolean;
    isCheckBoxDraggable?: boolean;
    isDragDisable?: boolean;
    draggableProps?: any;
    secondaryAction?: (item: any) => React.ReactElement;
    enableSecondaryActionOnHover?: boolean;
    isDisabled?: (item: any) => boolean;
    [key: string]: any;
}

export const areIdsEqual = (val1: any, val2: any) => {
    return val1.id === val2.id;
};

const styles = {
    dragIcon: (theme: any) => ({
        padding: theme.spacing(0),
        border: theme.spacing(1),
        borderRadius: theme.spacing(0),
        zIndex: 90,
    }),
};

const CheckboxList: FunctionComponent<CheckboxListProps> = ({
    itemRenderer,
    values = [],
    defaultSelected = [],
    itemComparator = areIdsEqual,
    getValueId = (value) => value?.id ?? value,
    getValueLabel = (value) => value?.label ?? value,
    checkboxListSx,
    labelSx,
    enableKeyboardSelection,
    isCheckBoxDraggable = false,
    isDragDisable,
    draggableProps,
    secondaryAction,
    enableSecondaryActionOnHover = true,
    isDisabled = (item: any) => false,
    selectedItems,
    setSelectedItems,
    ...props
}) => {
    const toggleSelection = useCallback(
        (elementToToggleId: string) => {
            const element = values?.find(
                (v) => getValueId(v) === elementToToggleId
            );
            if (element === undefined) {
                return;
            }

            const elementSelected = selectedItems.find(
                (v) => getValueId(v) === elementToToggleId
            );
            const newValues = [...selectedItems];
            if (elementSelected === undefined) {
                newValues.push(element);
                setSelectedItems(newValues);
            } else {
                setSelectedItems(
                    newValues.filter((v) => getValueId(v) !== elementToToggleId)
                );
            }
        },
        [values, selectedItems]
    );

    const isChecked = useCallback(
        (item: any) =>
            selectedItems.map((v) => getValueId(v)).includes(getValueId(item)),
        [selectedItems, getValueId]
    );

    const [hover, setHover] = useState(null);

    const handleSecondaryAction = (item: any) => {
        if (!secondaryAction) {
            return undefined;
        }

        if (!enableSecondaryActionOnHover) {
            return secondaryAction(item);
        }

        if (hover === getValueId(item)) {
            return secondaryAction(item);
        }

        return undefined;
    };

    return (
        <List {...props}>
            {values?.map((item, index) => {
                if (itemRenderer) {
                    return itemRenderer({
                        item,
                        index,
                        checked: isChecked(item),
                        toggleSelection,
                    });
                }
                return (
                    <React.Fragment key={getValueId(item)}>
                        {isCheckBoxDraggable && (
                            <Draggable
                                draggableId={String(getValueId(item))}
                                index={index}
                                isDragDisabled={isDragDisable}
                            >
                                {(provided: any) => (
                                    <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        onMouseEnter={() =>
                                            setHover(getValueId(item))
                                        }
                                        onMouseLeave={() => setHover(null)}
                                        {...draggableProps}
                                    >
                                        <ListItem
                                            {...props}
                                            sx={checkboxListSx}
                                        >
                                            <IconButton
                                                {...provided.dragHandleProps}
                                                sx={styles.dragIcon}
                                                size="small"
                                                style={{
                                                    opacity:
                                                        hover ===
                                                            getValueId(item) &&
                                                        !isDragDisable
                                                            ? '1'
                                                            : '0',
                                                }}
                                            >
                                                <DragIndicatorIcon />
                                            </IconButton>
                                            <CheckBoxItem
                                                item={item}
                                                checked={isChecked(item)}
                                                label={
                                                    getValueLabel
                                                        ? getValueLabel(item)
                                                        : ''
                                                }
                                                onClick={() =>
                                                    toggleSelection(
                                                        getValueId(item)
                                                    )
                                                }
                                                secondaryAction={handleSecondaryAction(
                                                    item
                                                )}
                                                labelSx={labelSx}
                                                disabled={
                                                    isDisabled
                                                        ? isDisabled(item)
                                                        : false
                                                }
                                            />
                                        </ListItem>
                                    </Box>
                                )}
                            </Draggable>
                        )}
                        {!isCheckBoxDraggable && (
                            <CheckBoxItem
                                item={item}
                                checked={isChecked(item)}
                                label={getValueLabel(item)}
                                onClick={() =>
                                    toggleSelection(getValueId(item))
                                }
                                secondaryAction={handleSecondaryAction(item)}
                                labelSx={labelSx}
                                disabled={isDisabled(item)}
                            />
                        )}
                        {index !== values.length - 1 && <Divider />}
                    </React.Fragment>
                );
            })}
        </List>
    );
};

export default CheckboxList;
