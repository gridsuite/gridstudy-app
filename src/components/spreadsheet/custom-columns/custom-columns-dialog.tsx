/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Link,
    SxProps,
    Theme,
    Typography,
} from '@mui/material';
import {
    CancelButton,
    CustomFormProvider,
    ExpandingTextField,
    MultipleAutocompleteInput,
    IntegerInput,
    SubmitButton,
    TextInput,
    UseStateBooleanReturn,
    AutocompleteInput,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm, UseFormSetError, useWatch } from 'react-hook-form';
import {
    COLUMN_DEPENDENCIES,
    COLUMN_ID,
    COLUMN_NAME,
    COLUMN_TYPE,
    CustomColumnForm,
    customColumnFormSchema,
    FORMULA,
    initialCustomColumnForm,
    PRECISION,
} from './custom-columns-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { setUpdateColumnsDefinitions } from 'redux/actions';
import { MATHJS_LINK } from '../constants';
import { hasCyclicDependencies, Item } from '../utils/cyclic-dependencies';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { useFilterSelector } from 'hooks/use-filter-selector';
import { FilterType } from 'types/custom-aggrid-types';
import { AppState } from 'redux/reducer';
import { createSpreadsheetColumn, updateSpreadsheetColumn } from 'services/study-config';
import { UUID } from 'crypto';
import { ColumnDefinition } from '../config/spreadsheet.type';

export type CustomColumnDialogProps = {
    open: UseStateBooleanReturn;
    colUuid?: UUID;
    tabIndex: number;
    isCreate?: boolean;
};

const styles = {
    dialogContent: {
        width: '40%',
        height: '65%',
        maxWidth: 'none',
        margin: 'auto',
    },
    columnDescription: { width: '95%', marginTop: '20px', marginBottom: '20px' },
    field: { width: '70%' },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
} as const satisfies Record<string, SxProps<Theme>>;

const COLUMN_NAME_REGEX = /\W/g;

export default function CustomColumnDialog({
    open,
    colUuid,
    tabIndex,
    isCreate = true,
}: Readonly<CustomColumnDialogProps>) {
    const formMethods = useForm({
        defaultValues: initialCustomColumnForm,
        resolver: yupResolver(customColumnFormSchema),
    });

    const { setError, setValue, control } = formMethods;
    const columnId = useWatch({ control, name: COLUMN_ID });
    const watchColumnName = useWatch({ control, name: COLUMN_NAME });
    const watchColumnType = useWatch({ control, name: COLUMN_TYPE });
    const columnsDefinitions = useSelector((state: AppState) => state.tables.definitions[tabIndex]?.columns);
    const spreadsheetConfigUuid = useSelector((state: AppState) => state.tables.definitions[tabIndex]?.uuid);
    const tableName = useSelector((state: AppState) => state.tables.definitions[tabIndex]?.name);
    const { snackError } = useSnackMessage();
    const columnDefinition = useMemo(
        () => columnsDefinitions?.find((column) => column?.uuid === colUuid),
        [colUuid, columnsDefinitions]
    );

    const { handleSubmit, reset } = formMethods;
    const dispatch = useDispatch<AppDispatch>();

    const intl = useIntl();

    const generateColumnId = useCallback(() => {
        if (columnId === '') {
            setValue(COLUMN_ID, watchColumnName.replace(COLUMN_NAME_REGEX, ''));
        }
    }, [columnId, watchColumnName, setValue]);

    const columnNameField = (
        <TextInput
            name={COLUMN_NAME}
            label={'spreadsheet/custom_column/column_name'}
            formProps={{
                autoFocus: true,
                onBlur: generateColumnId,
            }}
        />
    );

    const columnIdField = <TextInput name={COLUMN_ID} label={'spreadsheet/custom_column/column_id'} />;

    const columnType = (
        <AutocompleteInput
            name={COLUMN_TYPE}
            label={'spreadsheet/custom_column/column_type'}
            options={Object.keys(COLUMN_TYPES)}
            getOptionLabel={(option: any) => intl.formatMessage({ id: option })}
            size="small"
            fullWidth
        />
    );

    const precisionField = (
        <IntegerInput
            name={PRECISION}
            label="spreadsheet/custom_column/column_precision"
            formProps={{ size: 'small' }}
        />
    );

    const formulaField = (
        <ExpandingTextField
            name={FORMULA}
            label="spreadsheet/custom_column/column_content"
            minRows={3}
            rows={3}
            sx={{ flexGrow: 1 }}
        />
    );

    const { filters, dispatchFilters } = useFilterSelector(FilterType.Spreadsheet, tableName);

    const validateParams = (
        columnsDefinitions: ColumnDefinition[],
        newParams: CustomColumnForm,
        colUuid: UUID | undefined,
        setError: UseFormSetError<CustomColumnForm>
    ) => {
        const columnIdAlreadyExist = columnsDefinitions?.find(
            (column) => column.id === newParams.id && column.uuid !== colUuid
        );
        const columnNameAlreadyExist = columnsDefinitions?.find(
            (column) => column.name === newParams.name && column.uuid !== colUuid
        );

        if (columnNameAlreadyExist) {
            setError(COLUMN_NAME, {
                type: 'validate',
                message: 'spreadsheet/custom_column/column_name_already_exist',
            });
            return false;
        }

        if (columnIdAlreadyExist) {
            setError(COLUMN_ID, {
                type: 'validate',
                message: 'spreadsheet/custom_column/column_id_already_exist',
            });
            return false;
        }

        const newItems: Item[] = [...columnsDefinitions, newParams];
        if (hasCyclicDependencies(newItems)) {
            setError(COLUMN_DEPENDENCIES, {
                type: 'validate',
                message: 'spreadsheet/custom_column/creates_cyclic_dependency',
            });
            return false;
        }

        return true;
    };

    const onSubmit = useCallback(
        async (newParams: CustomColumnForm) => {
            if (!validateParams(columnsDefinitions, newParams, colUuid, setError)) {
                return;
            }

            const existingColumn = columnsDefinitions?.find((column) => column.uuid === colUuid);
            let isUpdate = false;

            if (existingColumn) {
                isUpdate = true;
                const updatedFilters = filters?.filter((filter) => filter.column !== existingColumn.id);
                dispatchFilters(updatedFilters);
            }

            const formattedParams = {
                ...newParams,
                dependencies: newParams.dependencies?.length ? JSON.stringify(newParams.dependencies) : undefined,
            };

            const updateOrCreateColumn =
                isUpdate && columnDefinition
                    ? updateSpreadsheetColumn(spreadsheetConfigUuid, columnDefinition.uuid, formattedParams)
                    : createSpreadsheetColumn(spreadsheetConfigUuid, formattedParams);

            // we reset and close the dialog to avoid multiple submissions
            reset(initialCustomColumnForm);
            open.setFalse();

            updateOrCreateColumn
                .then((uuid) => {
                    dispatch(
                        setUpdateColumnsDefinitions({
                            index: tabIndex,
                            value: {
                                uuid: columnDefinition?.uuid ?? uuid,
                                id: newParams.id,
                                name: newParams.name,
                                type: COLUMN_TYPES[newParams.type],
                                precision: newParams.precision,
                                formula: newParams.formula,
                                dependencies: newParams.dependencies,
                                visible: true,
                                locked: existingColumn?.locked,
                            },
                        })
                    );
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error,
                        headerId: 'spreadsheet/custom_column/error_saving_or_updating_column',
                    });
                });
        },
        [
            columnsDefinitions,
            colUuid,
            setError,
            columnDefinition,
            spreadsheetConfigUuid,
            filters,
            dispatchFilters,
            dispatch,
            tabIndex,
            reset,
            open,
            snackError,
        ]
    );

    useEffect(() => {
        if (open.value && columnDefinition) {
            const { name, id, type, precision, formula, dependencies } = columnDefinition;
            reset({
                [COLUMN_NAME]: name,
                [COLUMN_ID]: id,
                [COLUMN_TYPE]: type,
                [PRECISION]: precision,
                [FORMULA]: formula,
                [COLUMN_DEPENDENCIES]: dependencies ?? [],
            });
        } else {
            reset(initialCustomColumnForm);
        }
    }, [columnDefinition, tabIndex, open.value, reset]);

    return (
        <CustomFormProvider validationSchema={customColumnFormSchema} {...formMethods}>
            <Dialog
                id="custom-column-dialog-edit"
                open={open.value}
                onClose={open.setFalse}
                aria-labelledby="custom-column-dialog-edit-title"
                PaperProps={{ sx: styles.dialogContent }}
            >
                <DialogTitle id="custom-column-dialog-edit-title">
                    {intl.formatMessage({
                        id: isCreate
                            ? 'spreadsheet/custom_column/add_columns'
                            : 'spreadsheet/custom_column/edit_columns',
                    })}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} direction="column" alignItems="center">
                        <Typography align={'justify'} sx={styles.columnDescription}>
                            <FormattedMessage
                                id="spreadsheet/custom_column/column_content_description"
                                values={{
                                    Link: (mathJS) => (
                                        <Link
                                            href={MATHJS_LINK}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            underline="hover"
                                        >
                                            {mathJS}
                                        </Link>
                                    ),
                                }}
                            />
                        </Typography>
                        <Grid item sx={styles.field}>
                            {columnNameField}
                        </Grid>
                        <Grid item sx={styles.field}>
                            {columnIdField}
                        </Grid>
                        <Grid item sx={styles.field}>
                            {columnType}
                        </Grid>
                        {watchColumnType === COLUMN_TYPES.NUMBER && (
                            <Grid item sx={styles.field}>
                                {precisionField}
                            </Grid>
                        )}
                        <Grid item sx={styles.field}>
                            {formulaField}
                        </Grid>
                        <Grid item sx={styles.field}>
                            <MultipleAutocompleteInput
                                label="spreadsheet/custom_column/column_dependencies"
                                name={COLUMN_DEPENDENCIES}
                                options={
                                    columnsDefinitions
                                        ?.map((definition) => definition.id)
                                        .filter((id) => id !== columnId) ?? []
                                }
                                disableClearable={false}
                                disableCloseOnSelect
                                allowNewValue={false}
                                freeSolo={false}
                                onBlur={undefined}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
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
