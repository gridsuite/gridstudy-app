/*import Grid from "@mui/material/Grid";
import {FormattedMessage} from "react-intl";
import ReactiveCapabilityCurveReactiveRange from "../../../dialogs/reactive-capability-curve-reactive-range";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/ControlPoint";
import React, {useCallback, useEffect, useRef, useState} from "@types/react";

const ReactiveCapabilityCurveForm = ({}) => {
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
                if (isReactiveCapabilityCurveOn) return true;
                // The first and last element have the previous value, so they are not required.
                else if (index === values.length - 1 || index === 0) {
                    return undefined;
                } else {
                    // the fields are required if new intermediate lines are added
                    if (
                        displayedPreviousValues === undefined ||
                        displayedPreviousValues[index]?.p === ''
                    )
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
                if (index === 0) labelSuffix = 'min';
                else if (index === displayedValues.length - 1)
                    labelSuffix = 'max';
                else labelSuffix = index.toString();
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
}
*/