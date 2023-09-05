/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, ListItem, ListItemIcon } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import { Theme } from '@mui/material/styles';
import { Event } from '../../../dialogs/dynamicsimulation/event/types/event.type';
import { ReduxState } from '../../../../redux/reducer.type';
import { ListItemProps } from '@mui/material/ListItem/ListItem';

const styles = {
    listItem: (theme: Theme) => ({
        padding: theme.spacing(0),
    }),
    label: {
        flexGrow: '1',
    },
    icon: {
        minWidth: 0,
    },
    iconEdit: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
    checkbox: {},
    dragIcon: (theme: Theme) => ({
        padding: theme.spacing(0),
        border: theme.spacing(1),
        borderRadius: theme.spacing(0),
        zIndex: 90,
    }),
};

export interface EventListItemProps extends ListItemProps {
    item: Event;
    index: number;
    checked: boolean;
    handleToggle: (event: Event) => void;
    onEdit: (event: Event) => void;
    isDragging: boolean;
    isOneNodeBuilding: boolean;
}

export const EventListItem = ({
    item,
    onEdit,
    checked,
    index,
    handleToggle,
    isDragging,
    isOneNodeBuilding,
    ...props
}: EventListItemProps) => {
    const intl = useIntl();
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const [computedValues, setComputedValues] = useState({});

    const toggle = useCallback(() => handleToggle(item), [item, handleToggle]);

    useEffect(() => {
        if (!studyUuid || !currentNode || !item) {
            return;
        }
        setComputedValues({
            computedLabel: <strong>{item.equipmentId}</strong>,
        });
    }, [item, studyUuid, currentNode]);

    const getLabel = useCallback(() => {
        if (!item || !computedValues) {
            return undefined;
        }
        return intl.formatMessage(
            { id: `${item.eventType}/${item.equipmentType}` },
            {
                ...computedValues,
            }
        );
    }, [item, intl, computedValues]);

    const [hover, setHover] = useState(false);

    return (
        <Draggable
            draggableId={item.equipmentId}
            index={index}
            isDragDisabled={isOneNodeBuilding}
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <ListItem
                        key={item.equipmentId}
                        {...props}
                        sx={styles.listItem}
                    >
                        <IconButton
                            {...provided.dragHandleProps}
                            sx={styles.dragIcon}
                            size={'small'}
                            style={{
                                opacity:
                                    hover && !isDragging && !isOneNodeBuilding
                                        ? '1'
                                        : '0',
                            }}
                        >
                            <DragIndicatorIcon spacing={0} edgeMode={'start'} />
                        </IconButton>
                        <ListItemIcon sx={styles.icon}>
                            <Checkbox
                                sx={styles.checkbox}
                                color={'primary'}
                                edge="start"
                                checked={checked}
                                onClick={toggle}
                                disableRipple
                            />
                        </ListItemIcon>
                        <OverflowableText sx={styles.label} text={getLabel()} />
                        {!isOneNodeBuilding && hover && !isDragging && (
                            <IconButton
                                onClick={() => onEdit(item)}
                                size={'small'}
                                sx={styles.iconEdit}
                            >
                                <EditIcon />
                            </IconButton>
                        )}
                    </ListItem>
                    <Divider />
                </div>
            )}
        </Draggable>
    );
};
