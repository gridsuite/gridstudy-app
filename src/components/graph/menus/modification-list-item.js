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

const nonEditableModificationTypes = new Set([
    'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    'GROOVY_SCRIPT',
    'BRANCH_STATUS_MODIFICATION',
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
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const mapDataLoading = useSelector((state) => state.mapDataLoading);
    const [computedValues, setComputedValues] = useState();

    /*
        this version is more optimized because it uses a switch statement instead of a series of if-else statements.
        this makes the code more readable and easier to maintain.
        it also eliminate the need for the final if statement by using the default case of the switch statement instead.
        finally, we uses the default value of equipmentId or empty string
    */
    const getComputedLabel = useCallback(() => {
        switch (modif.type) {
            case 'LINE_SPLIT_WITH_VOLTAGE_LEVEL':
                return modif.lineToSplitId;
            case 'LINE_ATTACH_TO_VOLTAGE_LEVEL':
                return modif.lineToAttachToId;
            case 'LINES_ATTACH_TO_SPLIT_LINES':
                return modif.attachedLineId;
            case 'DELETE_VOLTAGE_LEVEL_ON_LINE':
                return modif.lineToAttachTo1Id + '/' + modif.lineToAttachTo2Id;
            case 'DELETE_ATTACHING_LINE':
                return (
                    modif.attachedLineId +
                    '/' +
                    modif.lineToAttachTo1Id +
                    '/' +
                    modif.lineToAttachTo2Id
                );
            case 'TABULAR_MODIFICATION':
                return intl.formatMessage({
                    id:
                        'network_modifications/tabular/' +
                        modif.modificationType,
                });
            default:
                return modif.equipmentId || '';
        }
    }, [intl, modif]);

    const toggle = useCallback(
        () => handleToggle(modif),
        [modif, handleToggle]
    );

    useEffect(() => {
        if (!studyUuid || !currentNode || !modif) {
            return;
        }
        setComputedValues({
            energizedEnd: modif.energizedVoltageLevelId,
            computedLabel: <strong>{getComputedLabel()}</strong>,
        });
    }, [modif, studyUuid, currentNode, getComputedLabel]);

    const getLabel = useCallback(() => {
        if (!modif || !computedValues) {
            return null;
        }
        return intl.formatMessage(
            { id: 'network_modifications/' + modif.type },
            {
                ...modif,
                ...computedValues,
            }
        );
    }, [modif, intl, computedValues]);

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
                                        onEdit(modif.uuid, modif?.type)
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
