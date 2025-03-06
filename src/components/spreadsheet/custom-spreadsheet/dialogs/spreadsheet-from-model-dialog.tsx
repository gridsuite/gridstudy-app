/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from '@mui/material';
import {
    CancelButton,
    CustomFormProvider,
    DirectoryItemsInput,
    ElementType,
    SubmitButton,
    TextInput,
    UseStateBooleanReturn,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { FormattedMessage } from 'react-intl';
import {
    SPREADSHEET_MODEL,
    SPREADSHEET_NAME,
    getSpreadsheetFromModelFormSchema,
    initialSpreadsheetFromModelForm,
} from '../custom-spreadsheet-form';
import { addNewSpreadsheet, mapColumnsDto } from '../custom-spreadsheet-utils';
import { getSpreadsheetModel } from 'services/study-config';
import { UUID } from 'crypto';
import { dialogStyles } from './styles';
import { ColumnDefinitionDto, SpreadsheetEquipmentType } from 'components/spreadsheet/config/spreadsheet.type';

interface SpreadsheetFromModelDialogProps {
    open: UseStateBooleanReturn;
}

/**
 * Dialog for creating a spreadsheet from an existing model
 */
export default function SpreadsheetFromModelDialog({ open }: Readonly<SpreadsheetFromModelDialogProps>) {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);

    const tablesNames = useMemo(() => tablesDefinitions.map((def) => def.name), [tablesDefinitions]);
    const formSchema = useMemo(() => getSpreadsheetFromModelFormSchema(tablesNames), [tablesNames]);

    const formMethods = useForm({
        defaultValues: initialSpreadsheetFromModelForm,
        resolver: yupResolver(formSchema),
    });

    const { handleSubmit, reset, setValue, getValues } = formMethods;

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
            const tabIndex = tablesDefinitions.length;
            const tabName = formData[SPREADSHEET_NAME];
            const modelId = formData[SPREADSHEET_MODEL][0].id;

            getSpreadsheetModel(modelId)
                .then((selectedModel: { columns: ColumnDefinitionDto[]; sheetType: SpreadsheetEquipmentType }) => {
                    const columns = mapColumnsDto(selectedModel.columns);

                    addNewSpreadsheet({
                        columns,
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
        [tablesDefinitions.length, spreadsheetsCollectionUuid, dispatch, snackError, open]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Dialog
                id="spreadsheet-model-dialog"
                open={open.value}
                onClose={open.setFalse}
                aria-labelledby="spreadsheet-model-dialog-title"
                PaperProps={{ sx: dialogStyles.dialogContent }}
            >
                <DialogTitle id="spreadsheet-model-dialog-title">
                    <FormattedMessage id="spreadsheet/create_new_spreadsheet/apply_spreadsheet_model" />
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2} direction="column">
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
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Grid container spacing={0.5}>
                        <Grid item xs>
                            <Box sx={dialogStyles.actionButtons}>
                                <CancelButton onClick={open.setFalse} />
                                <SubmitButton onClick={handleSubmit(onSubmit)} variant="outlined" />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </CustomFormProvider>
    );
}
