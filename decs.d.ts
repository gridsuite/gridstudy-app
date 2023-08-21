/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

declare module '@gridsuite/commons-ui' {
    import { CaseImportParameters } from 'services/network-conversion';
    import { TextFieldProps } from '@mui/material';

    type TextFieldVariant = Pick<TextFieldProps, 'variant'>;

    interface FlatParametersProps {
        paramsAsArray: CaseImportParameters[];
        initValues: Map<string, string>;
        onChange: (paramName: string, value: any, isEdit: boolean) => void;
        variant?: TextFieldVariant;
        showSeparator?: boolean;
    }

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

    export const FlatParameters: FunctionComponent<FlatParametersProps>;
    export function useSnackMessage(): UseSnackMessageReturn;
}
