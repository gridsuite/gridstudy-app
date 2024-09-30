/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Grid, SxProps, Theme } from '@mui/material';
import { CancelButton, CustomFormProvider, SubmitButton, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import {
    CustomColumnForm,
    customColumnFormSchema,
    initialCustomColumnForm,
    TAB_CUSTOM_COLUMN,
} from './custom-columns-form';

import { yupResolver } from '@hookform/resolvers/yup';
import CustomColumnTable from './custom-columns-table';
import { setCustomColumDefinitions } from 'redux/actions';
import { TABLES_NAMES } from '../utils/config-tables';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'redux/store';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

export type CustomColumnDialogProps = {
    open: UseStateBooleanReturn;
    indexTab: number;
};

const styles = {
    dialogContent: {
        width: '50%',
        height: '60%',
        maxWidth: 'none',
        margin: 'auto',
    },
    actionButtons: { display: 'flex', gap: 2, justifyContent: 'end' },
} as const satisfies Record<string, SxProps<Theme>>;

export default function CustomColumnDialog({ open, indexTab }: Readonly<CustomColumnDialogProps>) {
    const formMethods = useForm({
        defaultValues: initialCustomColumnForm,
        resolver: yupResolver(customColumnFormSchema),
    });

    const { handleSubmit, reset } = formMethods;
    const dispatch = useDispatch<AppDispatch>();
    const columnsDefinitions = useSelector((state: AppState) => state.allCustomColumnsDefinitions);

    const intl = useIntl();

    const onSubmit = useCallback(
        (newParams: CustomColumnForm) => {
            dispatch(setCustomColumDefinitions(TABLES_NAMES[indexTab], newParams[TAB_CUSTOM_COLUMN]));
            reset(initialCustomColumnForm);
            open.setFalse();
        },

        [dispatch, indexTab, open, reset]
    );

    useEffect(() => {
        if (open.value && columnsDefinitions[TABLES_NAMES[indexTab]]?.columns.length !== 0) {
            reset({
                [TAB_CUSTOM_COLUMN]: [...columnsDefinitions[TABLES_NAMES[indexTab]].columns],
            });
        } else {
            reset(initialCustomColumnForm);
        }
    }, [columnsDefinitions, indexTab, open.value, reset]);

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
                    {intl.formatMessage({ id: 'spreadsheet/custom_column/main_button' })}
                </DialogTitle>
                <DialogContent dividers>
                    <CustomColumnTable />
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
