/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useEffect,
} from 'react';
import { elementExists, useDebounce } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl';
import { InputAdornment, TextFieldProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useController, useFormContext } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { UUID } from 'crypto';

interface UniqueNameInputProps {
    name: string;
    label?: string;
    elementType: string;
    autoFocus?: boolean;
    onManualChangeCallback?: () => void;
    activeDirectory: UUID | null;
    formProps?: Omit<
        TextFieldProps,
        | 'value'
        | 'onChange'
        | 'name'
        | 'label'
        | 'inputRef'
        | 'inputProps'
        | 'InputProps'
    >;
}

/**
 * Input component that constantly check if the field's value is available or not
 */
export const UniqueNameInput: FunctionComponent<UniqueNameInputProps> = (
    props
) => {
    const {
        field: { onChange, onBlur, value, name, ref },
        fieldState: { error, isDirty },
    } = useController({
        name: props.name,
    });

    const {
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext();

    // This is a trick to share the custom validation state among the form : while this error is present, we can't validate the form
    const isValidating = errors.root?.isValidating;

    const handleCheckName = useCallback(
        (value: string) => {
            if (value && props.activeDirectory) {
                elementExists(props.activeDirectory, value, props.elementType)
                    .then((alreadyExist) => {
                        if (alreadyExist) {
                            setError(props.name, {
                                type: 'validate',
                                message: 'nameAlreadyUsed',
                            });
                        }
                    })
                    .catch((error) => {
                        setError(props.name, {
                            type: 'validate',
                            message: 'nameValidityCheckErrorMsg',
                        });
                        console.error(error?.message);
                    })
                    .finally(() => {
                        clearErrors('root.isValidating');
                    });
            }
        },
        [
            setError,
            clearErrors,
            props.activeDirectory,
            props.name,
            props.elementType,
        ]
    );

    const debouncedHandleCheckName = useDebounce(handleCheckName, 700);

    // We have to use an useEffect because the name can change from outside of this component (when we upload a case file for instance)
    useEffect(() => {
        // if the name is unchanged, we don't do custom validation
        if (!isDirty) {
            clearErrors(props.name);
            return;
        }
        const trimmedValue = value.trim();
        if (trimmedValue) {
            clearErrors(props.name);
            setError('root.isValidating', {
                type: 'validate',
                message: 'cantSubmitWhileValidating',
            });
            debouncedHandleCheckName(trimmedValue);
        } else {
            clearErrors('root.isValidating');
            setError(props.name, {
                type: 'validate',
                message: 'nameEmpty',
            });
        }
    }, [
        debouncedHandleCheckName,
        setError,
        clearErrors,
        props.name,
        value,
        isDirty,
    ]);

    // Handle on user's change
    const handleManualChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onChange(e.target.value);
        props.onManualChangeCallback && props.onManualChangeCallback();
    };

    const translatedLabel = <FormattedMessage id={props.label} />;

    const translatedError = error && <FormattedMessage id={error.message} />;

    const showOk = value?.trim() && !isValidating && !error;
    const endAdornment = (
        <InputAdornment position="end">
            {isValidating && <CircularProgress size="1rem" />}
            {showOk && <CheckIcon style={{ color: 'green' }} />}
        </InputAdornment>
    );

    return (
        <TextField
            onChange={handleManualChange}
            onBlur={onBlur}
            value={value}
            name={name}
            inputRef={ref}
            label={translatedLabel}
            type="text"
            autoFocus={props.autoFocus}
            margin="dense"
            fullWidth
            error={!!error}
            helperText={translatedError}
            InputProps={{ endAdornment: endAdornment }}
            {...props.formProps}
        />
    );
};
