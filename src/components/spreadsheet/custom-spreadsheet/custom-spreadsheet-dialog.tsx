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
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { NEW_SPREADSHEET_CREATION_OPTIONS } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { addFilterForNewSpreadsheet, addSortForNewSpreadsheet, updateTableDefinition } from 'appRedux/actions';
import { TABLES_DEFINITIONS } from '../utils/config-tables';
import { AppState } from 'appRedux/reducer';
import { FormattedMessage } from 'react-intl';
import yup from 'components/utils/yup-config';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { getSpreadsheetModel } from 'services/spreadsheet';
import { SortWay } from 'hooks/use-aggrid-sort';
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
        resolver: yupResolver(shema as yup.ObjectSchema<typeof defaultFormValues>),
    });

    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const { handleSubmit, reset, setValue, getValues } = formMethods;

    const onSubmit = useCallback(
        (newParams: any) => {
            if (selectedOption?.id === NEW_SPREADSHEET_CREATION_OPTIONS.EMPTY.id) {
                const equipmentType = newParams.equipmentType as keyof typeof TABLES_DEFINITIONS;
                const tabIndex = tablesDefinitionIndexes.size;
                const newTableDefinition = {
                    ...TABLES_DEFINITIONS[equipmentType],
                    name: newParams[SPREADSHEET_NAME],
                    index: tabIndex,
                    type: equipmentType + tabIndex, // we need to add tabIndex for now to avoid conflicts with existing tables for sorting and filtering
                };
                dispatch(updateTableDefinition('new' + tabIndex + newParams.equipmentType, newTableDefinition, []));
                dispatch(addFilterForNewSpreadsheet(equipmentType + tabIndex, []));
                dispatch(
                    addSortForNewSpreadsheet(equipmentType + tabIndex, [
                        {
                            colId: 'id',
                            sort: SortWay.ASC,
                        },
                    ])
                );
            } else {
                getSpreadsheetModel(newParams[SPREADSHEET_MODEL][0].id)
                    .then(
                        (selectedModel: {
                            customColumns: ColumnWithFormula[];
                            sheetType: keyof typeof TABLES_DEFINITIONS;
                        }) => {
                            const equipmentType = selectedModel.sheetType;
                            const tabIndex = tablesDefinitionIndexes.size;
                            const newTableDefinition = {
                                ...TABLES_DEFINITIONS[selectedModel.sheetType],
                                name: newParams[SPREADSHEET_NAME],
                                index: tablesDefinitionIndexes.size,
                                columns: [],
                                type: equipmentType + tabIndex, // we need to add tabIndex for now to avoid conflicts with existing tables for sorting and filtering
                            };
                            dispatch(
                                updateTableDefinition(
                                    'new' + tablesDefinitionIndexes.size + newParams[SPREADSHEET_MODEL][0].name,
                                    newTableDefinition,
                                    selectedModel.customColumns
                                )
                            );
                            dispatch(addFilterForNewSpreadsheet(equipmentType + tabIndex, []));
                            dispatch(
                                addSortForNewSpreadsheet(equipmentType + tabIndex, [
                                    {
                                        colId: 'ID',
                                        sort: SortWay.ASC,
                                    },
                                ])
                            );
                        }
                    )
                    .catch((error) => {
                        snackError({
                            messageTxt: error,
                            headerId: 'spreadsheet/create_new_spreadsheet/error_loading_model',
                        });
                    });
            }
            open.setFalse();
        },

        [dispatch, open, selectedOption?.id, snackError, tablesDefinitionIndexes.size]
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
