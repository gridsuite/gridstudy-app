/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Checkbox, ListItem, ListItemIcon } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback, useMemo, useState } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../../utils/config-params';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import EditIcon from '@mui/icons-material/Edit';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import { Draggable } from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const nonEditableModificationTypes = new Set([
    'EQUIPMENT_ATTRIBUTE_MODIFICATION',
    'GROOVY_SCRIPT',
]);

const isEditableModification = (modif) => {
    if (!modif) return false;
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
    network,
    ...props
}) => {
    const intl = useIntl();
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const classes = useStyles();

    const getComputedLabel = useCallback(() => {
        if (modif.type === 'LINE_SPLIT_WITH_VOLTAGE_LEVEL') {
            return modif.lineToSplitId;
        } else if (modif.type === 'LINE_ATTACH_TO_VOLTAGE_LEVEL') {
            return modif.lineToAttachToId;
        } else if (modif.type === 'LINES_ATTACH_TO_SPLIT_LINES') {
            return modif.attachedLineId;
        } else if (modif.equipmentId) {
            return modif.equipmentId;
        }
        return '';
    }, [modif]);

    const toggle = useCallback(
        () => handleToggle(modif),
        [modif, handleToggle]
    );

    // hack to avoid the capture of network by closures, which leads to memory leaks
    let computedValues;
    const networkCopy = network;
    {
        const network = networkCopy;
        computedValues = useMemo(() => {
            function getVoltageLevelLabel(vlID) {
                if (!vlID) return '';
                const vl = network.getVoltageLevel(vlID);
                if (vl) return vl[useName ? 'name' : 'id'] || vlID;
                return vlID;
            }
            let res = { computedLabel: <strong>{getComputedLabel()}</strong> };
            if (modif.type === 'BRANCH_STATUS') {
                if (modif.action === 'ENERGISE_END_ONE') {
                    res.energizedEnd = getVoltageLevelLabel(
                        network.getLine(modif.equipmentId)?.voltageLevelId1
                    );
                } else if (modif.action === 'ENERGISE_END_TWO') {
                    res.energizedEnd = getVoltageLevelLabel(
                        network.getLine(modif.equipmentId)?.voltageLevelId2
                    );
                }
            }
            return res;
        }, [modif, network, getComputedLabel, useName]);
    }

    const getLabel = useCallback(
        () =>
            intl.formatMessage(
                { id: 'network_modifications/' + modif.type },
                {
                    ...modif,
                    ...computedValues,
                }
            ),
        [modif, intl, computedValues]
    );

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
                                    onClick={() => onEdit(modif.uuid)}
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
