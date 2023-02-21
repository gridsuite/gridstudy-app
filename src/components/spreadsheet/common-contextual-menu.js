/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';

import EditIcon from '@mui/icons-material/Edit';

import withStyles from '@mui/styles/withStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
    },
})((props) => <Menu elevation={0} {...props} />);

/**
 * Generic Contextual Menu View
 * @param {Array} menuItems Action items to add in the Menu as MenuItems
 */
const CommonContextualMenu = (props) => {
    const { menuItems, ...others } = props;

    function makeMenuItem(
        key,
        messageDescriptorId,
        callback,
        icon = <EditIcon fontSize="small" />,
        disabled = false
    ) {
        return (
            <MenuItem
                key={key}
                onClick={() => {
                    callback();
                }}
                disabled={disabled}
            >
                <ListItemIcon
                    style={{
                        minWidth: '25px',
                    }}
                >
                    {icon}
                </ListItemIcon>
                <ListItemText primary={messageDescriptorId} />
            </MenuItem>
        );
    }

    return (
        <StyledMenu keepMounted {...others}>
            {menuItems.map((menuItem, index) => {
                if (menuItem.isDivider) {
                    return <Divider key={index} />;
                } else {
                    return makeMenuItem(
                        index,
                        menuItem.messageDescriptorId,
                        menuItem.callback,
                        menuItem.icon,
                        menuItem.disabled
                    );
                }
            })}
        </StyledMenu>
    );
};

CommonContextualMenu.propTypes = {
    handleCloseMenu: PropTypes.func,
    position: PropTypes.object,
    menuItems: PropTypes.array,
};

export default CommonContextualMenu;
