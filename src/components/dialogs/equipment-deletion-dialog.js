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
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';
import { deleteEquipment } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { validateField } from '../util/validation-functions';

const equipmentTypes = [
    'LINE',
    'TWO_WINDINGS_TRANSFORMER',
    'THREE_WINDINGS_TRANSFORMER',
    'GENERATOR',
    'LOAD',
    'BATTERY',
    'DANGLING_LINE',
    'HVDC_LINE',
    'LCC_CONVERTER_STATION',
    'VSC_CONVERTER_STATION',
    'SHUNT_COMPENSATOR',
    'STATIC_VAR_COMPENSATOR',
];

const useStyles = makeStyles(() => ({
    helperText: {
        margin: 0,
    },

    dialogPaper: {
        minWidth: '550px',
        minHeight: '200px',
        margin: 'auto',
    },
    divDialog: {
        minWidth: '500px',
        margin: 'auto',
    },
}));

/**
 * Dialog to delete an equipment n the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 */
const EquipmentDeletionDialog = ({ open, onClose, network }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();

    const intl = useIntl();

    const [equipmentId, setEquipmentId] = useState('');

    const [equipmentType, setEquipmentType] = useState('LINE');

    const [errors, setErrors] = useState(new Map());

    const handleChangeEquipmentId = (event) => {
        setEquipmentId(event.target.value);
    };

    const handleChangeEquipmentType = (event) => {
        setEquipmentType(event.target.value);
    };

    function handleDeleteEquipmentError(response, messsageId) {
        const utf8Decoder = new TextDecoder('utf-8');
        response.body
            .getReader()
            .read()
            .then((value) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: utf8Decoder.decode(value.value),
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: messsageId,
                        intlRef: intlRef,
                    },
                });
            });
    }

    const handleSave = () => {
        let tmpErrors = new Map(errors);

        tmpErrors.set(
            'equipment-id',
            validateField(equipmentId, {
                isFieldRequired: true,
            })
        );

        setErrors(tmpErrors);

        // Check if error list contains an error
        let isValid =
            Array.from(tmpErrors.values()).findIndex((err) => err.error) === -1;

        if (isValid) {
            deleteEquipment(studyUuid, equipmentType, equipmentId).then(
                (response) => {
                    if (response.status !== 200) {
                        handleDeleteEquipmentError(
                            response,
                            'UnableToDeleteEquipment'
                        );
                    } else {
                        handleCloseAndClear();
                    }
                }
            );
        }
    };

    const clearValues = () => {
        setEquipmentId('');
        setEquipmentType('LINE');
    };

    const handleCloseAndClear = () => {
        clearValues();
        setErrors(new Map());
        onClose();
    };

    const handleClose = () => {
        setErrors(new Map());
        onClose();
    };

    return (
        <Dialog
            classes={{ paper: classes.dialogPaper }}
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-delete-equipment"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'DeleteEquipment' })}
            </DialogTitle>
            <DialogContent>
                <div className={classes.divDialog}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} align="center">
                            <TextField
                                required
                                id="equipment-id"
                                label={intl.formatMessage({ id: 'ID' })}
                                variant="filled"
                                value={equipmentId}
                                onChange={handleChangeEquipmentId}
                                /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
                                   which is not the case when no variant is used) */
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...(errors.get('equipment-id')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('equipment-id')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={6} align="center">
                            <FormControl fullWidth>
                                <InputLabel
                                    id="equipment-type-label"
                                    margin={'dense'}
                                >
                                    {intl.formatMessage({ id: 'Type' })}
                                </InputLabel>
                                <Select
                                    id="equipment-type"
                                    value={equipmentType}
                                    onChange={handleChangeEquipmentType}
                                    variant="filled"
                                    fullWidth
                                >
                                    {equipmentTypes.map((item) => {
                                        return (
                                            <MenuItem value={item}>
                                                {intl.formatMessage({
                                                    id: item,
                                                })}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <br />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAndClear} variant="text">
                    <FormattedMessage id="close" />
                </Button>
                <Button onClick={handleSave} variant="text">
                    <FormattedMessage id="save" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EquipmentDeletionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    network: PropTypes.object.isRequired,
};

export default EquipmentDeletionDialog;
