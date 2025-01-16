import { ChangeEvent, FunctionComponent, useCallback, useEffect } from 'react';
import { useDebounce } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl';
import { InputAdornment, TextFieldProps } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useController, useFormContext } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { UUID } from 'crypto';

interface UniqueCheckNameInputProps {
    name: string;
    label?: string;
    studyUuid: UUID | null;
    elementExists: (studyUuid: UUID, elementName: string) => Promise<boolean>;

    autoFocus?: boolean;
    onManualChangeCallback?: () => void;
    formProps?: Omit<
        TextFieldProps,
        'value' | 'onChange' | 'name' | 'label' | 'inputRef' | 'inputProps' | 'InputProps'
    >;
}

/**
 * Input component that constantly checks if the field's value is available or not
 */
export const UniqueCheckNameInput: FunctionComponent<UniqueCheckNameInputProps> = (props) => {
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

    // This is a trick to share the custom validation state among the form: while this error is present, we can't validate the form
    const isValidating = errors.root?.isValidating;

    const handleCheckName = useCallback(
        (value: string) => {
            if (value && props.studyUuid) {
                props
                    .elementExists(props.studyUuid, value)
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
                            message: 'rootNetworknameValidityCheckErrorMsg',
                        });
                        console.error(error?.message);
                    })
                    .finally(() => {
                        clearErrors('root.isValidating');
                    });
            }
        },
        [setError, clearErrors, props]
    );

    const debouncedHandleCheckName = useDebounce(handleCheckName, 700);

    // We have to use an useEffect because the name can change from outside of this component (e.g. when a case file is uploaded)
    useEffect(() => {
        // if the name is unchanged, we don't do custom validation
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
        }
    }, [debouncedHandleCheckName, setError, clearErrors, props.name, value, isDirty]);

    // Handle on user's change
    const handleManualChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
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
