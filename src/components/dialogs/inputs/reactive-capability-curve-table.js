/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import { useStyles } from '../dialogUtils';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';

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

function getPreviousValue(displayedPreviousValues, displayedValues, index) {
    if (
        displayedPreviousValues !== undefined &&
        displayedValues &&
        index === displayedValues.length - 1
    ) {
        return {
            p: displayedPreviousValues[displayedPreviousValues.length - 1].p,
            qminP: displayedPreviousValues[displayedPreviousValues.length - 1]
                .qminP,
            qmaxP: displayedPreviousValues[displayedPreviousValues.length - 1]
                .qmaxP,
        };
    } else if (
        displayedPreviousValues !== undefined &&
        displayedPreviousValues[index] &&
        index < displayedPreviousValues.length - 1
    ) {
        return {
            p: displayedPreviousValues[index].p,
            qminP: displayedPreviousValues[index].qminP,
            qmaxP: displayedPreviousValues[index].qmaxP,
        };
    } else {
        return null;
    }
}

function fixValuesFormat(valuesToFix) {
    return valuesToFix.map((v) => {
        return {
            p: v.p ? v.p : '',
            qminP: v.qminP ? v.qminP : '',
            qmaxP: v.qmaxP ? v.qmaxP : '',
        };
    });
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

export const useReactiveCapabilityCurveTableValues = ({
    tableHeadersIds,
    Field,
    inputForm,
    defaultValues, // format : either undefined or [{ p: '', qminP: '', qmaxP: '' }, { p: '', qminP: '', qmaxP: '' }]
    previousValues,
    isReactiveCapabilityCurveOn,
    isModificationForm = false,
    disabled = false,
}) => {
    const classes = useStyles();

    // Values sent back to the parent component.
    const [values, setValues] = useState(enforceMinimumValues(defaultValues));

    // Values displayed in the form. When updated, they also updates "values".
    const [displayedValues, setDisplayedValues] = useState(
        enforceMinimumValues(defaultValues)
    );

    // previousValues is used to display the previous values when the user is modifying a curve.
    const [displayedPreviousValues, setDisplayedPreviousValues] =
        useState(previousValues);

    useEffect(() => {
        // Updates the component when the correct default values are given by the parent component.
        if (
            defaultValues !== undefined &&
            defaultValues.length > 0 &&
            !isModificationForm
        ) {
            const enforcedMinimumDefaultValues =
                enforceMinimumValues(defaultValues);
            setValues(enforcedMinimumDefaultValues);
            setDisplayedValues(enforcedMinimumDefaultValues);
        } else {
            if (defaultValues !== undefined && defaultValues.length > 0) {
                setValues(fixValuesFormat(defaultValues));
                setDisplayedValues(fixValuesFormat(defaultValues));
                const valuesToDisplay = [];
                defaultValues.forEach((value) => {
                    valuesToDisplay.push({
                        p: value.oldP,
                        qminP: value.oldQminP,
                        qmaxP: value.oldQmaxP,
                    });
                });
                setDisplayedPreviousValues(valuesToDisplay);
            } else if (previousValues && previousValues.length > 0) {
                const valuesToDisplay = Array(previousValues.length).fill(
                    minimalValue
                );
                setValues(valuesToDisplay);
                setDisplayedValues(valuesToDisplay);
                setDisplayedPreviousValues(previousValues);
            }
        }
    }, [defaultValues, isModificationForm, previousValues]);

    const handleDeleteItem = useCallback(
        (index) => {
            const newValues = [...values];
            newValues.splice(index, 1);

            setValues(newValues);
            setDisplayedValues(newValues);

            if (displayedPreviousValues !== undefined) {
                const newDisplayedPreviousValues = [...displayedPreviousValues];
                newDisplayedPreviousValues.splice(index, 1);
                setDisplayedPreviousValues(newDisplayedPreviousValues);
            }

            inputForm.reset();
            inputForm.setHasChanged(true);
        },
        [values, displayedPreviousValues, inputForm]
    );

    const handleAddValue = useCallback(
        (index) => {
            const newValues = [...values];
            newValues.splice(values.length - 1, 0, minimalValue);

            setValues(newValues);

            // Adds a unique ID on each displayed line, to prevent a bad rendering effect
            const newValuesForDisplay = newValues.map((v) => {
                v.id = getNewId();
                return v;
            });
            setDisplayedValues(newValuesForDisplay);
            inputForm.setHasChanged(true);

            if (
                displayedPreviousValues !== undefined &&
                displayedPreviousValues.length <= values.length
            ) {
                const newDisplayedPreviousValues = [...displayedPreviousValues];
                const indexDisplayedPreviousValue = previousValues.findIndex(
                    (v) => v?.p === displayedPreviousValues[index - 1]?.p
                );
                const newValue =
                    indexDisplayedPreviousValue !== -1 &&
                    indexDisplayedPreviousValue + 1 < previousValues.length - 1
                        ? previousValues[indexDisplayedPreviousValue + 1]
                        : minimalValue;

                newDisplayedPreviousValues.splice(
                    displayedPreviousValues.length - 1,
                    0,
                    newValue
                );
                setDisplayedPreviousValues(newDisplayedPreviousValues);
            }
        },
        [values, displayedPreviousValues, previousValues, inputForm]
    );

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => [
            ...oldValues.slice(0, index),
            newValue,
            ...oldValues.slice(index + 1),
        ]);
    }, []);

    useEffect(() => {
        if (!isReactiveCapabilityCurveOn) {
            // When isReactiveCapabilityCurveOn is false, the reactive capability curve
            // component (ReactiveCapabilityCurveTable in file dialogs/reactive-capability-curve-table.js) does
            // not change the validation of its values and they are still required.
            // we update the validations of reactive capability curve values so they are not required any more.
            values.forEach((value, index) => {
                if (
                    (displayedPreviousValues !== undefined &&
                        index < displayedPreviousValues.length &&
                        displayedPreviousValues[index]?.p !== '') ||
                    index === values.length - 1 ||
                    index === 0 ||
                    !isModificationForm
                ) {
                    inputForm.addValidation('P' + index, () => true);
                    inputForm.addValidation('QmaxP' + index, () => true);
                    inputForm.addValidation('QminP' + index, () => true);
                }
            });
        }
    }, [
        inputForm,
        values,
        isReactiveCapabilityCurveOn,
        displayedPreviousValues,
        isModificationForm,
    ]);

    const isRequired = useCallback(
        (index) => {
            if (isModificationForm) {
                return isReactiveCapabilityCurveOn
                    ? true
                    : !(
                          (displayedPreviousValues !== undefined &&
                              index < displayedPreviousValues.length - 1 &&
                              displayedPreviousValues[index]?.p !== '') ||
                          index === values.length - 1
                      );
            }
            return isReactiveCapabilityCurveOn;
        },
        [
            displayedPreviousValues,
            isReactiveCapabilityCurveOn,
            isModificationForm,
            values.length,
        ]
    );

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {tableHeadersIds.map((header) => (
                    <Grid key={header} item xs={3}>
                        <FormattedMessage id={header} />
                    </Grid>
                ))}

                {displayedValues.map((value, index, displayedValues) => {
                    const id = getId(value);
                    // We change the P label on the first and last lines of the array
                    const customPLabel =
                        index === 0
                            ? 'MinP'
                            : index === displayedValues.length - 1
                            ? 'MaxP'
                            : undefined;
                    return (
                        <Grid key={id + index} container spacing={3} item>
                            <Field
                                defaultValue={value}
                                onChange={handleSetValue}
                                index={index}
                                inputForm={inputForm}
                                isFieldRequired={isRequired(index)}
                                disabled={disabled}
                                customPLabel={customPLabel}
                                previousValue={getPreviousValue(
                                    displayedPreviousValues,
                                    displayedValues,
                                    index
                                )}
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
                                        onClick={() => handleAddValue(index)}
                                        disabled={disabled}
                                        style={{ top: '-1em' }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Grid>
                            )}
                        </Grid>
                    );
                })}
            </Grid>
        );
    }, [
        tableHeadersIds,
        displayedValues,
        handleSetValue,
        inputForm,
        isRequired,
        disabled,
        displayedPreviousValues,
        classes.icon,
        handleDeleteItem,
        handleAddValue,
    ]);

    return [values, field, displayedPreviousValues];
};
