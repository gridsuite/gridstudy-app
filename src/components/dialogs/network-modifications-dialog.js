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
import TwoWindingsTransformerCreationDialog from './two-windings-transformer-creation-dialog';
import SubstationCreationDialog from './substation-creation-dialog';
import VoltageLevelCreationDialog from './voltage-level-creation-dialog';
import ShuntCompensatorCreationDialog from './shunt-compensator-creation-dialog';
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
 * @param network network from which to search for possible substations
 * @param selectedNodeUuid the currently selected tree node
 */
const NetworkModificationDialog = ({
    open,
    onClose,
    network,
    selectedNodeUuid,
    workingNodeUuid,
}) => {
    const classes = useStyles();
    const intl = useIntl();

    const [dialogOpen, setDialogOpen] = useState(undefined);

    const closeDialog = () => {
        setDialogOpen(undefined);
    };

    const openDialog = (dialogId) => {
        setDialogOpen(dialogId);
    };

    function withDefaultParams(Dialog, props) {
        return (
            <Dialog
                open={true}
                onClose={closeDialog}
                selectedNodeUuid={selectedNodeUuid}
                workingNodeUuid={workingNodeUuid}
                {...props}
            />
        );
    }

    function withVoltageLevel(Dialog, props) {
        return withDefaultParams(Dialog, {
            ...props,
            voltageLevelOptions: network?.voltageLevels,
        });
    }

    function withSubstationOption(Dialog, props) {
        return withDefaultParams(Dialog, {
            ...props,
            substationOptions: network?.substations,
        });
    }

    const dialogs = {
        createLoad: {
            label: 'CreateLoad',
            dialog: () => withVoltageLevel(LoadCreationDialog),
            icon: <AddIcon />,
        },
        createGenerator: {
            label: 'CreateGenerator',
            dialog: () => withVoltageLevel(GeneratorCreationDialog),
            icon: <AddIcon />,
        },
        createShuntCompensator: {
            label: 'CreateShuntCompensator',
            dialog: () => withVoltageLevel(ShuntCompensatorCreationDialog),
            icon: <AddIcon />,
        },
        createLine: {
            label: 'CreateLine',
            dialog: () => withVoltageLevel(LineCreationDialog),
            icon: <AddIcon />,
        },
        createTwoWindingTransformer: {
            label: 'CreateTwoWindingsTransformer',
            dialog: () =>
                withVoltageLevel(TwoWindingsTransformerCreationDialog),
            icon: <AddIcon />,
        },
        substationCreation: {
            label: 'CreateSubstation',
            dialog: () => withVoltageLevel(SubstationCreationDialog),
            icon: <AddIcon />,
        },
        voltageLevelCreation: {
            label: 'CreateVoltageLevel',
            dialog: () => withSubstationOption(VoltageLevelCreationDialog),
            icon: <AddIcon />,
        },
        deleteEquipment: {
            label: 'DeleteEquipment',
            dialog: () => withDefaultParams(EquipmentDeletionDialog),
            icon: <DeleteIcon />,
        },
    };

    const handleClose = () => {
        onClose();
    };

    const renderDialog = () => {
        return dialogs[dialogOpen].dialog();
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
                                    onClick={() => openDialog(id)}
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
            {dialogOpen && renderDialog()}
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
