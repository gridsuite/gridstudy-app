import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import { FormattedMessage } from 'react-intl';
import { useStyles } from './sensi-parameters-selector';

export const useExpandableSensitivityFactors = ({
    id,
    labelAddValue,
    Field,
    inputForm,
    isRequired,
    initialValues,
}) => {
    const classes = useStyles();
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
                                className={classes.deleteButton}
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
        classes.deleteButton,
        classes.emptyListError,
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
