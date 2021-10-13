/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/ControlPoint';
import DeleteIcon from '@material-ui/icons/Delete';
import LoadCreationDialog from './load-creation-dialog';
import GeneratorCreationDialog from './generator-creation-dialog';
import EquipmentDeletionDialog from './equipment-deletion-dialog';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles(() => ({
    button: {
        width: 200,
        justifyContent: 'start',
    },
}));

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 */
const NetworkModificationDialog = ({ open, onClose, network }) => {
    const intl = useIntl();
    const classes = useStyles();

    const [openCreateLoadDialog, setOpenCreateLoadDialog] = useState(false);
    const [openEquipmentDeletionDialog, setOpenEquipmentDeletionDialog] =
        useState(false);
    const [openCreateGeneratorDialog, setOpenCreateGeneratorDialog] =
        useState(false);

    const handleClose = () => {
        onClose();
    };

    const handleExited = () => {
        onClose();
    };

    const handleCreateLoad = () => {
        setOpenCreateLoadDialog(true);
    };

    const closeCreateLoadDialog = () => {
        setOpenCreateLoadDialog(false);
    };

    const handleDeleteEquipment = () => {
        setOpenEquipmentDeletionDialog(true);
    };

    const closeEquipmentDeletionDialog = () => {
        setOpenEquipmentDeletionDialog(false);
    };

    const handleCreateGenerator = () => {
        setOpenCreateGeneratorDialog(true);
    };

    const closeCreateGeneratorDialog = () => {
        setOpenCreateGeneratorDialog(false);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                onExited={handleExited}
                aria-labelledby="dialog-network-modifications"
            >
                <DialogTitle>
                    {intl.formatMessage({ id: 'NetworkModifications' })}
                </DialogTitle>
                <DialogContent>
                    <Grid container direction="row" spacing={2}>
                        <Grid item xs={12} justify="start">
                            <Box>
                                <Button
                                    className={classes.button}
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateLoad}
                                >
                                    {intl.formatMessage({
                                        id: 'CreateLoad',
                                    })}
                                </Button>
                            </Box>
                        </Grid>
                        <br />
                        <Grid item xs={12} justify="start">
                            <Box>
                                <Button
                                    className={classes.button}
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreateGenerator}
                                >
                                    {intl.formatMessage({
                                        id: 'CreateGenerator',
                                    })}
                                </Button>
                            </Box>
                        </Grid>
                        <br />
                        <Grid item xs={12} justify="start">
                            <Box>
                                <Button
                                    className={classes.button}
                                    variant="outlined"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteEquipment}
                                >
                                    {intl.formatMessage({
                                        id: 'DeleteEquipment',
                                    })}
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
            <GeneratorCreationDialog
                open={openCreateGeneratorDialog}
                onClose={closeCreateGeneratorDialog()}
                network={network}
            />
            <EquipmentDeletionDialog
                open={openEquipmentDeletionDialog}
                onClose={closeEquipmentDeletionDialog}
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
