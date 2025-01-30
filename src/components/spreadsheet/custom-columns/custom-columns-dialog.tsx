/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect } from 'react';
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
    SubmitButton,
    TextInput,
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm, useWatch } from 'react-hook-form';
import {
    COLUMN_DEPENDENCIES,
    COLUMN_ID,
    COLUMN_NAME,
    CustomColumnForm,
    customColumnFormSchema,
    FORMULA,
    initialCustomColumnForm,
} from './custom-columns-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { AppState } from 'redux/reducer';
import { setUpdateCustomColumDefinitions } from 'redux/actions';
import { MATHJS_LINK } from '../constants';
import { hasCyclicDependencies, Item } from '../utils/cyclic-dependencies';

export type CustomColumnDialogProps = {
    open: UseStateBooleanReturn;
    tabIndex: number;
    customColumnsDefinition?: ColumnWithFormula;
    customColumnsDefinitions?: ColumnWithFormula[];
    isCreate?: boolean;
};

const styles = {
    dialogContent: {
        width: '40%',
        height: '55%',
        maxWidth: 'none',
        margin: 'auto',
    },
    columnDescription: { width: '95%', marginTop: '20px', marginBottom: '20px' },
    field: { width: '70%' },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
} as const satisfies Record<string, SxProps<Theme>>;

export default function CustomColumnDialog({
    open,
    tabIndex,
    customColumnsDefinition,
    customColumnsDefinitions,
    isCreate = true,
}: Readonly<CustomColumnDialogProps>) {
    const formMethods = useForm({
        defaultValues: initialCustomColumnForm,
        resolver: yupResolver(customColumnFormSchema),
    });

    const { setError, control } = formMethods;
    const columnId = useWatch({ control, name: COLUMN_ID });
    const hasColumnIdChanged = columnId !== customColumnsDefinition?.[COLUMN_ID];

    const { handleSubmit, reset } = formMethods;
    const dispatch = useDispatch<AppDispatch>();

    const intl = useIntl();

    const tablesNames = useSelector((state: AppState) => state.tables.names);

    const columnNameField = (
        <TextInput name={COLUMN_NAME} label={'spreadsheet/custom_column/column_name'} formProps={{ autoFocus: true }} />
    );

    const columnIdField = <TextInput name={COLUMN_ID} label={'spreadsheet/custom_column/column_id'} />;

    const formulaField = (
        <ExpandingTextField
            name={FORMULA}
            label="spreadsheet/custom_column/column_content"
            minRows={3}
            rows={3}
            sx={{ flexGrow: 1 }}
        />
    );

    const onSubmit = useCallback(
        (newParams: CustomColumnForm) => {
            const existingColumn = customColumnsDefinitions?.find((column) => column.id === newParams.id);

            if (existingColumn) {
                if (isCreate || hasColumnIdChanged) {
                    setError(COLUMN_ID, {
                        type: 'validate',
                        message: 'spreadsheet/custom_column/column_id_already_exist',
                    });
                    return;
                }
            }

            if (customColumnsDefinitions) {
                const newItems: Item[] = [...customColumnsDefinitions, newParams];
                if (hasCyclicDependencies(newItems)) {
                    setError(COLUMN_DEPENDENCIES, {
                        type: 'validate',
                        message: 'spreadsheet/custom_column/creates_cyclic_dependency',
                    });
                    return;
                }
            }

            dispatch(
                setUpdateCustomColumDefinitions(tablesNames[tabIndex], {
                    uuid: customColumnsDefinition?.uuid || crypto.randomUUID(),
                    id: newParams.id,
                    name: newParams.name,
                    formula: newParams.formula,
                    dependencies: newParams.dependencies,
                })
            );
            reset(initialCustomColumnForm);
            open.setFalse();
        },
        [
            customColumnsDefinitions,
            dispatch,
            tablesNames,
            tabIndex,
            customColumnsDefinition?.uuid,
            reset,
            open,
            isCreate,
            hasColumnIdChanged,
            setError,
        ]
    );

    useEffect(() => {
        if (open.value && customColumnsDefinition) {
            reset({
                [COLUMN_NAME]: customColumnsDefinition.name,
                [COLUMN_ID]: customColumnsDefinition.id,
                [FORMULA]: customColumnsDefinition.formula,
                [COLUMN_DEPENDENCIES]: customColumnsDefinition.dependencies,
            });
        } else {
            reset(initialCustomColumnForm);
        }
    }, [customColumnsDefinition, tabIndex, open.value, reset]);

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
                            {formulaField}
                        </Grid>
                        <Grid item sx={styles.field}>
                            <MultipleAutocompleteInput
                                label="spreadsheet/custom_column/column_dependencies"
                                name={COLUMN_DEPENDENCIES}
                                options={
                                    customColumnsDefinitions
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
