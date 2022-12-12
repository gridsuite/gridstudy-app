/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { modifyLoad } from '../../utils/rest-api';
import {
    LOAD_TYPES,
    UNDEFINED_LOAD_TYPE,
    getLoadTypeLabel,
} from '../network/constants';
import {
    useDoubleValue,
    useOptionalEnumValue,
    useInputForm,
    useTextValue,
} from './inputs/input-hooks';
import {
    ActivePowerAdornment,
    compareById,
    filledTextField,
    getId,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
    sanitizeString,
} from './dialogUtils';
import { useAutocompleteField } from './inputs/use-autocomplete-field';

/**
 * Dialog to modify a load in the network
 * @param equipmentOptionsPromise Promise handling list of loads that can be modified
 * @param currentNodeUuid the node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LoadModificationDialog = ({
    editData,
    currentNodeUuid,
    equipmentOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const intl = useIntl();

    const [formValues, setFormValues] = useState(undefined);

    const [equipmentOptions, setEquipmentOptions] = useState([]);

    const [loadingEquipmentOptions, setLoadingEquipmentOptions] =
        useState(true);

    useEffect(() => {
        if (!equipmentOptionsPromise) return;
        equipmentOptionsPromise.then((values) => {
            setEquipmentOptions(values);
            setLoadingEquipmentOptions(false);
        });
    }, [equipmentOptionsPromise]);

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const formValueEquipmentId = useMemo(() => {
        return formValues?.equipmentId
            ? { id: formValues?.equipmentId }
            : { id: '' };
    }, [formValues]);

    const [loadInfos, loadIdField] = useAutocompleteField({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        values: equipmentOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getId,
        defaultValue:
            equipmentOptions.find((e) => e.id === formValueEquipmentId?.id) ||
            formValueEquipmentId,
        loading: loadingEquipmentOptions,
    });

    const [loadName, loadNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName
            ? formValues.equipmentName.value
            : undefined,
        previousValue: loadInfos?.name,
        clearable: true,
    });

    const loadTypeLabelId = getLoadTypeLabel(loadInfos?.type);
    const previousLoadTypeLabel = loadTypeLabelId
        ? intl.formatMessage({
              id: loadTypeLabelId,
          })
        : undefined;

    const [loadType, loadTypeField] = useOptionalEnumValue({
        label: 'Type',
        inputForm: inputForm,
        formProps: filledTextField,
        enumObjects: LOAD_TYPES,
        defaultValue:
            formValues?.loadType?.value &&
            formValues.loadType.value !== UNDEFINED_LOAD_TYPE
                ? formValues.loadType.value
                : null,
        previousValue: previousLoadTypeLabel,
    });

    const [activePower, activePowerField] = useDoubleValue({
        label: 'ActivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        previousValue: loadInfos?.p0,
        inputForm: inputForm,
        defaultValue: formValues?.activePower
            ? formValues.activePower.value
            : undefined,
        clearable: true,
    });

    const [reactivePower, reactivePowerField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        previousValue: loadInfos?.q0,
        inputForm: inputForm,
        defaultValue: formValues?.reactivePower
            ? formValues.reactivePower.value
            : undefined,
        clearable: true,
    });

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        modifyLoad(
            studyUuid,
            currentNodeUuid,
            loadInfos?.id,
            sanitizeString(loadName),
            loadType,
            activePower,
            reactivePower,
            undefined,
            undefined,
            editData ? true : false,
            editData ? editData.uuid : undefined
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'LoadModificationError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    return (
        <ModificationDialog
            fullWidth
            onClear={clear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            aria-labelledby="dialog-modify-load"
            maxWidth={'md'}
            titleId="ModifyLoad"
            {...dialogProps}
        >
            <Grid container spacing={2}>
                {gridItem(loadIdField, 4)}
                {gridItem(loadNameField, 4)}
                {gridItem(loadTypeField, 4)}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2}>
                {gridItem(activePowerField, 4)}
                {gridItem(reactivePowerField, 4)}
            </Grid>
        </ModificationDialog>
    );
};

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
    equipmentOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
};

export default LoadModificationDialog;
