/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useParams } from 'react-router-dom';
import { deleteEquipment, fetchEquipmentsInfos } from '../../utils/rest-api';
import { useSnackMessage } from '../../utils/messages';
import { validateField } from '../util/validation-functions';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../utils/config-params';
import { useAutocompleteField, useInputForm } from './input-hooks';
import { filledTextField, getId } from './dialogUtils';

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
    'SUBSTATION',
    'VOLTAGE_LEVEL',
];

const makeItems = (eqpts, usesNames) => {
    let autoItems = eqpts
        .map((e) => {
            let label = usesNames ? e.name : e.id;
            return {
                label: label,
                id: e.id,
                key: e.id,
                type: e.type,
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    return autoItems;
};

/**
 * Dialog to delete an equipment in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 * @param currentNodeUuid : the currently selected tree node
 */
const EquipmentDeletionDialog = ({ open, onClose, currentNodeUuid }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const intl = useIntl();
    const inputForm = useInputForm();

    const [equipmentType, setEquipmentType] = useState('LINE');

    const [errors, setErrors] = useState(new Map());

    const [equipmentsFound, setEquipmentsFound] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(false);
    }, [equipmentsFound]);

    const useNameLocal = useSelector((state) => state[PARAM_USE_NAME]);

    useEffect(() => {
        fetchEquipmentsInfos(
            studyUuid,
            currentNodeUuid,
            '',
            false,
            true,
            equipmentType
        )
            .then((infos) => {
                let autoItems = makeItems(infos, useNameLocal);
                setEquipmentsFound(autoItems);
            })
            .catch((errorMessage) =>
                snackError(errorMessage, 'equipmentsSearchingError')
            );
    }, [equipmentType, studyUuid, currentNodeUuid, snackError, useNameLocal]);

    const [equipment, idField] = useAutocompleteField({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm,
        // errorMsg: 'FieldIsRequired',
        formProps: filledTextField,
        values: equipmentsFound,
        getLabel: getId,
        defaultValue: null,
        loading: loading,
    });

    const handleChangeEquipmentType = (event) => {
        const nextEquipmentType = event.target.value;
        setEquipmentType(nextEquipmentType);
    };

    function handleDeleteEquipmentError(response, messsageId) {
        const utf8Decoder = new TextDecoder('utf-8');
        response.body
            .getReader()
            .read()
            .then((value) => {
                snackError(utf8Decoder.decode(value.value), messsageId);
            });
    }

    const handleSave = () => {
        // Check if error list contains an error
        let isValid;
        if (inputForm) {
            isValid = inputForm.validate();
        } else {
            let errMap = new Map(errors);

            errMap.set(
                'equipment-id',
                validateField(equipment, {
                    isFieldRequired: true,
                })
            );
            setErrors(errMap);
            isValid = Array.from(errMap.values())
                .map((p) => p.error)
                .every((e) => e);
        }

        if (isValid) {
            deleteEquipment(
                studyUuid,
                currentNodeUuid,
                equipmentType,
                equipment.id
            ).then((response) => {
                if (response.status !== 200) {
                    handleDeleteEquipmentError(
                        response,
                        'UnableToDeleteEquipment'
                    );
                }
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const clearValues = () => {
        setEquipmentType('LINE');
    };

    const handleCloseAndClear = () => {
        clearValues();
        setErrors(new Map());
        onClose();
    };

    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            setErrors(new Map());
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-delete-equipment"
            fullWidth
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'DeleteEquipment' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6} align="start">
                        <FormControl fullWidth size="small">
                            <InputLabel
                                id="equipment-type-label"
                                // margin={'dense'}
                                variant={'filled'}
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
                                        <MenuItem key={item} value={item}>
                                            {intl.formatMessage({
                                                id: item,
                                            })}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} align="start">
                        {idField}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAndClear}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handleSave}>
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EquipmentDeletionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentNodeUuid: PropTypes.string,
};

export default EquipmentDeletionDialog;
