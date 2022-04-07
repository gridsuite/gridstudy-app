/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { FormattedMessage, useIntl } from 'react-intl';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    button: {
        justifyContent: 'flex-start',
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
            >
                <DialogTitle>
                    {intl.formatMessage({ id: 'NetworkModifications' })}
                </DialogTitle>
                <DialogContent>
                    <Grid container direction="column" spacing={2}>
                        {Object.entries(dialogs).map(([id, values]) => (
                            <Grid key={id} item>
                                <Button
                                    fullWidth
                                    className={classes.button}
                                    variant="outlined"
                                    startIcon={values.icon}
                                    onClick={() => onOpenDialog(id)}
                                >
                                    <Typography align="left">
                                        <FormattedMessage id={values.label} />
                                    </Typography>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="text">
                        <FormattedMessage id="close" />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

NetworkModificationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    network: PropTypes.object.isRequired,
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default NetworkModificationDialog;
