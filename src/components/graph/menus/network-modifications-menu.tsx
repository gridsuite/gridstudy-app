/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import ChildMenuItem from './create-child-menu-item';
import { CustomNestedMenuItem } from '../../utils/custom-nested-menu';
import { MenuDefinition } from './network-modification-menu.type';

interface NetworkModificationMenuProps {
    open: boolean;
    onClose: () => void;
    onItemClick: (id: string) => void;
    menuDefinition: MenuDefinition[];
    anchorEl?: HTMLElement | null;
}

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
}: NetworkModificationMenuProps) => {
    const intl = useIntl();
    const renderMenuItems = (menuItems: MenuDefinition[]) => {
        return menuItems.map((menuItem) => {
            if (menuItem?.hide) {
                return undefined;
            }
            return !('subItems' in menuItem) ? (
                <ChildMenuItem
                    key={menuItem.id}
                    item={{
                        id: menuItem.label,
                        action: () => onItemClick(menuItem.id),
                        disabled: false,
                    }}
                />
            ) : (
                <CustomNestedMenuItem key={menuItem.id} label={intl.formatMessage({ id: menuItem.label })}>
                    {renderMenuItems(menuItem.subItems)}
                </CustomNestedMenuItem>
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

export default NetworkModificationsMenu;
