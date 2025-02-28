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
    RawReadOnlyInput,
    useCustomFormContext,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useState } from 'react';
import { useController, useFieldArray } from 'react-hook-form';
import { isFieldRequired } from '../utils';

interface ChipItemsInputProps {
    label?: string;
    name: string;
    hideErrorMessage: boolean;
}

const ChipItemsInput = ({ label, name, hideErrorMessage }: ChipItemsInputProps) => {
    const [textEntered, setTextEntered] = useState('');
    const { snackError } = useSnackMessage();

    const {
        fields: elements,
        append,
        remove,
    } = useFieldArray({
        name,
    });

    const { validationSchema, getValues } = useCustomFormContext();

    const {
        fieldState: { error },
    } = useController({
        name,
    });

    const addItem = useCallback(
        (value: string) => {
            // check if element is already present
            if (getValues(name).find((v: string) => v === value) !== undefined) {
                snackError({
                    messageTxt: '',
                    headerId: 'directory_items_input/ElementAlreadyUsed',
                });
            } else {
                append(value);
            }
        },
        [append, getValues, snackError, name]
    );

    const keyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                    <FieldLabel label={label} optional={!isFieldRequired(name, validationSchema, getValues())} />
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
                                        text={<RawReadOnlyInput name={`${name}.${index}`} />}
                                        sx={{ width: '100%' }}
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
            {!hideErrorMessage && <ErrorInput name={name} InputField={MidFormError} />}
        </>
    );
};

export default ChipItemsInput;
