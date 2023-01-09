/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { gridItem, GridSection } from './dialogUtils';
import { loadScaling } from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { elementType } from '@gridsuite/commons-ui';
import {
    ACTIVE_VARIATION_MODE,
    LOAD_SCALABLE_TYPES,
    REACTIVE_VARIATION_MODE,
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
        padding: '15px',
    },
}));

const ACTIVE_VAR_MODE_DEFAULT_VALUE = 'PROPORTIONAL';
const REACTIVE_VAR_MODE_DEFAULT_VALUE = 'TAN_FIXED';
const IDENTIFIER_LIST = 'IDENTIFIER_LIST';
const VENTILATION = 'VENTILATION';

const VariationSection = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    fieldProps,
    errors,
}) => {
    const classes = useStyles();

    function itemFilter(value) {
        if (variationMode === VENTILATION) {
            return (
                value?.specificMetadata?.type === IDENTIFIER_LIST &&
                value?.specificMetadata?.filterEquipmentsAttributes?.every(
                    (fil) => !!fil.distributionKey
                )
            );
        }

        return true;
    }

    const [filters, filtersField] = useDirectoryElements({
        label: 'filter',
        initialValues: defaultValue.filters ? defaultValue.filters : [],
        validation: {
            isFieldRequired: true,
        },
        elementType: elementType.FILTER,
        equipmentTypes: [EquipmentType.LOAD],
        itemFilter: itemFilter,
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
        errorMsg: errors?.filtersError,
    });

    const [variationValue, variationValueField] = useDoubleValue({
        label: fieldProps.isDeltaP ? 'DeltaP' : 'TargetP',
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.variationValue,
        inputForm: inputForm,
        errorMsg: errors?.variationValueError,
    });

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
    ]);

    return (
        <>
            {gridItem(filtersField, 3.5)}
            {gridItem(variationValueField, 2)}
            {gridItem(variationModeField, 3)}
            {gridItem(reactiveVariationModeField, 2.5)}
        </>
    );
};

/**
 * Dialog to Load Scaling.
 * @param currentNodeUuid the currently selected tree node
 * @param editData the possible line split with voltage level creation record to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const LoadScalingDialog = ({ currentNodeUuid, editData, ...dialogProps }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

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
        values.forEach((val, idx) => {
            const errorId = 'FieldIsRequired';
            if (!val.filters || val.filters.length < 1) {
                res.set(idx, {
                    error: true,
                    filtersError: errorId,
                });
            }
            if (!val.variationValue) {
                res.set(idx, {
                    ...res.get(idx),
                    error: true,
                    variationValueError: errorId,
                });
            }
            if (!val.variationMode) {
                res.set(idx, {
                    ...res.get(idx),
                    error: true,
                    variationModeError: errorId,
                });
            }
            if (!val.reactiveVariationMode) {
                res.set(idx, {
                    ...res.get(idx),
                    error: true,
                    reactiveVariationModeError: errorId,
                });
            }
        });
        return res;
    }

    const [variationType, variationTypeRadioButton] = useRadioValue({
        inputForm: inputForm,
        defaultValue: formValues?.variationType ?? 'DELTA_P',
        possibleValues: LOAD_SCALABLE_TYPES,
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
            currentNodeUuid,
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
    currentNodeUuid: PropTypes.string,
    lineOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    editData: PropTypes.object,
};

export default LoadScalingDialog;
