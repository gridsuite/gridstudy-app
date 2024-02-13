declare module '@gridsuite/commons-ui' {
    import { FunctionComponent, ReactElement } from 'react';
    import { AutocompleteProps } from '@mui/material/Autocomplete/Autocomplete';
    import { ButtonProps, RadioGroupProps, SxProps, TextFieldProps } from '@mui/material';
    import { CaseImportParameters } from 'services/network-conversion';

    export const DARK_THEME: String, LIGHT_THEME: String;

    interface SnackInputs {
        messageTxt?: string;
        messageId?: string;
        messageValues?: { [key: string]: string };
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
                string | { id: string; label: string },
                boolean | undefined,
                boolean | undefined,
                boolean | undefined
            >,
            // we already defined them in our custom Autocomplete
            'value' | 'onChange' | 'renderInput'
        > {
        name: string;
        options: ({ id: string; label: string } | string)[];
        label?: string;
        outputTransform?: (
            value: { id: string; label: string } | string
        ) => { id: string; label: string } | string;
        inputTransform?: (
            value: { id: string; label: string } | string
        ) => { id: string; label: string } | string;
        readOnly?: boolean;
        previousValue?: string;
        allowNewValue?: boolean;
        onChangeCallback?: () => void;
        getOptionLabel?: (
            rt: string | { id: string; label: string }
        ) => string | null;
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

    export const MidFormError: FunctionComponent;

    export const FieldErrorAlert: FunctionComponent;

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

    export const IntegerInput: FunctionComponent<
        Omit<
            TextInputProps,
            'outputTransform' | 'inputTransform' | 'acceptValue' // already defined in IntegerInput
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

    interface SwitchInputProps {
        name: string;
        label?: string;
        formProps?: Omit<SwitchInputProps, 'disabled'>;
    }

    export const SwitchInput: FunctionComponent<SwitchInputProps>;

    export const SubmitButton: FunctionComponent<ButtonProps>;

    export const CancelButton: FunctionComponent<ButtonProps>;

    export const FieldLabel: FunctionComponent<{
        label: string;
        optional?: boolean;
        values?: any; // it's for values from https://formatjs.io/docs/react-intl/components/#formattedmessage
    }>;

    interface FlatParametersProps extends Pick<TextFieldProps, 'variant'> {
        paramsAsArray: CaseImportParameters[];
        initValues: Record<string, any>;
        onChange: (paramName: string, value: any, isEdit: boolean) => void;
        showSeparator?: boolean;
    }

    export const FlatParameters: FunctionComponent<FlatParametersProps>;

    export function useDebounce(
        debouncedFunction: (...args: any[]) => void,
        debounceDelay: number
    ): (...args: any[]) => void;

    export const elementType = {
        DIRECTORY: 'DIRECTORY',
        STUDY: 'STUDY',
        FILTER: 'FILTER',
        MODIFICATION: 'MODIFICATION',
        CONTINGENCY_LIST: 'CONTINGENCY_LIST',
        VOLTAGE_INIT_PARAMETERS: 'VOLTAGE_INIT_PARAMETERS',
        SECURITY_ANALYSIS_PARAMETERS: 'SECURITY_ANALYSIS_PARAMETERS',
    };

    interface OverflowableTextProps {
        sx?: SxProps;
        text?: string | ReactElement;
    }

    export const OverflowableText: FunctionComponent<OverflowableTextProps>;

    interface CheckboxInputProps {
        name: string;
        label?: string;
        formProps?: Omit<CheckboxInputProps, 'disabled'>;
    }

    export const CheckboxInput: FunctionComponent<CheckboxInputProps>;
}
