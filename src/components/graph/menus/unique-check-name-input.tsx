/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeEvent, useCallback, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { InputAdornment, TextFieldProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useController, useFormContext } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { UUID } from 'crypto';
import { useDebounce } from '@gridsuite/commons-ui';

export interface UniqueCheckNameInputProps {
    name: string;
    label?: string;
    studyUuid: UUID | null;
    autoFocus?: boolean;
    onManualChangeCallback?: () => void;
    formProps?: Omit<
        TextFieldProps,
        'value' | 'onChange' | 'name' | 'label' | 'inputRef' | 'inputProps' | 'InputProps'
    >;
    elementExists: (studyUuid: UUID, elementName: string) => Promise<boolean>;
}

/**
 * Input component that constantly check if the field's value is available or not
 */
export function UniqueCheckNameInput({
    name,
    label,
    studyUuid,
    autoFocus,
    onManualChangeCallback,
    formProps,
    elementExists,
}: Readonly<UniqueCheckNameInputProps>) {
    const {
        field: { onChange, onBlur, value, ref },
        fieldState: { error, isDirty },
    } = useController({
        name,
    });

    const {
        setError,
        clearErrors,
        trigger,
        formState: { errors },
    } = useFormContext();

    // This is a trick to share the custom validation state among the form : while this error is present, we can't validate the form
    const isValidating = errors.root?.isValidating;

    const handleCheckName = useCallback(
        (nameValue: string) => {
            console.log('here ',nameValue)
            if (nameValue && studyUuid) {
                elementExists?.(studyUuid, nameValue)
                    .then((alreadyExist) => {
                        if (alreadyExist) {
                            setError(name, {
                                type: 'validate',
                                message: 'nameAlreadyUsed',
                            });
                        }
                    })
                    .catch((e) => {
                        setError(name, {
                            type: 'validate',
                            message: 'rootNetworknameValidityCheckErrorMsg',
                        });
                        console.error(e?.message);
                    })
                    .finally(() => {
                        clearErrors('root.isValidating');
                        /* force form to validate, otherwise form
                        will remain invalid (setError('root.isValidating') invalid form and clearErrors does not affect form isValid state :
                        see documentation : https://react-hook-form.com/docs/useform/clearerrors) */
                        trigger('root.isValidating');
                    });
            }
        },
        [setError, clearErrors, name, elementExists, trigger, studyUuid]
    );

    const debouncedHandleCheckName = useDebounce(handleCheckName, 700);

    // We have to use an useEffect because the name can change from outside of this component (when we upload a case file for instance)
    useEffect(() => {
        const trimmedValue = value.trim();

        // if the name is unchanged, we don't do custom validation
        if (!isDirty) {
            clearErrors(name);
            return;
        }
        if (trimmedValue) {
            clearErrors(name);
            setError('root.isValidating', {
                type: 'validate',
                message: 'cantSubmitWhileValidating',
            });
            debouncedHandleCheckName(trimmedValue);
        } else {
            clearErrors('root.isValidating');
        }
    }, [debouncedHandleCheckName, setError, clearErrors, name, value, isDirty]);

    // Handle on user's change
    const handleManualChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
        onManualChangeCallback?.();
    };

    const translatedLabel = <FormattedMessage id={label} />;

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
            autoFocus={autoFocus}
            margin="dense"
            fullWidth
            error={!!error}
            helperText={translatedError}
            InputProps={{ endAdornment }}
            {...formProps}
        />
    );
}
