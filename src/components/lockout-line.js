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
        minWidth: 300,
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

const LockoutLine = ({ line, position, message, handleClose, handleClick }) => {
    const classes = useStyles();

    return (
        <div className={classes.menu}>
            <Menu
                anchorReference="anchorPosition"
                anchorPosition={{
                    position: 'absolute',
                    top: position[1],
                    left: position[0],
                }}
                id="choice-vl-menu"
                open={true}
                onClose={handleClose}
            >
                <MenuItem
                    className={classes.menuItem}
                    id={line.id}
                    key={line.id}
                    onClick={() => handleClick(line.id)}
                >
                    <ListItemText
                        className={classes.listIItemText}
                        primary={<Typography noWrap>{message}</Typography>}
                    />
                </MenuItem>
            </Menu>
        </div>
    );
};

export default LockoutLine;
