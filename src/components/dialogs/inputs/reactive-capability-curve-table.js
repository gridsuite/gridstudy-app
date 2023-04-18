/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import { useStyles } from '../dialogUtils';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';
import { validateValueIsANumber } from '../../util/validation-functions';
import ReactiveCapabilityCurveReactiveRange from '../reactive-capability-curve-reactive-range';
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

function getPreviousValue(displayedPreviousValues, index) {
    if (
        displayedPreviousValues !== undefined &&
        index <= displayedPreviousValues.length - 1
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
    // The goal here is to verify that the provided array has the correct format.
    // If the format is not correct, then the value is replaced by an empty string.
    // This is done to avoid errors when the user has not modified all values on a diagram line.
    return valuesToFix.map((v) => {
        return {
            p: validateValueIsANumber(v.p) ? v.p : '',
            qminP: validateValueIsANumber(v.qminP) ? v.qminP : '',
            qmaxP: validateValueIsANumber(v.qmaxP) ? v.qmaxP : '',
        };
    });
}

function buildPreviousValuesToDisplay(defaultValues, previousValues) {
    const valuesToDisplay = [];
    // If the node is built, then we display previousValues.
    // otherwise, we display the old values stored in the modification database.
    defaultValues.forEach((value, index) => {
        let valueToDisplay = minimalValue;
        if (previousValues?.length > 0) {
            // in case the defaultValues array is longer than the previousValues array, we display the last value of the previousValues array.
            if (index === defaultValues.length - 1) {
                valueToDisplay = previousValues[previousValues.length - 1];
            } else if (index < previousValues.length - 1) {
                valueToDisplay = previousValues[index];
            }
        }
        valuesToDisplay.push(valueToDisplay);
    });
    return valuesToDisplay;
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

    const valuesRef = useRef(values);

    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

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
            // In the case of a modification form
            if (defaultValues !== undefined && defaultValues.length > 0) {
                setValues(fixValuesFormat(defaultValues));
                setDisplayedValues(fixValuesFormat(defaultValues));
                setDisplayedPreviousValues(
                    buildPreviousValuesToDisplay(defaultValues, previousValues)
                );
            } else if (previousValues?.length > 0) {
                // We prefill the form with empty lines and with the previous values.
                // if the user has already set some values we prefill with empty values till the previousValues array length
                let valuesToDisplay = valuesRef.current;
                if (previousValues?.length > valuesToDisplay.length) {
                    valuesToDisplay = valuesToDisplay.concat(
                        Array(
                            previousValues.length - valuesToDisplay.length
                        ).fill(minimalValue)
                    );
                }
                setValues(valuesToDisplay);
                setDisplayedValues(valuesToDisplay);
                setDisplayedPreviousValues(
                    buildPreviousValuesToDisplay(
                        valuesToDisplay,
                        previousValues
                    )
                );
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
                //we look for the index of the previous value that is displayed
                const indexDisplayedPreviousValue = previousValues.findIndex(
                    (v) => v?.p === displayedPreviousValues[index - 1]?.p
                );
                //we find the next previous value to display
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

    const hasPreviousValue = useCallback(
        (index) => {
            return (
                displayedPreviousValues !== undefined &&
                index < displayedPreviousValues.length - 1 &&
                displayedPreviousValues[index]?.p !== ''
            );
        },
        [displayedPreviousValues]
    );

    useEffect(() => {
        if (!isReactiveCapabilityCurveOn) {
            // When isReactiveCapabilityCurveOn is false, the reactive capability curve
            // component (ReactiveCapabilityCurveTable in file dialogs/reactive-capability-curve-table.js) does
            // not change the validation of its values and they are still required.
            // we update the validations of reactive capability curve values so they are not required any more.
            values.forEach((value, index) => {
                // for the modification form, we only update the validations of the values that have previous values
                if (
                    isReactiveCapabilityCurveOn !== undefined ||
                    hasPreviousValue(index) ||
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
        hasPreviousValue,
    ]);

    const isFieldRequired = useCallback(
        (index) => {
            if (isModificationForm) {
                if (isReactiveCapabilityCurveOn) {
                    return true;
                }
                // The first and last element have the previous value, so they are not required.
                if (index === values.length - 1 || index === 0) {
                    return undefined;
                }
                // the fields are required if new intermediate lines are added
                if (
                    displayedPreviousValues === undefined ||
                    displayedPreviousValues[index]?.p === ''
                ) {
                    return true;
                }
            }
            return isReactiveCapabilityCurveOn;
        },
        [
            isModificationForm,
            isReactiveCapabilityCurveOn,
            values,
            displayedPreviousValues,
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
                    let labelSuffix;
                    if (index === 0) {
                        labelSuffix = 'min';
                    } else if (index === displayedValues.length - 1) {
                        labelSuffix = 'max';
                    } else {
                        labelSuffix = index.toString();
                    }
                    return (
                        <Grid key={id + index} container spacing={3} item>
                            <ReactiveCapabilityCurveReactiveRange
                                defaultValue={value}
                                onChange={handleSetValue}
                                index={index}
                                inputForm={inputForm}
                                isFieldRequired={isFieldRequired(index)}
                                disabled={disabled}
                                labelSuffix={labelSuffix}
                                previousValue={getPreviousValue(
                                    displayedPreviousValues,
                                    index
                                )}
                                isModificationForm={isModificationForm}
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
        isFieldRequired,
        disabled,
        displayedPreviousValues,
        classes.icon,
        handleDeleteItem,
        handleAddValue,
        isModificationForm,
    ]);

    return [values, field, displayedPreviousValues];
};
