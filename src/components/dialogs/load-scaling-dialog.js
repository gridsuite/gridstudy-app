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
    useInputForm,
    useIntegerValue,
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
        padding: '5px',
    },
}));

const ACTIVE_VAR_MODE_DEFAULT_VALUE = 'PROPORTIONAL';
const REACTIVE_VAR_MODE_DEFAULT_VALUE = 'TAN_FIXED';

const VariationSection = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    errors,
}) => {
    const classes = useStyles();

    const [filters, filtersField] = useDirectoryElements({
        label: 'filter',
        initialValues: defaultValue.filters ? defaultValue.filters : [],
        validation: {
            isFieldRequired: true,
        },
        elementType: elementType.FILTER,
        equipmentTypes: [EquipmentType.LOAD],
        titleId: 'FiltersListsSelection',
        elementClassName: classes.chipElement,
    });

    const [variationValue, variationValueField] = useIntegerValue({
        id: 'DeltaTargetP',
        label: 'DeltaPTarget',
        validation: {
            isFieldRequired: true,
        },
        defaultValue: defaultValue?.variationValue,
        inputForm: inputForm,
        errorMsg: errors?.variationValue,
    });

    const [activeVariationMode, activeVariationModeField] =
        useOptionalEnumValue({
            label: 'ActiveVariationMode',
            inputForm: inputForm,
            enumObjects: ACTIVE_VARIATION_MODE,
            validation: {
                isFieldRequired: true,
            },
            defaultValue: ACTIVE_VAR_MODE_DEFAULT_VALUE,
        });

    const [reactiveVariationMode, reactiveVariationModeField] =
        useOptionalEnumValue({
            label: 'ReactiveVariationMode',
            inputForm: inputForm,
            enumObjects: REACTIVE_VARIATION_MODE,
            validation: {
                isFieldRequired: true,
            },
            defaultValue: REACTIVE_VAR_MODE_DEFAULT_VALUE,
        });

    useEffect(() => {
        onChange(index, {
            filters,
            variationValue,
            activeVariationMode,
            reactiveVariationMode,
        });
    }, [
        activeVariationMode,
        variationValue,
        filters,
        index,
        onChange,
        reactiveVariationMode,
    ]);

    return (
        <>
            {gridItem(filtersField, 2)}
            {gridItem(variationValueField, 2.5)}
            {gridItem(activeVariationModeField, 3.5)}
            {gridItem(reactiveVariationModeField, 3)}
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
        const idMap = values.reduce(
            (m, v) => m.set(v.id, m.get(v.id) || 0),
            new Map()
        );

        values.forEach((val, idx) => {
            const errorId = idMap.get(val.id);
            if (errorId)
                res.set(idx, {
                    error: true,
                    ...errorId,
                });
        });
        return res;
    }

    const [variationType, variationTypeRadioButton] = useRadioValue({
        inputForm: inputForm,
        defaultValue: 'DELTA_P',
        possibleValues: LOAD_SCALABLE_TYPES,
    });

    const [variations, variationsField] = useExpandableValues({
        id: 'variations',
        labelAddValue: 'CreateVariation',
        validateItem: validateVariation,
        inputForm: inputForm,
        Field: VariationSection,
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
            editData ? editData.uuid : undefined,
            variationType,
            variations
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
                headerId: 'LoadScalableError',
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
            titleId="LoadScalable"
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
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    lineOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    editData: PropTypes.object,
};

export default LoadScalingDialog;
