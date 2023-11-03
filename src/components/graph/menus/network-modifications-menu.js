/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import { NestedMenuItem } from 'mui-nested-menu';
import ChildMenuItem from './create-child-menu-item';
import { Box } from '@mui/system';

const styles = {
    forceHover: (theme) => ({
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.main,
        transition: 'all 300ms ease',
    }),
    menuItem: (theme) => ({
        transition: 'all 300ms ease',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.primary.main,
            transition: 'all 300ms ease',
        },
    }),
};

/**
 * Menu to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param onItemClick handle the click on menu Items
 * @param menuDefinition the definition of nested menu
 * @param anchorEl anchorEl of fab Button
 */
const NetworkModificationsMenu = ({
    open,
    onClose,
    onItemClick,
    menuDefinition,
    anchorEl,
}) => {
    const [openParentId, setOpenParentId] = useState(undefined);

    const intl = useIntl();
    const renderMenuItems = (menuItems, parent = undefined) => {
        return menuItems.map((menuItem) => {
            if (menuItem?.hide) {
                return undefined;
            }
            return menuItem.subItems === undefined ? (
                <Box
                    onMouseEnter={() => setOpenParentId(parent)}
                    onMouseLeave={() => setOpenParentId(undefined)}
                >
                    <ChildMenuItem
                        key={menuItem.id}
                        item={{
                            id: menuItem.label,
                            action: () => onItemClick(menuItem.id),
                            disabled: false,
                        }}
                    />
                </Box>
            ) : (
                <NestedMenuItem
                    key={menuItem.id}
                    parentMenuOpen={true}
                    label={intl.formatMessage({ id: menuItem.label })}
                    sx={
                        openParentId === menuItem.id
                            ? styles.forceHover
                            : styles.menuItem
                    }
                >
                    {renderMenuItems(menuItem.subItems, menuItem.id)}
                </NestedMenuItem>
            );
        });
    };

    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <div>{renderMenuItems(menuDefinition)}</div>
        </Menu>
    );
};

NetworkModificationsMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onItemClick: PropTypes.func.isRequired,
    menuDefinition: PropTypes.array,
    anchorEl: PropTypes.object,
};

export default NetworkModificationsMenu;
