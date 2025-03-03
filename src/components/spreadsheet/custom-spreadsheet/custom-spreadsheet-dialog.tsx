/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, SxProps, Theme } from '@mui/material';
import {
    CancelButton,
    CustomFormProvider,
    DirectoryItemsInput,
    ElementType,
    SelectInput,
    SubmitButton,
    TextInput,
    useSnackMessage,
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getEmptySpreadsheetFormSchema,
    getSpreadsheetFromModelFormSchema,
    initialEmptySpreadsheetForm,
    initialSpreadsheetFromModelForm,
    SPREADSHEET_MODEL,
    SPREADSHEET_NAME,
} from './custom-spreadsheet-form';
import { EQUIPMENT_TYPE_FIELD } from 'components/utils/field-constants';
import { NEW_SPREADSHEET_CREATION_OPTIONS } from '../constants';
import { useDispatch, useSelector } from 'react-redux';
import { TABLES_TYPES } from '../config/tables-types';
import { AppState } from 'redux/reducer';
import { FormattedMessage } from 'react-intl';
import yup from 'components/utils/yup-config';
import { getSpreadsheetModel } from 'services/study-config';
import type { ColumnDefinitionDto, SpreadsheetEquipmentType } from '../config/spreadsheet.type';
import { COLUMN_DEPENDENCIES } from '../custom-columns/custom-columns-form';
import { UUID } from 'crypto';
import { addNewSpreadsheet } from './custom-spreadsheet-utils';

export type CustomSpreadsheetConfigDialogProps = {
    open: UseStateBooleanReturn;
    selectedOption: { id: string; label: string } | undefined;
};

const styles = {
    dialogContent: {
        width: '20%',
        height: '30%',
        maxWidth: 'none',
        margin: 'auto',
    },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
} as const satisfies Record<string, SxProps<Theme>>;

export default function CustomSpreadsheetConfigDialog({
    open,
    selectedOption,
}: Readonly<CustomSpreadsheetConfigDialogProps>) {
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);
    const tablesNames = useMemo(() => tablesDefinitions.map((def) => def.name), [tablesDefinitions]);
    const emptySpreadsheetFormSchema = useMemo(() => getEmptySpreadsheetFormSchema(tablesNames), [tablesNames]);
    const spreadsheetFromModelFormSchema = useMemo(() => getSpreadsheetFromModelFormSchema(tablesNames), [tablesNames]);

    const schema: typeof emptySpreadsheetFormSchema | typeof spreadsheetFromModelFormSchema =
        selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id
            ? emptySpreadsheetFormSchema
            : spreadsheetFromModelFormSchema;

    const defaultFormValues =
        selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id
            ? initialEmptySpreadsheetForm
            : initialSpreadsheetFromModelForm;

    const formMethods = useForm<typeof defaultFormValues>({
        defaultValues: defaultFormValues,
        resolver: yupResolver(schema as yup.ObjectSchema<typeof defaultFormValues>),
    });

    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const { handleSubmit, reset, setValue, getValues } = formMethods;

    const onSubmit = useCallback(
        (newParams: any) => {
            const isCreatingEmptySpreadsheet = selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id;
            const tabIndex = tablesDefinitions.length;
            const tabName = newParams[SPREADSHEET_NAME];
            const equipmentType = newParams.equipmentType as SpreadsheetEquipmentType;

            if (isCreatingEmptySpreadsheet) {
                addNewSpreadsheet({
                    columns: [],
                    sheetType: equipmentType,
                    tabIndex,
                    tabName,
                    spreadsheetsCollectionUuid: spreadsheetsCollectionUuid as UUID,
                    dispatch,
                    snackError,
                    open,
                });
            } else {
                getSpreadsheetModel(newParams[SPREADSHEET_MODEL][0].id)
                    .then((selectedModel: { columns: ColumnDefinitionDto[]; sheetType: SpreadsheetEquipmentType }) => {
                        const columns = selectedModel.columns.map((col) => ({
                            ...col,
                            [COLUMN_DEPENDENCIES]: col.dependencies?.length ? JSON.parse(col.dependencies) : undefined,
                        }));
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
                        open.setFalse();
                    });
            }
        },
        [selectedOption?.id, open, tablesDefinitions.length, spreadsheetsCollectionUuid, dispatch, snackError]
    );

    useEffect(() => {
        reset(defaultFormValues);
    }, [defaultFormValues, open.value, reset]);

    const watchSpreadSheetModel = useWatch({
        control: formMethods.control,
        name: SPREADSHEET_MODEL,
    });

    useEffect(() => {
        const currentSpreadsheetName = getValues(SPREADSHEET_NAME);
        if (watchSpreadSheetModel?.length > 0 && currentSpreadsheetName?.length === 0) {
            setValue(SPREADSHEET_NAME, watchSpreadSheetModel[0].name);
        }
    }, [watchSpreadSheetModel, setValue, getValues]);

    const addEmptySpreadsheetConfigContent = (
        <Grid container spacing={2} direction="column">
            <Grid item xs>
                <TextInput
                    name={SPREADSHEET_NAME}
                    label={'spreadsheet/create_new_spreadsheet/spreadsheet_name'}
                    formProps={{ autoFocus: true }}
                />
            </Grid>
            <Grid item xs>
                <SelectInput
                    options={Object.values(TABLES_TYPES).map((equipmentType) => {
                        return { id: equipmentType, label: equipmentType };
                    })}
                    name={EQUIPMENT_TYPE_FIELD}
                    label={'spreadsheet/create_new_spreadsheet/equipment_type'}
                    size={'small'}
                />
            </Grid>
        </Grid>
    );

    const addSpreadsheetFromModelContent = (
        <Grid container spacing={2} direction="column">
            <Grid item xs>
                <TextInput
                    name={SPREADSHEET_NAME}
                    label={'spreadsheet/create_new_spreadsheet/spreadsheet_name'}
                    formProps={{ autoFocus: true }}
                />
            </Grid>
            <Grid item xs>
                <DirectoryItemsInput
                    name={SPREADSHEET_MODEL}
                    elementType={ElementType.SPREADSHEET_CONFIG}
                    titleId={'spreadsheet/create_new_spreadsheet/select_spreadsheet_model'}
                    label={'spreadsheet/create_new_spreadsheet/select_spreadsheet_model'}
                />
            </Grid>
        </Grid>
    );

    const content =
        selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id
            ? addEmptySpreadsheetConfigContent
            : addSpreadsheetFromModelContent;
    return (
        <CustomFormProvider validationSchema={schema} {...formMethods}>
            <Dialog
                id="emty-spreadsheet-dialog"
                open={open.value}
                onClose={open.setFalse}
                aria-labelledby="empty-spreadsheet-dialog-title"
                PaperProps={{ sx: styles.dialogContent }}
            >
                <DialogTitle id="empty-spreadsheet-dialog-title">
                    {selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id ? (
                        <FormattedMessage id="spreadsheet/create_new_spreadsheet/create_empty_spreadsheet" />
                    ) : (
                        <FormattedMessage id="spreadsheet/create_new_spreadsheet/apply_spreadsheet_model" />
                    )}
                </DialogTitle>
                <DialogContent dividers>{content}</DialogContent>
                <DialogActions>
                    <Grid container spacing={0.5}>
                        <Grid item xs>
                            <Box sx={styles.actionButtons}>
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
