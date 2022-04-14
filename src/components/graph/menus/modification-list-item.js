/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Checkbox, ListItem, ListItemIcon } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback, useState } from 'react';
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

const useStyles = makeStyles((theme) => ({
    listItem: {
        padding: theme.spacing(0),
        paddingRight: theme.spacing(1),
    },
    label: {
        flexGrow: '1',
    },
    icon: {
        minWidth: 0,
    },
    iconEdit: {
        padding: theme.spacing(0),
    },
    checkbox: {
        padding: theme.spacing(1),
    },
    dragIcon: {
        padding: theme.spacing(0),
        border: theme.spacing(1),
        zIndex: 90,
    },
}));

export const ModificationListItem = ({
    item: modification,
    onEdit,
    checked,
    index,
    handleToggle,
    ...props
}) => {
    const intl = useIntl();
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const classes = useStyles();

    const equipmentCreationModificationsType = new Set([
        'GENERATOR_CREATION',
        'LINE_CREATION',
        'LOAD_CREATION',
        'SHUNT_COMPENSATOR_CREATION',
        'SUBSTATION_CREATION',
        'TWO_WINDINGS_TRANSFORMER_CREATION',
        'VOLTAGE_LEVEL_CREATION',
    ]);

    const getComputedLabel = useCallback(() => {
        return useName && modification.equipmentName
            ? modification.equipmentName
            : modification.equipmentId;
    }, [modification, useName]);

    const toggle = useCallback(
        () => handleToggle(modification),
        [modification, handleToggle]
    );

    const getLabel = useCallback(
        () =>
            intl.formatMessage(
                { id: 'network_modifications/' + modification.type },
                {
                    ...modification,
                    computedLabel: <strong>{getComputedLabel()}</strong>,
                }
            ),
        [modification, getComputedLabel, intl]
    );

    const [hover, setHover] = useState(false);

    return (
        <Draggable draggableId={modification.uuid} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <ListItem
                        key={modification.uuid}
                        {...props}
                        className={classes.listItem}
                    >
                        <IconButton
                            {...provided.dragHandleProps}
                            className={classes.dragIcon}
                            size={'small'}
                            style={{ opacity: hover ? '1' : '0' }}
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
                        {equipmentCreationModificationsType.has(
                            modification.type
                        ) &&
                            hover && (
                                <IconButton
                                    onClick={() => onEdit(modification.uuid)}
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
};
