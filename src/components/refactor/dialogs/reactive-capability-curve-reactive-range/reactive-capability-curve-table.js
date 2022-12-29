/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@mui/material';
import { useStyles } from '../../../dialogs/dialogUtils';
import ReactiveCapabilityCurveReactiveRange from './reactive-capability-curve-reactive-range';

const minimalValue = { p: '', qminP: '', qmaxP: '' };

function getId(value) {
    return value?.id ? value.id : 'defaultId';
}

function getNewId() {
    return Math.random().toString(36).substring(2);
}

function hasValueCorrectFormat(valueToTest, index) {
    return !!(
        valueToTest &&
        valueToTest[index] &&
        valueToTest[index].p !== undefined &&
        valueToTest[index].qminP !== undefined &&
        valueToTest[index].qmaxP !== undefined
    );
}

function enforceMinimumValues(valueToTest) {
    // The goal here is to verify that there are at least two items with the correct format
    // in the provided array.
    // If there are not enough items (less than two), then the first and second items will be intialized here.
    let returnValue = [];
    returnValue[0] = hasValueCorrectFormat(valueToTest, 0)
        ? valueToTest[0]
        : minimalValue;
    returnValue[1] = hasValueCorrectFormat(valueToTest, 1)
        ? valueToTest[1]
        : minimalValue;
    // Then for each other item in the provieded array, we check that its format is correct.
    if (valueToTest?.length > 2) {
        for (let i = 2; i < valueToTest.length; i++) {
            returnValue[i] = hasValueCorrectFormat(valueToTest, i)
                ? valueToTest[i]
                : minimalValue;
        }
    }
    return returnValue;
}

export const ReactiveCapabilityCurveTable = ({
    tableHeadersIds,
    Field,
    inputForm,
    defaultValues, // format : either undefined or [{ p: '', qminP: '', qmaxP: '' }, { p: '', qminP: '', qmaxP: '' }]
    isReactiveCapabilityCurveOn,
    disabled = false,
}) => {
    const { control } = useFormContext();

    const {
        fields: reactiveCapabilityFields,
        insert,
        remove,
    } = useFieldArray({
        name: 'reactiveCapabilityCurvePoints',
        control,
    });

    const classes = useStyles();

    // // Values sent back to the parent component.
    // const [values, setValues] = useState(enforceMinimumValues(defaultValues));

    // // Values displayed in the form. When updated, they also updates "values".
    // const [displayedValues, setDisplayedValues] = useState(
    //     enforceMinimumValues(defaultValues)
    // );

    // useEffect(() => {
    //     // Updates the component when the correct default values are given by the parent component.
    //     if (defaultValues !== undefined && defaultValues.length > 0) {
    //         const enforcedMinimumDefaultValues =
    //             enforceMinimumValues(defaultValues);
    //         setValues(enforcedMinimumDefaultValues);
    //         setDisplayedValues(enforcedMinimumDefaultValues);
    //     }
    // }, [defaultValues]);

    // const handleDeleteItem = useCallback(
    //     (index) => {
    //         const newValues = [...values];
    //         newValues.splice(index, 1);

    //         setValues(newValues);
    //         setDisplayedValues(newValues);

    //         inputForm.reset();
    //         inputForm.setHasChanged(true);
    //     },
    //     [values, inputForm]
    // );

    // const handleAddValue = useCallback(() => {
    //     const newValues = [...values];
    //     newValues.splice(values.length - 1, 0, minimalValue);

    //     setValues(newValues);

    //     // Adds a unique ID on each displayed line, to prevent a bad rendering effect
    //     const newValuesForDisplay = newValues.map((v) => {
    //         v.id = getNewId();
    //         return v;
    //     });
    //     setDisplayedValues(newValuesForDisplay);
    //     inputForm.setHasChanged(true);
    // }, [values, inputForm]);

    // const handleSetValue = useCallback((index, newValue) => {
    //     setValues((oldValues) => [
    //         ...oldValues.slice(0, index),
    //         newValue,
    //         ...oldValues.slice(index + 1),
    //     ]);
    // }, []);

    // useEffect(() => {
    //     if (!isReactiveCapabilityCurveOn) {
    //         // When isReactiveCapabilityCurveOn is false, the reactive capability curve
    //         // component (ReactiveCapabilityCurveTable in file dialogs/reactive-capability-curve-table.js) does
    //         // not change the validation of its values and they are still required.
    //         // we update the validations of reactive capability curve values so they are not required any more.
    //         values.forEach((value, index) => {
    //             inputForm.addValidation('P' + index, () => true);
    //             inputForm.addValidation('QmaxP' + index, () => true);
    //             inputForm.addValidation('QminP' + index, () => true);
    //         });
    //     }
    // }, [inputForm, values, isReactiveCapabilityCurveOn]);

    console.log('FIELDS ', reactiveCapabilityFields);
    return (
        <Grid item container spacing={2}>
            {tableHeadersIds.map((header) => (
                <Grid key={header} item xs={3}>
                    <FormattedMessage id={header} />
                </Grid>
            ))}

            {reactiveCapabilityFields.map((field, index) => {
                let labelSuffix;
                if (index === 0) labelSuffix = 'min';
                else if (index === reactiveCapabilityFields.length - 1)
                    labelSuffix = 'max';
                else labelSuffix = index.toString();

                return (
                    <Grid key={field.id} container spacing={3} item>
                        <ReactiveCapabilityCurveReactiveRange
                            labelSuffix={labelSuffix}
                            index={index}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                onClick={() => remove(index)}
                                disabled={
                                    disabled ||
                                    index === 0 ||
                                    index ===
                                        reactiveCapabilityFields.length - 1
                                }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {index === reactiveCapabilityFields.length - 1 && (
                            <IconButton
                                className={classes.icon}
                                onClick={() =>
                                    insert(
                                        reactiveCapabilityFields.length - 1,
                                        { p: 0, qmaxP: 0, qminP: 0 }
                                    )
                                }
                                disabled={disabled}
                                style={{ top: '-1em' }}
                            >
                                <AddIcon />
                            </IconButton>
                        )}
                    </Grid>
                );
            })}

            {/* {displayedValues.map((value, index, displayedValues) => {
                const id = getId(value);
                let labelSuffix;
                if (index === 0) labelSuffix = 'min';
                else if (index === displayedValues.length - 1)
                    labelSuffix = 'max';
                else labelSuffix = index.toString();
                return (
                    <Grid key={id + index} container spacing={3} item>
                        <Field
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={index}
                            inputForm={inputForm}
                            isFieldRequired={isReactiveCapabilityCurveOn}
                            disabled={disabled}
                            labelSuffix={labelSuffix}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + index}
                                onClick={() => handleDeleteItem(index)}
                                disabled={
                                    disabled ||
                                    index === 0 ||
                                    index === displayedValues.length - 1
                                }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {index === displayedValues.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
                                    className={classes.icon}
                                    key={id + index}
                                    onClick={handleAddValue}
                                    disabled={disabled}
                                    style={{ top: '-1em' }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                );
            })} */}
        </Grid>
    );
};
