/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import {
    ErrorInput,
    FieldLabel,
    MidFormError,
    OverflowableText,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import React, { useCallback, useState } from 'react';
import { useController, useFieldArray, useFormContext } from 'react-hook-form';
import { RawReadOnlyInput } from './read-only/raw-read-only-input';
import { isFieldRequired } from '../utils';

const ChipItemsInput = ({ label, name, hideErrorMessage }) => {
    const [textEntered, setTextEntered] = useState('');
    const { snackError } = useSnackMessage();

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

    const onBlur = () => {
        if (textEntered.length > 0) {
            addItem(textEntered);
            setTextEntered('');
        }
    };

    const handleChange = (e) => {
        setTextEntered(e.target.value);
    };

    const styles = {
        chipContainer: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            flexDirection: 'row',
            border: '2px solid lightgray',
            borderRadius: '4px',
            overflow: 'hidden',
            borderColor: error?.message ? 'error.main' : null,
        },
        chipItem: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            flexDirection: 'row',
            marginTop: 0,
            padding: 1,
            overflow: 'hidden',
        },
    };

    return (
        <>
            <FormControl sx={styles.chipContainer} error={!!error?.message}>
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
                    <FormControl sx={styles.chipItem}>
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
                            marginTop: '5px',
                            height: '30px',
                            marginLeft: '10px',
                        },
                    }}
                    value={textEntered}
                    onKeyDown={keyPress}
                    onChange={handleChange}
                    onBlur={onBlur}
                ></TextField>
            </FormControl>
            {!hideErrorMessage && (
                <ErrorInput name={name} InputField={MidFormError} />
            )}
        </>
    );
};

export default ChipItemsInput;
