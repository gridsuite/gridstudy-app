/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import { NestedMenuItem } from 'mui-nested-menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';

const useStyles = makeStyles(() => ({
    dialog: {
        alignItems: 'flex-end',
    },
}));

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param onOpenDialog handle the opening of dialogs
 * @param dialogs the list of dialog
 */
const NetworkModificationDialog = ({
    open,
    onClose,
    onOpenDialog,
    dialogs,
}) => {
    const classes = useStyles();
    const intl = useIntl();

    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="xs"
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-network-modifications"
                classes={{
                    scrollPaper: classes.dialog,
                }}
            >
                <DialogContent>
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
                </DialogContent>
            </Dialog>
        </>
    );
};

NetworkModificationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onOpenDialog: PropTypes.func.isRequired,
    dialogs: PropTypes.array,
};

export default NetworkModificationDialog;
