/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ListItem } from '@material-ui/core';
import { useIntl } from 'react-intl';
import React, { useCallback } from 'react';
import { OverflowableText } from '@gridsuite/commons-ui/';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../../utils/config-params';
import Divider from '@material-ui/core/Divider';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
    listItem: {
        padding: theme.spacing(0),
        paddingRight: theme.spacing(1),
        paddingLeft: theme.spacing(1),
    },
    label: {
        flexGrow: '1',
    },
    checkBox: {
        minWidth: 0,
    },
}));

export const ModificationListItem = ({
    item,
    checked,
    handleToggle,
    ...props
}) => {
    const intl = useIntl();
    const useName = useSelector((state) => state[PARAM_USE_NAME]);
    const classes = useStyles();

    const getComputedLabel = useCallback(() => {
        return useName && item.equipmentName
            ? item.equipmentName
            : item.equipmentId;
    }, [item, useName]);

    const toggle = useCallback(() => handleToggle(item), [item, handleToggle]);

    const getLabel = useCallback(
        () =>
            intl.formatMessage(
                { id: 'network_modifications/' + item.type },
                {
                    ...item,
                    computedLabel: <strong>{getComputedLabel()}</strong>,
                }
            ),
        [item, getComputedLabel, intl]
    );
    return (
        <>
            <ListItem key={item.uuid} {...props} className={classes.listItem}>
                <ListItemIcon className={classes.checkBox}>
                    <Checkbox
                        color={'primary'}
                        edge="start"
                        checked={checked}
                        onClick={toggle}
                        disableRipple
                    />
                </ListItemIcon>
                <OverflowableText className={classes.label} text={getLabel()} />
            </ListItem>
            <Divider />
        </>
    );
};

ModificationListItem.propTypes = {
    item: PropTypes.object,
    checked: PropTypes.bool,
    handleToggle: PropTypes.func,
};
