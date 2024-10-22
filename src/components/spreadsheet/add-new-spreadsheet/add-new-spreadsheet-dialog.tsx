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
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import {
    getEmptySpreadsheetFormSchema,
    getSpreadsheetFromModelFormSchema,
    initialEmptySpreadsheetForm,
    initialSpreadsheetFromModelForm,
    SPREADSHEET_MODEL,
    SPREADSHEET_NAME,
} from './add-new-spreadsheet-form';
import { EQUIPMENT_TYPE_FIELD } from 'components/utils/field-constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { NEW_SPREADSHEET_CREATION_OPTIONS } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { updateTableDefinition } from 'redux/actions';
import { TABLES_DEFINITIONS } from '../utils/config-tables';
import { AppState } from 'redux/reducer';
import { getSpreadsheetModel } from 'services/explore';
import { FormattedMessage } from 'react-intl';
export type AddSpreadsheetConfigDialogProps = {
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

export default function AddSpreadsheetConfigDialog({
    open,
    selectedOption,
}: Readonly<AddSpreadsheetConfigDialogProps>) {
    const tablesDefinitionIndexes = useSelector((state: AppState) => state.tables.definitionIndexes);
    const tablesNames = useSelector((state: AppState) => state.tables.names);

    const emptySpreadsheetFormSchema = useMemo(() => getEmptySpreadsheetFormSchema(tablesNames), [tablesNames]);
    const spreadsheetFromModelFormSchema = useMemo(() => getSpreadsheetFromModelFormSchema(tablesNames), [tablesNames]);

    const shema: typeof emptySpreadsheetFormSchema | typeof spreadsheetFromModelFormSchema =
        selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id
            ? emptySpreadsheetFormSchema
            : spreadsheetFromModelFormSchema;

    const defaultFormValues =
        selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id
            ? initialEmptySpreadsheetForm
            : initialSpreadsheetFromModelForm;

    const formMethods = useForm<typeof defaultFormValues>({
        defaultValues: defaultFormValues,
        resolver: yupResolver(shema as any),
    });

    const dispatch = useDispatch();
    const { handleSubmit, reset } = formMethods;

    const onSubmit = useCallback(
        (newParams: any) => {
            if (selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id) {
                const equipmentType = newParams.equipmentType as keyof typeof TABLES_DEFINITIONS;
                const newTableDefinition = {
                    ...TABLES_DEFINITIONS[equipmentType],
                    name: newParams[SPREADSHEET_NAME],
                    index: tablesDefinitionIndexes.size,
                };
                dispatch(
                    updateTableDefinition(
                        'new' + tablesDefinitionIndexes.size + newParams.equipmentType,
                        newTableDefinition,
                        []
                    )
                );
            } else {
                getSpreadsheetModel(newParams[SPREADSHEET_MODEL][0].id).then(
                    (selectedModel: { customColumns: any; sheetType: keyof typeof TABLES_DEFINITIONS }) => {
                        const newTableDefinition = {
                            ...TABLES_DEFINITIONS[selectedModel.sheetType],
                            name: newParams[SPREADSHEET_NAME],
                            index: tablesDefinitionIndexes.size,
                            columns: [],
                        };
                        dispatch(
                            updateTableDefinition(
                                'new' + tablesDefinitionIndexes.size + newParams[SPREADSHEET_MODEL][0].name,
                                newTableDefinition,
                                selectedModel.customColumns
                            )
                        );
                    }
                );
            }
            open.setFalse();
        },

        [dispatch, open, selectedOption?.id, tablesDefinitionIndexes.size]
    );

    useEffect(() => {
        reset(initialEmptySpreadsheetForm);
    }, [open.value, reset]);

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
                    options={Object.values(EQUIPMENT_TYPES).map((equipmentType) => {
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
        <CustomFormProvider validationSchema={shema} {...formMethods}>
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
