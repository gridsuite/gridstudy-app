import { useFieldArray } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useStyles } from '../../dialogs/dialogUtils';
import ErrorInput from './error-inputs/error-input';
import MidFormError from './error-inputs/mid-form-error';

const ExpandableValuesInput = ({
    name,
    Field,
    addButtonLabel,
    initialValue,
}) => {
    const classes = useStyles();
    const {
        fields: values,
        append,
        remove,
    } = useFieldArray({
        name: name,
    });

    return (
        <Grid item container spacing={2}>
            <Grid item xs={12}>
                <ErrorInput name={name} InputField={MidFormError} />
            </Grid>
            {values.map((value, idx) => (
                <Grid key={value.id} container spacing={2} item>
                    <Field name={name} index={idx} />
                    <Grid item xs={1}>
                        <IconButton
                            className={classes.icon}
                            key={value.id}
                            onClick={() => remove(idx)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <span>
                <Button
                    fullWidth
                    className={classes.button}
                    startIcon={<AddIcon />}
                    onClick={() => append(initialValue)}
                >
                    <FormattedMessage id={addButtonLabel} />
                </Button>
            </span>
        </Grid>
    );
};

export default ExpandableValuesInput;
