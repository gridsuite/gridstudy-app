/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    SxProps,
    Theme,
    Typography,
} from '@mui/material';
import {
    CancelButton,
    CustomFormProvider,
    ExpandingTextField,
    SubmitButton,
    TextInput,
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import {
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
import { filledTextField } from '../constants';
import { setUpdateCustomColumDefinitions } from 'redux/actions';

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
        height: '50%',
        maxWidth: 'none',
        margin: 'auto',
    },
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

    const { setError } = formMethods;

    const { handleSubmit, reset } = formMethods;
    const dispatch = useDispatch<AppDispatch>();

    const intl = useIntl();

    const tablesNames = useSelector((state: AppState) => state.tables.names);

    const columnNameField = (
        <TextInput
            name={COLUMN_NAME}
            label={'spreadsheet/custom_column/column_name'}
            formProps={{ autoFocus: true, ...filledTextField }}
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

    const onSubmit = useCallback(
        (newParams: CustomColumnForm) => {
            if (customColumnsDefinitions?.find((column) => column.name === newParams.name)) {
                setError(COLUMN_NAME, {
                    type: 'validate',
                    message: 'spreadsheet/custom_column/column_name_already_exist',
                });
                return;
            }
            dispatch(
                setUpdateCustomColumDefinitions(tablesNames[tabIndex], {
                    id: customColumnsDefinition?.id || crypto.randomUUID(),
                    name: newParams.name,
                    formula: newParams.formula,
                })
            );
            reset(initialCustomColumnForm);
            open.setFalse();
        },
        [customColumnsDefinitions, dispatch, tablesNames, tabIndex, customColumnsDefinition?.id, reset, open, setError]
    );

    useEffect(() => {
        if (open.value && customColumnsDefinition) {
            reset({
                [COLUMN_NAME]: customColumnsDefinition.name,
                [FORMULA]: customColumnsDefinition.formula,
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
                        <Typography align={'justify'} sx={{ width: '95%', marginTop: '20px', marginBottom: '20px' }}>
                            {intl.formatMessage({ id: 'spreadsheet/custom_column/column_content_description' })}
                        </Typography>
                        <Grid item sx={{ width: '70%' }}>
                            {columnNameField}
                        </Grid>
                        <Grid item sx={{ width: '70%' }}>
                            {formulaField}
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
