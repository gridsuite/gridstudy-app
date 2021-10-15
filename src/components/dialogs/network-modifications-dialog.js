/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/ControlPoint';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import LoadCreationDialog from './load-creation-dialog';

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 */
const NetworkModificationDialog = ({ open, onClose, network }) => {
    const intl = useIntl();

    const [openCreateLoadDialog, setOpenCreateLoadDialog] = useState(false);

    const handleClose = () => {
        onClose();
    };

    const handleCreateLoad = () => {
        setOpenCreateLoadDialog(true);
    };

    const closeCreateLoadDialog = () => {
        setOpenCreateLoadDialog(false);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-network-modifications"
            >
                <DialogTitle>
                    {intl.formatMessage({ id: 'NetworkModifications' })}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={2} align="center">
                            <Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateLoad}
                                >
                                    {intl.formatMessage({ id: 'CreateLoad' })}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="text">
                        <FormattedMessage id="close" />
                    </Button>
                </DialogActions>
            </Dialog>
            <LoadCreationDialog
                open={openCreateLoadDialog}
                onClose={closeCreateLoadDialog}
                network={network}
            />
        </>
    );
};

NetworkModificationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    network: PropTypes.object.isRequired,
};

export default NetworkModificationDialog;
