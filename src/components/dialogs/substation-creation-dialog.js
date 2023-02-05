/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { createSubstation, fetchAppsAndUrls } from '../../utils/rest-api';
import {
    useCountryValue,
    useInputForm,
    useTextValue,
} from './inputs/input-hooks';
import {
    filledTextField,
    func_identity,
    getIdOrSelf,
    gridItem,
    GridSection,
    sanitizeString,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { useExpandableValues } from './inputs/use-expandable-values';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import { EQUIPMENT_TYPES } from '../util/equipment-types';

const validateStringPair = (values) => {
    const res = new Map();
    const idMap = values.reduce(
        (m, v) => m.set(v.name, (m.get(v.name) || 0) + 1),
        new Map()
    );

    values.forEach((val, idx) => {
        const errorId = idMap.get(val.name) > 1;
        if (errorId)
            res.set(idx, {
                error: true,
                ...(errorId && { name: 'DuplicateId' }),
            });
    });
    return res;
};

const NonNullStringPair = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    fieldProps,
    errors,
}) => {
    const predefined = fieldProps?.predefined;
    const predefinedNames = useMemo(() => {
        return Object.keys(predefined ?? {}).sort();
    }, [predefined]);

    const [name, nameField] = useAutocompleteField({
        id: 'pairKey' + index,
        label: 'PropertyName',
        validation: { isFieldRequired: true },
        values: predefinedNames,
        allowNewValue: true,
        getLabel: getIdOrSelf,
        newEntryToValue: func_identity,
        defaultValue: defaultValue?.name || '',
        inputForm: inputForm,
        errorMsg: errors?.name,
    });

    const predefinedValues = useMemo(() => {
        return predefined?.[name]?.sort() ?? [];
    }, [name, predefined]);

    const [value, valueField] = useAutocompleteField({
        id: 'pairValue' + index,
        label: 'PropertyValue',
        validation: { isFieldRequired: true },
        values: predefinedValues,
        allowNewValue: true,
        getLabel: getIdOrSelf,
        newEntryToValue: func_identity,
        defaultValue: defaultValue?.value || '',
        inputForm: inputForm,
        errorMsg: errors?.value,
    });

    useEffect(() => {
        onChange(index, {
            name,
            value,
        });
    }, [index, name, value, onChange]);

    return (
        <>
            {gridItem(nameField, 5)}
            {gridItem(valueField, 5)}
        </>
    );
};

const fetchPredefinedProperties = () => {
    return fetchAppsAndUrls().then((res) => {
        const studyMetadata = res.find((metadata) => metadata.name === 'Study');
        if (!studyMetadata) {
            return Promise.reject(
                'Study entry could not be found in metadatas'
            );
        }

        return Promise.resolve(studyMetadata.predefinedEquipmentProperties);
    });
};

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

    const [predefinedProperties, setPredefinedProperties] = useState();

    const equipmentPath = 'substations';

    const toFormValues = (substation) => {
        return {
            equipmentId: substation.id + '(1)',
            equipmentName: substation.name ?? '',
            substationCountryLabel: substation.countryName,
            substationCountry: substation.countryCode,
            properties: substation.properties,
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
        const fetchPromise = fetchPredefinedProperties();
        if (fetchPromise) {
            fetchPromise.then((res) => {
                if (res?.substation) {
                    setPredefinedProperties(res.substation);
                }
            });
        }
    }, []);

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

    const fromFormProperties = useMemo(() => {
        return !formValues?.properties
            ? null
            : Object.entries(formValues.properties).map((p) => {
                  return { name: p[0], value: p[1] };
              });
    }, [formValues?.properties]);

    const [additionalProps, AdditionalProps] = useExpandableValues({
        id: 'additionalProps',
        labelAddValue: 'AddProperty',
        validateItem: validateStringPair,
        inputForm: inputForm,
        Field: NonNullStringPair,
        defaultValues: fromFormProperties,
        fieldProps: { predefined: predefinedProperties },
        isRequired: false,
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
            editData ? editData.uuid : undefined,
            additionalProps
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
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

            <Grid container>
                <GridSection title={'AdditionalInformations'} />
                {AdditionalProps}
            </Grid>

            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={EQUIPMENT_TYPES.SUBSTATION.type}
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
