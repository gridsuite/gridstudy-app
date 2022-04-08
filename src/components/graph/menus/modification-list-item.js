/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Checkbox, ListItem, ListItemIcon } from '@mui/material';
import { useIntl } from 'react-intl';
import React, { useCallback } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../../utils/config-params';
import Divider from '@mui/material/Divider';
import PropTypes from 'prop-types';
import EditIcon from '@mui/icons-material/Edit';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';

const useStyles = makeStyles((theme) => ({
    listItem: {
        padding: theme.spacing(0),
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
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
}));

export const ModificationListItem = ({
    item: modification,
    onDelete,
    onEdit,
    checked,
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
    return (
        <>
            <ListItem
                key={modification.uuid}
                {...props}
                className={classes.listItem}
            >
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
                <OverflowableText className={classes.label} text={getLabel()} />
                {equipmentCreationModificationsType.has(modification.type) && (
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
        </>
    );
};

ModificationListItem.propTypes = {
    item: PropTypes.object,
    checked: PropTypes.bool,
    handleToggle: PropTypes.func,
    onEdit: PropTypes.func,
};
