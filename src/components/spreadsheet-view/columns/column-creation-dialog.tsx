/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Link, Typography } from '@mui/material';
import {
    AutocompleteInput,
    CancelButton,
    COLUMN_TYPES,
    CustomFormProvider,
    ExpandingTextField,
    IntegerInput,
    type MuiStyles,
    MultipleAutocompleteInput,
    snackWithFallback,
    SubmitButton,
    TextInput,
    useSnackMessage,
    type UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm, UseFormSetError, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { setUpdateColumnsDefinitions } from 'redux/actions';
import { hasCyclicDependencies, Item } from './utils/cyclic-dependencies';
import { useFilterSelector } from 'hooks/use-filter-selector';
import { FilterType } from 'types/custom-aggrid-types';
import type { UUID } from 'node:crypto';
import { ColumnDefinition, SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import {
    COLUMN_DEPENDENCIES,
    COLUMN_ID,
    COLUMN_NAME,
    COLUMN_TYPE,
    ColumnCreationForm,
    columnCreationFormSchema,
    FORMULA,
    initialColumnCreationForm,
    PRECISION,
} from './column-creation-form';
import { AppState } from 'redux/reducer';
import { createSpreadsheetColumn, updateSpreadsheetColumn } from '../../../services/study/study-config';
import { FloatingPopoverTreeviewWrapper } from './floating-treeview-list/floating-popover-treeview-wrapper';
import { isFormulaContentSizeOk } from './utils/formula-validator';
import { MAX_FORMULA_CHARACTERS } from '../constants';

export type ColumnCreationDialogProps = {
    open: UseStateBooleanReturn;
    colUuid?: UUID;
    tableDefinition: SpreadsheetTabDefinition;
    isCreate?: boolean;
};

const styles = {
    dialogContent: {
        width: '40%',
        height: '72%',
        maxWidth: 'none',
        margin: 'auto',
    },
    columnDescription: { width: '95%', marginTop: '20px', marginBottom: '20px' },
    field: { width: '70%' },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
} as const satisfies MuiStyles;

const COLUMN_NAME_REGEX = /\W/g;

const MATHJS_LINK = 'https://mathjs.org/index.html';

export default function ColumnCreationDialog({
    open,
    colUuid,
    tableDefinition,
    isCreate = true,
}: Readonly<ColumnCreationDialogProps>) {
    const formMethods = useForm({
        defaultValues: initialColumnCreationForm,
        resolver: yupResolver(columnCreationFormSchema),
    });

    const { setError, setValue, control } = formMethods;
    const columnId = useWatch({ control, name: COLUMN_ID });
    const watchColumnName = useWatch({ control, name: COLUMN_NAME });
    const watchColumnType = useWatch({ control, name: COLUMN_TYPE });
    const columnsDefinitions = tableDefinition?.columns;
    const spreadsheetConfigUuid = tableDefinition?.uuid;
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
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
        <FloatingPopoverTreeviewWrapper formMethods={formMethods} spreadsheetEquipmentType={tableDefinition.type}>
            <ExpandingTextField
                name={FORMULA}
                label="spreadsheet/custom_column/column_content"
                minRows={3}
                rows={3}
                maxCharactersNumber={MAX_FORMULA_CHARACTERS}
                sx={{ flexGrow: 1 }}
                acceptValue={isFormulaContentSizeOk}
            />
        </FloatingPopoverTreeviewWrapper>
    );

    const { filters, dispatchFilters } = useFilterSelector(FilterType.Spreadsheet, spreadsheetConfigUuid);

    const validateParams = (
        columnsDefinitions: ColumnDefinition[],
        newParams: ColumnCreationForm,
        colUuid: UUID | undefined,
        setError: UseFormSetError<ColumnCreationForm>
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
        }

        if (columnIdAlreadyExist) {
            setError(COLUMN_ID, {
                type: 'validate',
                message: 'spreadsheet/custom_column/column_id_already_exist',
            });
        }

        const newItems: Item[] = [...columnsDefinitions, newParams];
        const cycleError = hasCyclicDependencies(newItems);
        if (cycleError) {
            setError(COLUMN_DEPENDENCIES, {
                type: 'validate',
                message: 'spreadsheet/custom_column/creates_cyclic_dependency',
            });
        }

        return !(columnNameAlreadyExist || columnIdAlreadyExist || cycleError);
    };

    const onClose = useCallback(
        (event_: React.MouseEvent, reason: string) => {
            // don't close the dialog for outside click
            if (reason !== 'backdropClick') {
                open.setFalse();
            }
        },
        [open]
    );

    const onSubmit = useCallback(
        async (newParams: ColumnCreationForm) => {
            if (!studyUuid || !validateParams(columnsDefinitions, newParams, colUuid, setError)) {
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
                    ? updateSpreadsheetColumn(studyUuid, spreadsheetConfigUuid, columnDefinition.uuid, formattedParams)
                    : createSpreadsheetColumn(studyUuid, spreadsheetConfigUuid, formattedParams);

            // we reset and close the dialog to avoid multiple submissions
            reset(initialColumnCreationForm);
            open.setFalse();

            updateOrCreateColumn
                .then((uuid) => {
                    dispatch(
                        setUpdateColumnsDefinitions({
                            uuid: tableDefinition.uuid,
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
                    snackWithFallback(snackError, error, {
                        headerId: 'spreadsheet/custom_column/error_saving_or_updating_column',
                    });
                });
        },
        [
            studyUuid,
            columnsDefinitions,
            colUuid,
            setError,
            columnDefinition,
            spreadsheetConfigUuid,
            reset,
            open,
            filters,
            dispatchFilters,
            dispatch,
            tableDefinition,
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
            reset(initialColumnCreationForm);
        }
    }, [columnDefinition, open.value, reset]);

    return (
        <CustomFormProvider validationSchema={columnCreationFormSchema} {...formMethods}>
            <Dialog
                id="custom-column-dialog-edit"
                open={open.value}
                onClose={onClose}
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
                <DialogContent data-popover-anchor>
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
