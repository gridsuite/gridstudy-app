declare module '@gridsuite/commons-ui' {
    import { FunctionComponent, ReactElement } from 'react';
    import { AutocompleteProps } from '@mui/material/Autocomplete/Autocomplete';
    import { RadioGroupProps, TextFieldProps } from '@mui/material';

    interface SnackInputs {
        messageTxt?: string;
        messageId?: string;
        messageValues?: string[];
        headerTxt?: string;
        headerId?: string;
        headerValues?: string[];
    }

    interface UseSnackMessageReturn {
        snackError: (snackInputs: SnackInputs) => void;
        snackWarning: (snackInputs: SnackInputs) => void;
        snackInfo: (snackInputs: SnackInputs) => void;
    }

    export function useSnackMessage(): UseSnackMessageReturn;

    type Input = string | number;
    type Options = Array<{
        id: string;
        label: string;
    }>;

    interface AutocompleteInputProps
        extends Omit<
            AutocompleteProps<
                string,
                boolean | undefined,
                boolean | undefined,
                boolean | undefined
            >,
            // we already defined them in our custom Autocomplete
            'value' | 'onChange' | 'renderInput'
        > {
        name: string;
        label?: string;
        outputTransform?: (value: string) => string;
        inputTransform?: (value: string) => string;
        readOnly?: boolean;
        previousValue?: string;
        allowNewValue?: boolean;
        onChangeCallback?: () => void;
        formProps?: Omit<
            TextFieldProps,
            'value' | 'onChange' | 'inputRef' | 'inputProps' | 'InputProps'
        >;
    }

    export const AutocompleteInput: FunctionComponent<AutocompleteInputProps>;

    interface ErrorInputProps {
        name: string;
        InputField?: FunctionComponent;
    }

    export const ErrorInput: FunctionComponent<ErrorInputProps>;

    export const SelectInput: FunctionComponent<
        Omit<
            AutocompleteInputProps,
            'outputTransform' | 'inputTransform' | 'readOnly' | 'getOptionLabel' // already defined in SelectInput
        >
    >;

    interface TextFieldWithAdornmentProps extends TextFieldProps {
        // variant already included in TextFieldProps
        value: Input; // we override the default type of TextFieldProps which is unknown
        adornmentPosition: string;
        adornmentText: string;
        handleClearValue?: () => void;
    }

    interface TextInputProps {
        name: string;
        label?: string;
        labelValues?: any; // it's for values from https://formatjs.io/docs/react-intl/components/#formattedmessage
        id?: string;
        adornment?: {
            position: string;
            text: string;
        };
        customAdornment?: ReactElement;
        outputTransform?: (value: string) => Input;
        inputTransform?: (value: Input) => string;
        acceptValue?: (value: string) => boolean;
        previousValue?: Input;
        clearable?: boolean;
        formProps?: Omit<
            TextFieldWithAdornmentProps | TextFieldProps,
            'value' | 'onChange' | 'inputRef' | 'inputProps' | 'InputProps'
        >;
    }

    export const TextInput: FunctionComponent<TextInputProps>;

    export const FloatInput: FunctionComponent<
        Omit<
            TextInputProps,
            'outputTransform' | 'inputTransform' | 'acceptValue' // already defined in FloatInput
        >
    >;

    interface RadioInputProps {
        name: string;
        label?: string;
        id?: string;
        options: Options;
        formProps?: Omit<RadioGroupProps, 'value' | 'onChange'>;
    }

    export const RadioInput: FunctionComponent<RadioInputProps>;

    export const SubmitButton: FunctionComponent<{
        onClick: () => void;
        disabled?: boolean;
    }>;

    export const FieldLabel: FunctionComponent<{
        label: string;
        optional?: boolean;
        values?: any; // it's for values from https://formatjs.io/docs/react-intl/components/#formattedmessage
    }>;
}
