/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Grid } from '@mui/material';
import {
    CustomFormProvider,
    DirectoryItemsInput,
    ElementType,
    TextInput,
    UseStateBooleanReturn,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import {
    SPREADSHEET_MODEL,
    SPREADSHEET_NAME,
    getSpreadsheetFromModelFormSchema,
    initialSpreadsheetFromModelForm,
} from './add-spreadsheet-form';
import { addNewSpreadsheet } from './add-spreadsheet-utils';
import { getSpreadsheetModel } from 'services/study-config';
import { UUID } from 'crypto';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { dialogStyles } from '../styles/styles';

interface AddSpreadsheetFromModelDialogProps {
    open: UseStateBooleanReturn;
}

/**
 * Dialog for creating a spreadsheet from an existing model
 */
export default function AddSpreadsheetFromModelDialog({
    open,
    ...dialogProps
}: Readonly<AddSpreadsheetFromModelDialogProps>) {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);

    const tablesNames = useMemo(() => tablesDefinitions.map((def) => def.name), [tablesDefinitions]);
    const formSchema = useMemo(() => getSpreadsheetFromModelFormSchema(tablesNames), [tablesNames]);

    const formMethods = useForm({
        defaultValues: initialSpreadsheetFromModelForm,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue, getValues } = formMethods;

    // Reset form when dialog opens
    useEffect(() => {
        reset(initialSpreadsheetFromModelForm);
    }, [open.value, reset]);

    const watchSpreadSheetModel = useWatch({
        control: formMethods.control,
        name: SPREADSHEET_MODEL,
    });

    // Auto-fill spreadsheet name when model is selected
    useEffect(() => {
        const currentSpreadsheetName = getValues(SPREADSHEET_NAME);
        if (watchSpreadSheetModel?.length > 0 && currentSpreadsheetName?.length === 0) {
            setValue(SPREADSHEET_NAME, watchSpreadSheetModel[0].name);
        }
    }, [watchSpreadSheetModel, setValue, getValues]);

    const onSubmit = useCallback(
        (formData: any) => {
            if (!studyUuid) {
                return;
            }
            const tabIndex = tablesDefinitions.length;
            const tabName = formData[SPREADSHEET_NAME];
            const modelId = formData[SPREADSHEET_MODEL][0].id;

            getSpreadsheetModel(modelId)
                .then((selectedModel) => {
                    addNewSpreadsheet({
                        studyUuid,
                        columns: selectedModel.columns,
                        globalFilters: selectedModel.globalFilters,
                        sheetType: selectedModel.sheetType,
                        tabIndex,
                        tabName,
                        spreadsheetsCollectionUuid: spreadsheetsCollectionUuid as UUID,
                        dispatch,
                        snackError,
                        open,
                    });
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error,
                        headerId: 'spreadsheet/create_new_spreadsheet/error_loading_model',
                    });
                });
            open.setFalse();
        },
        [studyUuid, tablesDefinitions.length, open, spreadsheetsCollectionUuid, dispatch, snackError]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                titleId={'spreadsheet/create_new_spreadsheet/apply_spreadsheet_model'}
                open={open.value}
                onClose={open.setFalse}
                onSave={onSubmit}
                onClear={() => null}
                PaperProps={{ sx: dialogStyles.dialogContent }}
                {...dialogProps}
            >
                <Grid container spacing={2} direction="column" marginTop="auto">
                    <Grid item xs>
                        <TextInput
                            name={SPREADSHEET_NAME}
                            label="spreadsheet/create_new_spreadsheet/spreadsheet_name"
                            formProps={{ autoFocus: true }}
                        />
                    </Grid>
                    <Grid item xs>
                        <DirectoryItemsInput
                            name={SPREADSHEET_MODEL}
                            elementType={ElementType.SPREADSHEET_CONFIG}
                            titleId="spreadsheet/create_new_spreadsheet/select_spreadsheet_model"
                            label="spreadsheet/create_new_spreadsheet/select_spreadsheet_model"
                            allowMultiSelect={false}
                        />
                    </Grid>
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
