/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import clsx from 'clsx';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import { OverflowableText, useSnackMessage } from '@gridsuite/commons-ui';
import React, { useCallback, useState } from 'react';
import { useStyles } from '../../dialogs/dialogUtils';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';
import ErrorInput from './error-inputs/error-input';
import MidFormError from './error-inputs/mid-form-error';
import { RawReadOnlyInput } from './read-only/raw-read-only-input';
import { FieldLabel } from '../inputs/hooks-helpers';
import { isFieldRequired } from '../utils';

const ChipItemsInput = ({ label, name, hideErrorMessage }) => {
    const [textEntered, setTextEntered] = useState('');
    const { snackError } = useSnackMessage();

    const classes = useStyles();
    const {
        fields: elements,
        append,
        remove,
    } = useFieldArray({
        name,
    });

    const { validationSchema, getValues } = useFormContext();

    const {
        fieldState: { error },
    } = useController({
        name,
    });

    const addItem = useCallback(
        (value) => {
            // check if element is already present
            if (getValues(name).find((v) => v === value) !== undefined) {
                snackError({
                    messageTxt: '',
                    headerId: 'ElementAlreadyUsed',
                });
            } else {
                append(value);
            }
        },
        [append, getValues, snackError, name]
    );

    const keyPress = (e) => {
        if (e.keyCode === 13 && textEntered.length > 0) {
            addItem(textEntered);
            setTextEntered('');
        }
    };

    const handleChange = (e) => {
        setTextEntered(e.target.value);
    };

    return (
        <>
            <FormControl
                className={clsx(classes.formChipItems1, {
                    [classes.formChipItemsError]: error?.message,
                })}
                error={!!error?.message}
            >
                {elements?.length === 0 && label && (
                    <FieldLabel
                        label={label}
                        optional={
                            !isFieldRequired(
                                name,
                                validationSchema,
                                getValues()
                            )
                        }
                    />
                )}
                {elements?.length > 0 && (
                    <FormControl className={classes.formChipItems2}>
                        {elements.map((item, index) => (
                            <Chip
                                key={item.id}
                                size="small"
                                onDelete={() => {
                                    remove(index);
                                }}
                                label={
                                    <OverflowableText
                                        text={
                                            <RawReadOnlyInput
                                                name={`${name}.${index}`}
                                            />
                                        }
                                        style={{ width: '100%' }}
                                    />
                                }
                            />
                        ))}
                    </FormControl>
                )}

                <TextField
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        style: {
                            height: '30px',
                            left: '5px',
                        },
                    }}
                    value={textEntered}
                    onKeyDown={keyPress}
                    onChange={handleChange}
                ></TextField>
            </FormControl>
            {!hideErrorMessage && (
                <ErrorInput name={name} InputField={MidFormError} />
            )}
        </>
    );
};

export default ChipItemsInput;
