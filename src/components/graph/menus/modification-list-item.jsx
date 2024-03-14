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
import PropTypes from 'prop-types';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import { useModificationLabelComputer } from '../util/use-modification-label-computer';

const nonEditableModificationTypes = new Set([
    'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    'GROOVY_SCRIPT',
    'OPERATING_STATUS_MODIFICATION',
]);

const isEditableModification = (modif) => {
    if (!modif) {
        return false;
    }
    return !nonEditableModificationTypes.has(modif.type);
};

const styles = {
    listItem: (theme) => ({
        padding: theme.spacing(0),
    }),
    label: {
        flexGrow: '1',
    },
    icon: {
        minWidth: 0,
    },
    iconEdit: (theme) => ({
        marginRight: theme.spacing(1),
    }),
    dragIcon: (theme) => ({
        padding: theme.spacing(0),
        border: theme.spacing(1),
        borderRadius: theme.spacing(0),
        zIndex: 90,
    }),
};

export const ModificationListItem = ({
    item: modif,
    isRestorationDialog,
    onEdit,
    checked,
    index,
    handleToggle,
    isDragging,
    isOneNodeBuilding,
    listSize,
    ...props
}) => {
    const intl = useIntl();
    const mapDataLoading = useSelector((state) => state.mapDataLoading);
    const { computeLabel } = useModificationLabelComputer();

    const toggle = useCallback(
        () => handleToggle(modif),
        [modif, handleToggle]
    );
    const getLabel = useCallback(() => {
        if (!modif) {
            return null;
        }
        return intl.formatMessage(
            { id: 'network_modifications.' + modif.messageType },
            {
                ...modif,
                ...computeLabel(modif),
            }
        );
    }, [computeLabel, modif, intl]);

    const [hover, setHover] = useState(false);

    return (
        <Draggable
            draggableId={modif.uuid}
            index={index}
            isDragDisabled={
                isOneNodeBuilding || isRestorationDialog || mapDataLoading
            }
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <ListItem key={modif.uuid} {...props} sx={styles.listItem}>
                        <IconButton
                            {...provided.dragHandleProps}
                            sx={styles.dragIcon}
                            size={'small'}
                            style={{
                                opacity:
                                    hover &&
                                    !isDragging &&
                                    !isOneNodeBuilding &&
                                    !isRestorationDialog &&
                                    !mapDataLoading
                                        ? '1'
                                        : '0',
                            }}
                        >
                            <DragIndicatorIcon edge="start" spacing={0} />
                        </IconButton>
                        <ListItemIcon sx={styles.icon}>
                            <Checkbox
                                color={'primary'}
                                edge="start"
                                checked={checked}
                                onClick={toggle}
                                disableRipple
                            />
                        </ListItemIcon>
                        <OverflowableText sx={styles.label} text={getLabel()} />
                        {!isOneNodeBuilding &&
                            !mapDataLoading &&
                            hover &&
                            !isDragging &&
                            !isRestorationDialog &&
                            isEditableModification(modif) && (
                                <IconButton
                                    onClick={() =>
                                        onEdit(modif.uuid, modif.type)
                                    }
                                    size={'small'}
                                    sx={styles.iconEdit}
                                >
                                    <EditIcon />
                                </IconButton>
                            )}
                    </ListItem>
                    {index !== listSize - 1 && <Divider />}
                </div>
            )}
        </Draggable>
    );
};

ModificationListItem.propTypes = {
    item: PropTypes.object,
    checked: PropTypes.bool,
    handleToggle: PropTypes.func,
    onEdit: PropTypes.func,
    isDragging: PropTypes.bool,
    isOneNodeBuilding: PropTypes.bool,
};
