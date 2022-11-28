/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '../../utils/messages';
import { createSubstation } from '../../utils/rest-api';
import {
    useCountryValue,
    useInputForm,
    useTextValue,
} from './inputs/input-hooks';
import { filledTextField, gridItem, sanitizeString } from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

/**
 * Dialog to create a substation in the network
 * @param currentNodeUuid : the currently selected tree node
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const SubstationCreationDialog = ({
    currentNodeUuid,
    editData,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'substations';

    const toFormValues = (substation) => {
        return {
            equipmentId: substation.id + '(1)',
            equipmentName: substation.name ?? '',
            substationCountryLabel: substation.countryName,
            substationCountry: null,
        };
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
    });

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const [substationId, substationIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [substationName, substationNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [substationCountry, substationCountryField] = useCountryValue({
        label: 'Country',
        inputForm: inputForm,
        formProps: filledTextField,
        validation: { isFieldRequired: false },
        defaultCodeValue: formValues?.substationCountry ?? null,
        defaultLabelValue: formValues?.substationCountryLabel ?? null,
    });

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        createSubstation(
            studyUuid,
            currentNodeUuid,
            substationId,
            sanitizeString(substationName),
            substationCountry,
            editData ? true : false,
            editData ? editData.uuid : undefined
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
                headerId: 'SubstationCreationError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    return (
        <ModificationDialog
            onClear={clear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            aria-labelledby="dialog-create-substation"
            fullWidth={true}
            titleId="CreateSubstation"
            searchCopy={searchCopy}
            {...dialogProps}
        >
            <Grid container spacing={2}>
                {gridItem(substationIdField, 4)}
                {gridItem(substationNameField, 4)}
                {gridItem(substationCountryField, 4)}
            </Grid>

            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'SUBSTATION'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </ModificationDialog>
    );
};

SubstationCreationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
};

export default SubstationCreationDialog;
