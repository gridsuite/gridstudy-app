/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
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
    editData,
    setEditData,
}) => {
    console.info('editData2222', editData)
    const classes = useStyles();
    const intl = useIntl();

    const [dialogOpen, setDialogOpen] = useState(undefined);

    const closeDialog = () => {
        setDialogOpen(undefined);
        setEditData(undefined);
    };

    const openDialog = (dialogId) => {
        setDialogOpen(dialogId);
    };

    useEffect(() => {
        setDialogOpen(editData?.type);
    }, [editData]);

    function withDefaultParams(Dialog, props) {
        return (
            <Dialog
                open={true}
                onClose={closeDialog}
                selectedNodeUuid={selectedNodeUuid}
                workingNodeUuid={workingNodeUuid}
                editData={editData}
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
        LOAD_CREATION: {
            label: 'CreateLoad',
            dialog: () => withVoltageLevel(LoadCreationDialog),
            icon: <AddIcon />,
        },
        GENERATOR_CREATION: {
            label: 'CreateGenerator',
            dialog: () => withVoltageLevel(GeneratorCreationDialog),
            icon: <AddIcon />,
        },
        SHUNT_COMPENSATOR_CREATION: {
            label: 'CreateShuntCompensator',
            dialog: () => withVoltageLevel(ShuntCompensatorCreationDialog),
            icon: <AddIcon />,
        },
        LINE_CREATION: {
            label: 'CreateLine',
            dialog: () => withVoltageLevel(LineCreationDialog),
            icon: <AddIcon />,
        },
        TWO_WINDING_TRANSFORMER_CREATION: {
            label: 'CreateTwoWindingsTransformer',
            dialog: () =>
                withVoltageLevel(TwoWindingsTransformerCreationDialog),
            icon: <AddIcon />,
        },
        SUBSTATION_CREATION: {
            label: 'CreateSubstation',
            dialog: () => withVoltageLevel(SubstationCreationDialog),
            icon: <AddIcon />,
        },
        VOLTAGE_LEVEL_CREATION: {
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
                                    {intl.formatMessage({
                                        id: values.label,
                                    })}
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
