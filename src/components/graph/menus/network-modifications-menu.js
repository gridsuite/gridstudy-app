/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import { useIntl } from 'react-intl';
import { NestedMenuItem } from 'mui-nested-menu';
import NodeMenuItem from './create-node-item';

/**
 * Menu to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param onOpenDialog handle the opening of dialogs
 * @param dialogs the list of dialog
 */
const NetworkModificationsMenu = ({ open, onClose, onOpenDialog, dialogs }) => {
    const intl = useIntl();
    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            {dialogs.map((dialog) =>
                dialog.subItems !== null ? (
                    <NestedMenuItem
                        key={dialog.id}
                        parentMenuOpen={true}
                        label={intl.formatMessage({ id: dialog.label })}
                    >
                        {dialog.subItems.map((subItem) => (
                            <NodeMenuItem
                                key={subItem.id}
                                item={{
                                    id: subItem.label,
                                    action: () => onOpenDialog(subItem.id),
                                    disabled: false,
                                }}
                            />
                        ))}
                    </NestedMenuItem>
                ) : (
                    <NodeMenuItem
                        key={dialog.id}
                        item={{
                            id: dialog.label,
                            action: () => onOpenDialog(dialog.id),
                            disabled: false,
                        }}
                    />
                )
            )}
        </Menu>
    );
};

NetworkModificationsMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onOpenDialog: PropTypes.func.isRequired,
    dialogs: PropTypes.array,
};

export default NetworkModificationsMenu;
