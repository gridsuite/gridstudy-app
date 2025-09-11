/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Divider, Menu } from '@mui/material';
import { useIntl } from 'react-intl';
import { MenuDefinition, MenuSection } from './network-modification-menu.type';
import ChildMenuItem from '../create-child-menu-item';
import { CustomNestedMenuItem } from '@gridsuite/commons-ui';

interface NetworkModificationMenuProps {
    open: boolean;
    onClose: () => void;
    onItemClick: (id: string) => void;
    menuSections: MenuSection[];
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
    menuSections,
    anchorEl,
}: NetworkModificationMenuProps) => {
    const intl = useIntl();

    const renderMenuItem = (menuItem: MenuDefinition) => {
        if ('subItems' in menuItem) {
            return (
                <CustomNestedMenuItem key={menuItem.id} label={intl.formatMessage({ id: menuItem.label })}>
                    {menuItem.subItems
                        .filter((subItem) => !subItem.hide)
                        .map((subItem) => (
                            <ChildMenuItem
                                key={subItem.id}
                                item={{
                                    id: subItem.label,
                                    action: () => onItemClick(subItem.id),
                                    disabled: false,
                                }}
                            />
                        ))}
                </CustomNestedMenuItem>
            );
        } else {
            return (
                <ChildMenuItem
                    key={menuItem.id}
                    item={{
                        id: menuItem.label,
                        action: () => onItemClick(menuItem.id),
                        disabled: false,
                    }}
                />
            );
        }
    };

    const renderMenuSections = (sections: MenuSection[]) => {
        return sections.flatMap((section, sectionIndex) => {
            const visibleItems = section.items.filter((item) => !item.hide);

            if (visibleItems.length === 0) {
                return [];
            }

            const sectionElements = visibleItems.map((menuItem) => renderMenuItem(menuItem));

            if (sectionIndex < sections.length - 1) {
                sectionElements.push(<Divider key={`section-divider-${section.id}`} />);
            }

            return sectionElements;
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
            <div>{renderMenuSections(menuSections)}</div>
        </Menu>
    );
};

export default NetworkModificationsMenu;
