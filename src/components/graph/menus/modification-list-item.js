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
import { MODIFICATION_TYPES } from 'components/utils/modification-type';

const nonEditableModificationTypes = new Set([
    'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    'GROOVY_SCRIPT',
    'OPERATIONAL_STATUS_MODIFICATION',
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
    const [computedLabelValues, setComputedLabelValues] = useState();

    /*
        this version is more optimized because it uses a switch statement instead of a series of if-else statements.
        this makes the code more readable and easier to maintain.
        it also eliminate the need for the final if statement by using the default case of the switch statement instead.
        finally, we uses the default value of equipmentId or empty string
    */
    const getComputedLabel = useCallback(() => {
        const modificationMetadata = JSON.parse(modif.messageValues);

        switch (modif.messageType) {
            case MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type:
                return modificationMetadata.lineToSplitId;
            case MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type:
                return modificationMetadata.lineToAttachToId;
            case MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type:
                return modificationMetadata.attachedLineId;
            case MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type:
                return (
                    modificationMetadata.lineToAttachTo1Id +
                    '/' +
                    modificationMetadata.lineToAttachTo2Id
                );
            case MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type:
                return (
                    modificationMetadata.attachedLineId +
                    '/' +
                    modificationMetadata.lineToAttachTo1Id +
                    '/' +
                    modificationMetadata.lineToAttachTo2Id
                );
            case MODIFICATION_TYPES.TABULAR_MODIFICATION.type:
                return intl.formatMessage({
                    id:
                        'network_modifications/tabular/' +
                        modificationMetadata.tabularModificationType,
                });
            default:
                return modificationMetadata.equipmentId || '';
        }
    }, [intl, modif]);

    const toggle = useCallback(
        () => handleToggle(modif),
        [modif, handleToggle]
    );

    const getOperationalStatusModificationValues = (modification) => {
        return {
            action: modification.action,
            energizedEnd: modification.energizedVoltageLevelId,
            computedLabel: <strong>{modification.equipmentId}</strong>,
        };
    };

    const getEquipmentAttributeModificationValues = (modification) => {
        return {
            equipmentAttributeName: modification.equipmentAttributeName,
            equipmentAttributeValue: modification.equipmentAttributeValue,
            computedLabel: <strong>{modification.equipmentId}</strong>,
        };
    };

    useEffect(() => {
        if (!studyUuid || !currentNode || !modif) {
            return;
        }
        const modificationValues = JSON.parse(modif.messageValues);

        switch (modif.messageType) {
            case MODIFICATION_TYPES.OPERATIONAL_STATUS_MODIFICATION.type:
                setComputedLabelValues(
                    getOperationalStatusModificationValues(modificationValues)
                );
                break;
            case MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type:
                setComputedLabelValues(
                    getEquipmentAttributeModificationValues(modificationValues)
                );
                break;
            default:
                setComputedLabelValues({
                    computedLabel: <strong>{getComputedLabel()}</strong>,
                });
        }
    }, [modif, studyUuid, currentNode, getComputedLabel]);

    const getLabel = useCallback(() => {
        if (!modif || !computedLabelValues) {
            return null;
        }
        return intl.formatMessage(
            { id: 'network_modifications/' + modif.messageType },
            {
                ...modif,
                ...computedLabelValues,
            }
        );
    }, [modif, intl, computedLabelValues]);

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
