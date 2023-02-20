/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { ActivePowerAdornment, gridItem, GridSection } from './dialogUtils';
import { loadScaling } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { elementType } from '@gridsuite/commons-ui';
import {
    ACTIVE_VARIATION_MODE,
    REACTIVE_VARIATION_MODE,
    VARIATION_TYPE,
} from '../network/constants';

import { useExpandableValues } from './inputs/use-expandable-values';
import {
    useDirectoryElements,
    useDoubleValue,
    useInputForm,
    useOptionalEnumValue,
    useRadioValue,
} from './inputs/input-hooks';
import { makeStyles } from '@mui/styles';
import { EquipmentType } from './sensi/sensi-parameters-selector';

export const useStyles = makeStyles((theme) => ({
    checkedButton: {
        marginTop: 20,
    },
    deleteButton: {
        marginTop: 10,
    },
    button: {
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    },
    emptyListError: {
        color: theme.palette.error.main,
        fontSize: 'small',
        textAlign: 'center',
        margin: theme.spacing(0.5),
    },
    chipElement: {
        margin: 3,
        maxWidth: 200,
    },
    padding: {
        padding: '10px',
    },
}));

const ACTIVE_VAR_MODE_DEFAULT_VALUE = 'PROPORTIONAL';
// to update later after correcting implementation in the backend (Powsybl)
const REACTIVE_VAR_MODE_DEFAULT_VALUE = 'CONSTANT_Q';
const IDENTIFIER_LIST = 'IDENTIFIER_LIST';
const VENTILATION = 'VENTILATION';
const LOADS = [EquipmentType.LOAD];

const VariationSection = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    fieldProps,
    errors,
}) => {
    const classes = useStyles();
    const id = defaultValue?.id;

    const [variationMode, variationModeField] = useOptionalEnumValue({
        label: 'ActiveVariationMode',
        inputForm: inputForm,
        enumObjects: ACTIVE_VARIATION_MODE,
        validation: {
            isFieldRequired: true,
        },
        defaultValue:
            defaultValue?.variationMode ?? ACTIVE_VAR_MODE_DEFAULT_VALUE,
        errorMsg: errors?.variationModeError,
    });

    const itemFilter = useCallback(
        (value) => {
            if (
                value?.type === elementType.FILTER &&
                variationMode === VENTILATION
            ) {
                return (
                    value?.specificMetadata?.type === IDENTIFIER_LIST &&
                    value?.specificMetadata?.filterEquipmentsAttributes?.every(
                        (filter) => !!filter.distributionKey
                    )
                );
            }

            return true;
        },
        [variationMode]
    );

    const [filters, filtersField] = useDirectoryElements({
        label: 'filter',
        initialValues: defaultValue.filters ? defaultValue.filters : [],
        validation: {
            isFieldRequired: true,
        },
        elementType: elementType.FILTER,
        equipmentTypes: LOADS,
        itemFilter: itemFilter,
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
        errorMsg: errors?.filtersError,
        inputForm: inputForm,
    });

    const [variationValue, variationValueField] = useDoubleValue({
        id: id + '_variationValue', // we add an id to make sur when changing labels, we don't create a new validation for this field
        label: fieldProps.isDeltaP ? 'DeltaP' : 'TargetPText',
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.variationValue,
        inputForm: inputForm,
        adornment: ActivePowerAdornment,
        errorMsg: errors?.variationValueError,
    });

    const [reactiveVariationMode, reactiveVariationModeField] =
        useOptionalEnumValue({
            id: 'ReactiveVariationMode',
            label: 'ReactiveVariationMode',
            inputForm: inputForm,
            enumObjects: REACTIVE_VARIATION_MODE,
            validation: {
                isFieldRequired: true,
            },
            defaultValue:
                defaultValue?.reactiveVariationMode ??
                REACTIVE_VAR_MODE_DEFAULT_VALUE,
            errorMsg: errors?.reactiveVariationModeError,
        });

    useEffect(() => {
        onChange(index, {
            id,
            filters,
            variationValue,
            variationMode,
            reactiveVariationMode,
        });
    }, [
        variationMode,
        variationValue,
        filters,
        index,
        onChange,
        reactiveVariationMode,
        id,
    ]);

    return (
        <>
            {gridItem(filtersField, 3.25)}
            {gridItem(variationValueField, 1.75)}
            {gridItem(variationModeField, 3)}
            {gridItem(reactiveVariationModeField, 3)}
        </>
    );
};

/**
 * Dialog to Load Scaling.
 * @param currentNode the currently selected tree node
 * @param studyUuid the study we are currently working on
 * @param editData the possible line split with voltage level creation record to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LoadScalingDialog = ({
    studyUuid,
    currentNode,
    editData,
    ...dialogProps
}) => {
    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const classes = useStyles();

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    function validateVariation(values) {
        const res = new Map();
        const errorId = 'FieldIsRequired';

        values.forEach((val, idx) => {
            const error = { error: true };

            if (!val.filters || val.filters.length < 1) {
                error.filtersError = errorId;
            }
            if (!val.variationValue) {
                error.variationValueError = errorId;
            }
            if (!val.variationMode) {
                error.variationModeError = errorId;
            }
            if (!val.reactiveVariationMode) {
                error.reactiveVariationModeError = errorId;
            }

            if (Object.keys(error).length > 1) {
                res.set(idx, error);
            }
        });

        return res;
    }

    const [variationType, variationTypeRadioButton] = useRadioValue({
        inputForm: inputForm,
        defaultValue: formValues?.variationType ?? 'DELTA_P',
        possibleValues: VARIATION_TYPE,
    });

    const [variations, variationsField] = useExpandableValues({
        id: 'variations',
        labelAddValue: 'CreateVariation',
        validateItem: validateVariation,
        inputForm: inputForm,
        Field: VariationSection,
        fieldProps: { isDeltaP: variationType === 'DELTA_P' },
        defaultValues: formValues?.variations,
        isRequired: true,
    });

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        loadScaling(
            studyUuid,
            currentNode?.id,
            editData?.uuid ?? undefined,
            variationType,
            variations
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
                headerId: 'LoadScalingError',
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
            aria-labelledby="dialog-load-scalable"
            maxWidth={'md'}
            titleId="LoadScaling"
            {...dialogProps}
        >
            <Grid className={classes.padding}>
                {gridItem(variationTypeRadioButton, 8)}
            </Grid>
            <GridSection title="Variations" />
            <Grid container className={classes.padding}>
                {gridItem(variationsField, 12)}
            </Grid>
        </ModificationDialog>
    );
};

LoadScalingDialog.propTypes = {
    currentNode: PropTypes.object,
    lineOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    studyUuid: PropTypes.string,
    editData: PropTypes.object,
};

export default LoadScalingDialog;
