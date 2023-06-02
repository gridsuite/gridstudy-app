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
import Typography from '@mui/material/Typography';
import { NestedMenuItem } from 'mui-nested-menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

/**
 * Menu to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param onOpenDialog handle the opening of dialogs
 * @param dialogs the list of dialog
 * @param position
 */
const NetworkModificationsMenu = ({ open, onClose, onOpenDialog, dialogs }) => {
    const intl = useIntl();

    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <Menu
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                {Object.entries(dialogs).map(([id, values]) => (
                    <NestedMenuItem
                        key={id}
                        parentMenuOpen={true}
                        label={intl.formatMessage({ id: values.label })}
                    >
                        {Object.entries(values.subItems).map(
                            ([subItemId, subItemValue]) => (
                                <MenuItem
                                    key={subItemId}
                                    onClick={() => onOpenDialog(subItemId)}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography noWrap>
                                                {intl.formatMessage({
                                                    id: subItemValue.label,
                                                })}
                                            </Typography>
                                        }
                                    />
                                </MenuItem>
                            )
                        )}
                    </NestedMenuItem>
                ))}
            </Menu>
        </>
    );
};

NetworkModificationsMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onOpenDialog: PropTypes.func.isRequired,
    dialogs: PropTypes.array,
};

export default NetworkModificationsMenu;
