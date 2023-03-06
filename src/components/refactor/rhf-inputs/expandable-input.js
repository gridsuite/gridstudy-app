/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

// This component is used to display Array of objects
const ExpandableInput = ({
    name,
    Field, // Used to display each object of an array
    addButtonLabel,
    initialValue, // Initial value to display when adding a new entry to array
    //errors,
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
                <ErrorInput name={name} />
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

export default ExpandableInput;
