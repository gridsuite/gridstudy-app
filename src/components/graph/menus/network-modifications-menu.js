/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import { NestedMenuItem } from 'mui-nested-menu';
import ChildMenuItem from './create-child-menu-item';

/**
 * Menu to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param onOpenDialog handle the opening of dialogs
 * @param menuDefinition the definition of nested menu
 * @param anchorEl anchorEl of fab Button
 */
const NetworkModificationsMenu = ({
    open,
    onClose,
    onOpenDialog,
    menuDefinition,
    anchorEl,
}) => {
    const intl = useIntl();
    const renderMenuItems = (menuItems) => {
        return menuItems.map((menuItem) => {
            return menuItem.subItems === undefined ? (
                <ChildMenuItem
                    key={menuItem.id}
                    item={{
                        id: menuItem.label,
                        action: () => onOpenDialog(menuItem.id),
                        disabled: false,
                    }}
                />
            ) : (
                <NestedMenuItem
                    key={menuItem.id}
                    parentMenuOpen={true}
                    label={intl.formatMessage({ id: menuItem.label })}
                >
                    {renderMenuItems(menuItem.subItems)}
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
                horizontal: 'right',
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
    onOpenDialog: PropTypes.func.isRequired,
    menuDefinition: PropTypes.array,
    anchorEl: PropTypes.object,
};

export default NetworkModificationsMenu;
