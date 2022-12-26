/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useStyles } from '../dialogUtils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import { FormattedMessage } from 'react-intl';

export const useExpandableValues = ({
    id,
    labelAddValue,
    Field,
    inputForm,
    defaultValues,
    fieldProps,
    validateItem,
    isRequired,
}) => {
    const classes = useStyles();
    const [values, setValues] = useState([]);
    const [errors, setErrors] = useState();
    const [itemListError, setItemListError] = useState({
        show: false,
        type: '',
    });

    useEffect(() => {
        if (defaultValues) {
            console.log('testing default : ', defaultValues);
            setValues([...defaultValues]);
        } else {
            setValues([]);
        }
    }, [defaultValues]);

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

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => {
            console.log('testing add : ', [...oldValues, {}])
            return [...oldValues, {}];
        });
        setItemListError({
            show: false,
            type: '',
        });
    }, []);

    useEffect(() => {
        function validation() {
            const res = validateItem(values);
            setErrors(res);
            if (res?.size !== 0) {
                return false;
            } else if (isRequired && values?.length === 0) {
                setItemListError({
                    show: true,
                    type: 'empty',
                });
                return false;
            }
            setItemListError({
                show: false,
                type: '',
            });

            return true;
        }

        inputForm.addValidation(id, validation);
    }, [inputForm, values, id, validateItem, isRequired]);

    const isEmptyListError =
        itemListError.show && itemListError.type === 'empty';

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={2} item>
                        <Field
                            fieldProps={fieldProps}
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            errors={errors?.get(idx)}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={id + idx}
                                onClick={() => handleDeleteItem(idx)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Button
                            fullWidth
                            className={classes.button}
                            startIcon={<AddIcon />}
                            onClick={handleAddValue}
                        >
                            <FormattedMessage id={labelAddValue} />
                        </Button>
                        {isEmptyListError && (
                            <div className={classes.emptyListError}>
                                <FormattedMessage id={'EmptyList/' + id} />
                            </div>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        );
    }, [
        values,
        classes.button,
        classes.emptyListError,
        classes.icon,
        handleAddValue,
        labelAddValue,
        isEmptyListError,
        id,
        fieldProps,
        handleSetValue,
        inputForm,
        errors,
        handleDeleteItem,
    ]);

    return [values, field];
};
