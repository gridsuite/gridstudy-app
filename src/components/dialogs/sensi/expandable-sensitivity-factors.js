﻿/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import { FormattedMessage } from 'react-intl';
import { styles } from './sensi-parameters-selector';
import { Box } from '@mui/system';

export const useExpandableSensitivityFactors = ({
    id,
    labelAddValue,
    Field,
    inputForm,
    isRequired,
    initialValues,
}) => {
    const [values, setValues] = useState([]);
    const [errors, setErrors] = useState();
    const [itemListError, setItemListError] = useState({
        show: false,
        type: '',
    });

    useEffect(() => {
        if (initialValues !== null) {
            setValues(initialValues);
        }
    }, [initialValues]);

    const handleDeleteItem = useCallback((index) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues.splice(index, 1);
            return newValues;
        });
    }, []);

    const handleSetValue = useCallback((index, newValue) => {
        setValues((oldValues) => {
            let newValues = [...oldValues];
            newValues[index] = newValue;
            return newValues;
        });
    }, []);

    const handleAddValue = useCallback(() => {
        setValues((oldValues) => [...oldValues, {}]);
        setItemListError({
            show: false,
            type: '',
        });
    }, []);

    useEffect(() => {
        function validation() {
            setErrors(new Map());
            setItemListError({
                show: false,
                type: '',
            });
            return true;
        }

        inputForm.addValidation(id, validation);
    }, [inputForm, values, id, isRequired]);

    const isEmptyListError =
        itemListError.show && itemListError.type === 'empty';

    const field = useMemo(() => {
        return (
            <Grid item container spacing={2}>
                {values.map((value, idx) => (
                    <Grid key={id + idx} container spacing={2} item>
                        <Field
                            defaultValue={value}
                            onChange={handleSetValue}
                            index={idx}
                            inputForm={inputForm}
                            errors={errors?.get(idx)}
                        />
                        <Grid item xs={1}>
                            <IconButton
                                sx={styles.deleteButton}
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
                            sx={styles.button}
                            startIcon={<AddIcon />}
                            onClick={handleAddValue}
                        >
                            <FormattedMessage id={labelAddValue} />
                        </Button>
                        {isEmptyListError && (
                            <Box sx={styles.emptyListError}>
                                <FormattedMessage id={'EmptyList/' + id} />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        );
    }, [
        values,
        handleAddValue,
        labelAddValue,
        isEmptyListError,
        id,
        handleSetValue,
        inputForm,
        errors,
        handleDeleteItem,
    ]);

    return [values, field];
};
