import { useFieldArray } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useStyles } from '../../dialogs/dialogUtils';

const ExpandableValuesInput = ({ name, Field, labelAddValue }) => {
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
            {values.map((value, idx) => (
                <Grid key={value.id} container spacing={2} item>
                    <Field id={name} index={idx}/>
                    <Grid item xs={1}>
                        <IconButton
                            className={classes.icon}
                            key={value.id}
                            onClick={remove}
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
                    onClick={append}
                >
                    <FormattedMessage id={labelAddValue} />
                </Button>
            </span>
        </Grid>
    );
};

export default ExpandableValuesInput;
