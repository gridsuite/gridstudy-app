/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import {
    CustomMuiDialog,
    DescriptionField,
    FieldConstants,
    isObjectEmpty,
    useConfidentialityWarning,
    useSnackMessage,
} from '@gridsuite/commons-ui';

import yup from '../utils/yup-config';
import { AppState } from 'redux/reducer';

interface IFormData {
    [FieldConstants.CASE_NAME]: string;
    [FieldConstants.CASE_FILE]: File | null;
}

export interface CreateCaseDialogProps {
    onClose: (e?: unknown, nextSelectedDirectoryId?: string | null) => void;
    open: boolean;
}

const getCreateCaseDialogFormValidationDefaultValues = () => ({
    [FieldConstants.CASE_NAME]: '',
    [FieldConstants.CASE_FILE]: null,
});

const createCaseDialogFormValidationSchema = yup.object().shape({
    [FieldConstants.CASE_NAME]: yup.string().trim().required('nameEmpty'),
    [FieldConstants.CASE_FILE]: yup.mixed<File>().nullable().required(),
});
export default function CreateCaseDialog({ onClose, open }: Readonly<CreateCaseDialogProps>) {
    const { snackError } = useSnackMessage();
    const confidentialityWarningKey = useConfidentialityWarning();

    const createCaseFormMethods = useForm<IFormData>({
        defaultValues: getCreateCaseDialogFormValidationDefaultValues(),
        resolver: yupResolver<IFormData>(createCaseDialogFormValidationSchema),
    });

const {
    formState: { errors, isValid },
    getValues, // This should be destructured directly from formMethods
} = createCaseFormMethods;

     const isFormValid = isObjectEmpty(errors) && isValid && getValues(FieldConstants.CASE_FILE) !== null;

 

    const userId = useSelector((state: AppState) => state.user?.profile.sub);

    const handleCreateNewCase = ({ caseName, caseFile }: IFormData): void => {
        // @ts-expect-error TODO: manage null cases here
        createCase(caseName, description ?? '', caseFile, activeDirectory)
            .then(onClose)
            .catch((err: any) => {
                console.log('$$$$$');
            });
    };

    return (
        <CustomMuiDialog
            titleId="CreateRootNetwork"
            formSchema={createCaseDialogFormValidationSchema}
            formMethods={createCaseFormMethods}
            removeOptional
            open={open}
            onClose={onClose}
            onSave={handleCreateNewCase}
            disabledSave={!isFormValid}
            confirmationMessageKey={confidentialityWarningKey}
        >
            <Grid container spacing={2} marginTop="auto" direction="column">
                <Grid item>
                    {/* <PrefilledNameInput
                        name={FieldConstants.CASE_NAME}
                        label="nameProperty"
                        elementType={ElementType.CASE}
                    /> */}
                </Grid>
                <Grid item>
                    <DescriptionField />
                </Grid>
            </Grid>
            {/* <ErrorInput name={FieldConstants.CASE_FILE} InputField={FieldErrorAlert} /> */}
            {/* <UploadNewCase /> */}
        </CustomMuiDialog>
    );
}
