/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useParams } from 'react-router-dom';
import { deleteEquipment } from '../../utils/rest-api';
import { useSnackMessage } from '../../utils/messages';
import { validateField } from '../util/validation-functions';
import { useInputForm } from './inputs/input-hooks';
import { useSearchMatchingEquipments } from '../util/search-matching-equipments';
import { filledTextField, getIdOrSelf } from './dialogUtils';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import ModificationDialog from './modificationDialog';

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

const defaultEquipmentType = 'LINE';

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
        editData?.equipmentType ?? defaultEquipmentType
    );

    const [errors, setErrors] = useState(new Map());

    const [searchMatchingEquipments, equipmentsFound] =
        useSearchMatchingEquipments(
            studyUuid,
            currentNodeUuid,
            true,
            equipmentType,
            makeItems
        );

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
            onSearchTermChange: searchMatchingEquipments,
            values: equipmentsFound,
            defaultValue: editData?.equipmentId || '',
        });

    const handleChangeEquipmentType = (event) => {
        const nextEquipmentType = event.target.value;
        setEquipmentType(nextEquipmentType);
        setEquipmentOrId(null);
    };

    function handleDeleteEquipmentError(response, messsageId) {
        const utf8Decoder = new TextDecoder('utf-8');
        response.body
            .getReader()
            .read()
            .then((value) => {
                snackError({
                    messageTxt: utf8Decoder.decode(value.value),
                    headerId: messsageId,
                });
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
            equipmentType.endsWith('CONVERTER_STATION')
                ? 'HVDC_CONVERTER_STATION'
                : equipmentType,
            equipmentOrId?.id || equipmentOrId,
            editData?.uuid
        ).then((response) => {
            if (response.status !== 200) {
                handleDeleteEquipmentError(response, 'UnableToDeleteEquipment');
            }
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
        </ModificationDialog>
    );
};

EquipmentDeletionDialog.propTypes = {
    currentNodeUuid: PropTypes.string,
    editData: PropTypes.object,
};

export default EquipmentDeletionDialog;
