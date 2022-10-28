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
} from 'react';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import { useStyles } from '../dialogUtils';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/ControlPoint';

function hasValueCorrectFormat(valueToTest, index) {
    return !!(valueToTest
        && valueToTest[index]
        && valueToTest[index].p !== undefined
        && valueToTest[index].qminP !== undefined
        && valueToTest[index].qmaxP !== undefined);
}

function enforceMinimumValues(valueToTest) {
    const minimalValue = {p:"", qminP:"", qmaxP:""};
    let returnValue = [];
    returnValue[0] = hasValueCorrectFormat(valueToTest, 0) ? valueToTest[0] : minimalValue;
    returnValue[1] = hasValueCorrectFormat(valueToTest, 1) ? valueToTest[1] : minimalValue;
    if (valueToTest?.length > 2) {
        for (let i=2; i<valueToTest.length; i++) {
            if (!hasValueCorrectFormat(valueToTest, i)) {
                returnValue[i] = minimalValue;
            } else {
                returnValue[i] = valueToTest;
            }
        }
    }
    return returnValue;
};

export const useReactiveCapabilityCurveTableValues = ({
    id,
    tableHeadersIds,
    Field,
    inputForm,
    defaultValues, // format : [{p:"", qminP:"", qmaxP:""}, {p:"", qminP:"", qmaxP:""}]
    isReactiveCapabilityCurveOn,
    disabled = false,
}) => {

    const [values, setValues] = useState(enforceMinimumValues(defaultValues));
    const classes = useStyles();

    /*const checkValues = useCallback(() => {
        console.error("defaultValues = ", defaultValues);
        if (defaultValues !== undefined && defaultValues.length > 0) {
            setValues([...defaultValues]);
        } else {
            setValues([]);
            handleAddValue();
        }
    }, [defaultValues, handleAddValue]);

    useEffect(() => {
        checkValues();
    }, [checkValues]);*/

    const handleDeleteItem = useCallback(
        (index) => {
            setValues((oldValues) => {
                let newValues = [...oldValues];
                newValues.splice(index, 1);
                return newValues;
            });
            inputForm.reset();
        },
        [inputForm]
    );

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => [...oldValues, {}]);
    }, []);

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    /*useEffect(() => { // TODO CHARLY Surveiller cette fonction
        if (!isReactiveCapabilityCurveOn) {
            //TODO When isReactiveCapabilityCurveOn is false, the reactive capability curve component does not change
            // the validation of its values and they still required.
            // we update the validations of reactive capability curve values so they are not required any more.
            // is there a better way to do it ?
            function validate() {
                return !isReactiveCapabilityCurveOn;
            }

            values.forEach((value, index) => {
                inputForm.addValidation('P' + index, validate);
                inputForm.addValidation('QmaxP' + index, validate);
                inputForm.addValidation('QminP' + index, validate);
            });
        }
    }, [inputForm, values, isReactiveCapabilityCurveOn]);*/

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2} style={{backgroundColor: "#4d4751"}}>
                {tableHeadersIds.map((header) => (
                    <Grid key={header} item xs={3}>
                        <FormattedMessage id={header} />
                    </Grid>
                ))}

                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={3} item>
                        <Field
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            isFieldRequired={isReactiveCapabilityCurveOn}
                            disabled={disabled}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + idx}
                                onClick={() => handleDeleteItem(idx)}
                                disabled={disabled || idx === 0}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                        {idx === values.length - 1 && (
                            <Grid item xs={1}>
                                <IconButton
                                    className={classes.icon}
                                    key={id + idx}
                                    onClick={() => handleAddValue()}
                                    disabled={disabled}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                ))}
            </Grid>
        );
    }, [
        values,
        id,
        classes.icon,
        handleAddValue,
        handleDeleteItem,
        handleSetValue,
        inputForm,
        tableHeadersIds,
        isReactiveCapabilityCurveOn,
        disabled,
    ]);

    return [values, field];
};
