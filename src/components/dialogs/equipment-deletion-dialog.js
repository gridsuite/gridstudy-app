/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useParams } from 'react-router-dom';
import { deleteEquipment } from '../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { validateField } from '../util/validation-functions';
import { useInputForm } from './inputs/input-hooks';
import { compareById, filledTextField, getIdOrSelf } from './dialogUtils';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import ModificationDialog from './modificationDialog';
import { EQUIPMENT_TYPES } from '../util/equipment-types';

const defaultEquipmentType = EQUIPMENT_TYPES.LINE.type;

/**
 * Dialog to delete an equipment in the network
 * @param currentNodeUuid : the currently selected tree node
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const EquipmentDeletionDialog = ({
    currentNodeUuid,
    editData,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const intl = useIntl();
    const inputForm = useInputForm();

    const [equipmentType, setEquipmentType] = useState(
        EQUIPMENT_TYPES[editData?.equipmentType] ?? defaultEquipmentType
    );

    const [equipmentsFound, setEquipmentsFound] = useState([]);

    const [errors, setErrors] = useState(new Map());

    useEffect(() => {
        setEquipmentsFound([]);
        Promise.all(
            equipmentType.fetchers.map((fetchPromise) =>
                fetchPromise(studyUuid, currentNodeUuid)
            )
        )
            .then((vals) => {
                setEquipmentsFound(vals.flat().sort(compareById));
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'equipmentsLoadingError',
                });
            });
    }, [equipmentType, currentNodeUuid, studyUuid, snackError]);

    const [equipmentOrId, equipmentField, setEquipmentOrId] =
        useAutocompleteField({
            allowNewValue: true,
            label: intl.formatMessage({
                id: 'ID',
            }),
            getLabel: getIdOrSelf,
            validation: { isFieldRequired: true },
            formProps: filledTextField,
            inputForm: inputForm,
            values: equipmentsFound,
            defaultValue: editData?.equipmentId || '',
        });

    const handleChangeEquipmentType = (event) => {
        const nextEquipmentType = event.target.value;
        setEquipmentType(nextEquipmentType);
        setEquipmentOrId(null);
    };

    function handleDeleteEquipmentError(errorMessage, messsageId) {
        snackError({
            messageTxt: errorMessage,
            headerId: messsageId,
        });
    }

    const handleValidation = () => {
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
        return isValid;
    };

    const handleSave = () => {
        deleteEquipment(
            studyUuid,
            currentNodeUuid,
            equipmentType.type.endsWith('CONVERTER_STATION')
                ? EQUIPMENT_TYPES.HVDC_CONVERTER_STATION.type
                : equipmentType.type,
            equipmentOrId?.id || equipmentOrId,
            editData?.uuid
        ).catch((error) => {
            handleDeleteEquipmentError(
                error.message,
                'UnableToDeleteEquipment'
            );
        });
    };

    const handleClear = () => {
        setEquipmentType(defaultEquipmentType);
        setErrors(new Map());
    };

    return (
        <ModificationDialog
            onClear={handleClear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            titleId="DeleteEquipment"
            aria-labelledby="dialog-delete-equipment"
            fullWidth
            {...dialogProps}
        >
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
                            {Object.values(EQUIPMENT_TYPES).map((values) => {
                                return (
                                    <MenuItem key={values.label} value={values}>
                                        {intl.formatMessage({
                                            id: values.label,
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
        </ModificationDialog>
    );
};

EquipmentDeletionDialog.propTypes = {
    currentNodeUuid: PropTypes.string,
    editData: PropTypes.object,
};

export default EquipmentDeletionDialog;
