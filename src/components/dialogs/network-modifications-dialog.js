/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import AddIcon from '@material-ui/icons/ControlPoint';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormattedMessage, useIntl } from 'react-intl';
import LoadCreationDialog from './load-creation-dialog';
import GeneratorCreationDialog from './generator-creation-dialog';
import EquipmentDeletionDialog from './equipment-deletion-dialog';
import LineCreationDialog from './line-creation-dialog';

const useStyles = makeStyles((theme) => ({
    button: {
        justifyContent: 'flex-start',
    },
}));

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 */
const NetworkModificationDialog = ({ open, onClose, network }) => {
    const classes = useStyles();
    const intl = useIntl();

    const [openCreateLoadDialog, setOpenCreateLoadDialog] = useState(false);
    const [openEquipmentDeletionDialog, setOpenEquipmentDeletionDialog] =
        useState(false);
    const [openCreateGeneratorDialog, setOpenCreateGeneratorDialog] =
        useState(false);

    const [openCreateLineDialog, setOpenCreateLineDialog] = useState(false);

    const handleClose = () => {
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

    const handleCreateLine = () => {
        setOpenCreateLineDialog(true);
    };

    const closeCreateLineDialog = () => {
        setOpenCreateLineDialog(false);
    };

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="xs"
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-network-modifications"
            >
                <DialogTitle>
                    {intl.formatMessage({ id: 'NetworkModifications' })}
                </DialogTitle>
                <DialogContent>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Button
                                fullWidth
                                className={classes.button}
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleCreateLoad}
                            >
                                {intl.formatMessage({ id: 'CreateLoad' })}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                fullWidth
                                className={classes.button}
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleCreateGenerator}
                            >
                                {intl.formatMessage({
                                    id: 'CreateGenerator',
                                })}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                fullWidth
                                className={classes.button}
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleCreateLine}
                            >
                                {intl.formatMessage({ id: 'CreateLine' })}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                fullWidth
                                className={classes.button}
                                variant="outlined"
                                startIcon={<DeleteIcon />}
                                onClick={handleDeleteEquipment}
                            >
                                {intl.formatMessage({
                                    id: 'DeleteEquipment',
                                })}
                            </Button>
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
                onClose={closeCreateGeneratorDialog}
                network={network}
            />
            <LineCreationDialog
                open={openCreateLineDialog}
                onClose={closeCreateLineDialog}
                network={network}
            />
            <EquipmentDeletionDialog
                open={openEquipmentDeletionDialog}
                onClose={closeEquipmentDeletionDialog}
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
