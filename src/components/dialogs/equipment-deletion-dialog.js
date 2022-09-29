/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
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
import { deleteEquipment } from '../../utils/rest-api';
import { useSnackMessage } from '../../utils/messages';
import { validateField } from '../util/validation-functions';
import { useInputForm } from './inputs/input-hooks';
import { EquipmentItem, equipmentStyles } from '@gridsuite/commons-ui';
import { useSearchMatchingEquipments } from '../util/search-matching-equipments';
import makeStyles from '@mui/styles/makeStyles';
import { filledTextField } from './dialogUtils';
import { useAutocompleteField } from './inputs/use-autocomplete-field';

const equipmentTypes = [
    'LINE',
    'TWO_WINDINGS_TRANSFORMER',
    'THREE_WINDINGS_TRANSFORMER',
    'GENERATOR',
    'LOAD',
    'BATTERY',
    'DANGLING_LINE',
    'HVDC_LINE',
    'HVDC_CONVERTER_STATION',
    'SHUNT_COMPENSATOR',
    'STATIC_VAR_COMPENSATOR',
    'SUBSTATION',
    'VOLTAGE_LEVEL',
];

const makeItems = (eqpts, usesNames) => {
    if (!eqpts) return [];
    return eqpts
        .map((e) => {
            let label = usesNames ? e.name : e.id;
            return {
                label: label,
                id: e.id,
                key: e.id,
            };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
};

const useEquipmentStyles = makeStyles(equipmentStyles);

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

    const equipmentClasses = useEquipmentStyles();

    const [equipmentType, setEquipmentType] = useState('LINE');

    const [errors, setErrors] = useState(new Map());

    const handleChangeEquipmentType = (event) => {
        const nextEquipmentType = event.target.value;
        setEquipmentType(nextEquipmentType);
    };

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(
            studyUuid,
            currentNodeUuid,
            true,
            equipmentType,
            makeItems
        );

    const [equipmentOrId, equipmentField] = useAutocompleteField({
        allowNewValue: true,
        label: intl.formatMessage({
            id: 'ID',
        }),
        getLabel: (option) => option?.label || option?.id || option,
        validation: { isFieldRequired: true },
        formProps: filledTextField,
        inputForm: inputForm,
        onSearchTermChange: searchMatchingEquipments,
        values: equipmentsFound,
        resetsWhenValuesChange: true,
        defaultValue: '',
        renderElement: (props) => (
            <EquipmentItem
                classes={equipmentClasses}
                {...props}
                key={props.element.key}
                showsJustText={true}
            />
        ),
    });

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
                validateField(equipmentOrId, {
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
                equipmentType.endsWith('CONVERTER_STATION')
                    ? 'HVDC_CONVERTER_STATION'
                    : equipmentType,
                equipmentOrId?.id || equipmentOrId
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

    const handleCloseAndClear = () => {
        setEquipmentType('LINE');
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
                        {equipmentField}
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
