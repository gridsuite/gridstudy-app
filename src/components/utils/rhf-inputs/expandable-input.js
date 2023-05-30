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
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/ControlPoint';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useStyles } from '../../dialogs/dialogUtils';
import ErrorInput from './error-inputs/error-input';
import MidFormError from './error-inputs/mid-form-error';

// This component is used to display Array of objects.
// We can manage 2 states for deletion:
// - only 1 state and 1 delete icon that removes the current line
// - a second state "mark for deletion" with a second icon: the line is not removed
// and we can cancel this mark to go back to normal state.
const ExpandableInput = ({
    name,
    Field, // Used to display each object of an array
    fieldProps, // Props to pass to Field
    addButtonLabel,
    initialValue, // Initial value to display when we add a new entry to array
    getDeletionMark = null,
    deleteCallback = null,
    alignItems = 'stretch', // default value for a flex container
    watchProps = true,
    disabled = false,
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
            {watchProps &&
                values.map((value, idx) => (
                    <Grid
                        key={value.id}
                        container
                        spacing={2}
                        item
                        alignItems={alignItems}
                    >
                        <Field name={name} index={idx} {...fieldProps} />
                        <Grid item xs={1}>
                            <IconButton
                                className={classes.icon}
                                key={value.id}
                                onClick={() => {
                                    if (deleteCallback) {
                                        if (deleteCallback(idx) === true) {
                                            remove(idx);
                                        }
                                    } else {
                                        remove(idx);
                                    }
                                }}
                            >
                                {getDeletionMark && getDeletionMark(idx) ? (
                                    <RestoreFromTrashIcon />
                                ) : (
                                    <DeleteIcon />
                                )}
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
            <span>
                <Button
                    disabled={disabled}
                    fullWidth
                    className={classes.button + ' ' + classes.paddingButton}
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
