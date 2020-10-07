/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    menu: {
        backgroundColor: theme.palette.background.paper,
        maxHeight: 800,
        overflowY: 'auto',
    },
    menuItem: {
        padding: '0px',
        margin: '7px',
    },
    listIItemText: {
        fontSize: 12,
        padding: '8px',
    },
}));

const SingleLineDiagramActions = ({}) => {
    const classes = useStyles();

    return (
        <div className={classes.menu}>
            <MenuItem
                className={classes.menuItem}
                id="lockout-action"
                key="lockout-action"
            >
                <ListItemText
                    className={classes.listIItemText}
                    primary={<Typography noWrap>Lockout the line</Typography>}
                />
            </MenuItem>
        </div>
    )
};

export default SingleLineDiagramActions;
