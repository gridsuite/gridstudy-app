declare module '@gridsuite/commons-ui' {
    import { CaseImportParameters } from 'services/network-conversion';

    type TextFieldVariants = 'outlined' | 'standard' | 'filled';

    interface FlatParametersProps {
        paramsAsArray: CaseImportParameters[];
        initValues: Map<string, string>;
        onChange: (paramName: string, value: any, isEdit: boolean) => void;
        variant?: TextFieldVariants;
        showSeparator?: boolean;
    }

    export const FlatParameters: FunctionComponent<FlatParametersProps>;
}
