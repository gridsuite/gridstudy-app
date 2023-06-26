/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, ListItem, ListItemIcon } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import EditIcon from '@mui/icons-material/Edit';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { fetchNetworkElementInfos } from '../../../utils/rest-api';
import { useSelector } from 'react-redux';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../utils/equipment-types';
import { MODIFICATION_TYPES } from 'components/utils/modification-type';

const nonEditableModificationTypes = new Set([
    MODIFICATION_TYPES.EQUIPMENT_ATTRIBUTE_MODIFICATION.type,
    MODIFICATION_TYPES.GROOVY_SCRIPT.type,
    MODIFICATION_TYPES.BRANCH_STATUS_MODIFICATION.type,
]);

const isEditableModification = (modif) => {
    if (!modif) {
        return false;
    }
    return !nonEditableModificationTypes.has(modif.type);
};

const useStyles = makeStyles((theme) => ({
    listItem: {
        padding: theme.spacing(0),
    },
    label: {
        flexGrow: '1',
    },
    icon: {
        minWidth: 0,
    },
    iconEdit: {
        marginRight: theme.spacing(1),
    },
    checkbox: {},
    dragIcon: {
        padding: theme.spacing(0),
        border: theme.spacing(1),
        borderRadius: theme.spacing(0),
        zIndex: 90,
    },
}));

export const ModificationListItem = ({
    item: modif,
    onEdit,
    checked,
    index,
    handleToggle,
    isDragging,
    isOneNodeBuilding,
    ...props
}) => {
    const intl = useIntl();
    const classes = useStyles();
    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);
    const [computedValues, setComputedValues] = useState();

    /*
        this version is more optimized because it uses a switch statement instead of a series of if-else statements.
        this makes the code more readable and easier to maintain.
        it also eliminate the need for the final if statement by using the default case of the switch statement instead.
        finally, we uses the default value of equipmentId or empty string
    */
    const getComputedLabel = useCallback(() => {
        switch (modif.type) {
            case MODIFICATION_TYPES.LINE_SPLIT_WITH_VOLTAGE_LEVEL.type:
                return modif.lineToSplitId;
            case MODIFICATION_TYPES.LINE_ATTACH_TO_VOLTAGE_LEVEL.type:
                return modif.lineToAttachToId;
            case MODIFICATION_TYPES.LINES_ATTACH_TO_SPLIT_LINES.type:
                return modif.attachedLineId;
            case MODIFICATION_TYPES.DELETE_VOLTAGE_LEVEL_ON_LINE.type:
                return modif.lineToAttachTo1Id + '/' + modif.lineToAttachTo2Id;
            case MODIFICATION_TYPES.DELETE_ATTACHING_LINE.type:
                return (
                    modif.attachedLineId +
                    '/' +
                    modif.lineToAttachTo1Id +
                    '/' +
                    modif.lineToAttachTo2Id
                );
            default:
                return modif.equipmentId || '';
        }
    }, [modif]);

    const toggle = useCallback(
        () => handleToggle(modif),
        [modif, handleToggle]
    );

    useEffect(() => {
        if (!studyUuid || !currentNode || !modif) {
            return;
        }
        let energizeEndPromise;
        if (
            modif.type === MODIFICATION_TYPES.BRANCH_STATUS_MODIFICATION.type &&
            (modif.action === 'ENERGISE_END_ONE' ||
                modif.action === 'ENERGISE_END_TWO')
        ) {
            let voltageLevelId;
            let voltageLevelName;
            if (modif.action === 'ENERGISE_END_ONE') {
                voltageLevelId = 'voltageLevelId1';
                voltageLevelName = 'voltageLevelName1';
            } else if (modif.action === 'ENERGISE_END_TWO') {
                voltageLevelId = 'voltageLevelId2';
                voltageLevelName = 'voltageLevelName2';
            }
            //TODO supposed to be temporary, we shouldn't fetch back-end to create a label
            energizeEndPromise = fetchNetworkElementInfos(
                studyUuid,
                currentNode.id,
                EQUIPMENT_TYPES.LINE.type,
                EQUIPMENT_INFOS_TYPES.LIST.type,
                modif.equipmentId,
                false
            )
                .then((line) => {
                    return line[voltageLevelName] ?? line[voltageLevelId];
                })
                .catch(() => {
                    console.error(
                        'Could not fetch line with ID ' + modif.equipmentId
                    );
                    return null;
                });
        } else {
            energizeEndPromise = Promise.resolve(null);
        }
        energizeEndPromise.then((energizedEnd) => {
            setComputedValues({
                energizedEnd: energizedEnd,
                computedLabel: <strong>{getComputedLabel()}</strong>,
            });
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
                        key={modif.uuid}
                        {...props}
                        className={classes.listItem}
                    >
                        <IconButton
                            {...provided.dragHandleProps}
                            className={classes.dragIcon}
                            size={'small'}
                            style={{
                                opacity:
                                    hover && !isDragging && !isOneNodeBuilding
                                        ? '1'
                                        : '0',
                            }}
                        >
                            <DragIndicatorIcon edge="start" spacing={0} />
                        </IconButton>
                        <ListItemIcon className={classes.icon}>
                            <Checkbox
                                className={classes.checkbox}
                                color={'primary'}
                                edge="start"
                                checked={checked}
                                onClick={toggle}
                                disableRipple
                            />
                        </ListItemIcon>
                        <OverflowableText
                            className={classes.label}
                            text={getLabel()}
                        />
                        {!isOneNodeBuilding &&
                            hover &&
                            !isDragging &&
                            isEditableModification(modif) && (
                                <IconButton
                                    onClick={() =>
                                        onEdit(modif.uuid, modif?.type)
                                    }
                                    size={'small'}
                                    className={classes.iconEdit}
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

ModificationListItem.propTypes = {
    item: PropTypes.object,
    checked: PropTypes.bool,
    handleToggle: PropTypes.func,
    onEdit: PropTypes.func,
    isDragging: PropTypes.bool,
    isOneNodeBuilding: PropTypes.bool,
};
