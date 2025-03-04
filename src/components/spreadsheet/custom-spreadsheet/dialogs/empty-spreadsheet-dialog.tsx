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
    SelectInput,
    SubmitButton,
    TextInput,
    UseStateBooleanReturn,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { EQUIPMENT_TYPE_FIELD } from 'components/utils/field-constants';
import { TABLES_TYPES } from '../../config/tables-types';
import { AppState } from 'redux/reducer';
import { FormattedMessage } from 'react-intl';
import {
    SPREADSHEET_NAME,
    getEmptySpreadsheetFormSchema,
    initialEmptySpreadsheetForm,
} from '../custom-spreadsheet-form';
import { addNewSpreadsheet } from '../custom-spreadsheet-utils';
import { UUID } from 'crypto';
import { dialogStyles } from './styles';

interface EmptySpreadsheetDialogProps {
    open: UseStateBooleanReturn;
}

/**
 * Dialog for creating an empty spreadsheet
 */
export default function EmptySpreadsheetDialog({ open }: Readonly<EmptySpreadsheetDialogProps>) {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);

    const tablesNames = useMemo(() => tablesDefinitions.map((def) => def.name), [tablesDefinitions]);
    const formSchema = useMemo(() => getEmptySpreadsheetFormSchema(tablesNames), [tablesNames]);

    const formMethods = useForm({
        defaultValues: initialEmptySpreadsheetForm,
        resolver: yupResolver(formSchema),
    });

    const { handleSubmit, reset } = formMethods;

    // Reset form when dialog opens
    useEffect(() => {
        reset(initialEmptySpreadsheetForm);
    }, [open.value, reset]);

    const onSubmit = useCallback(
        (formData: any) => {
            const tabIndex = tablesDefinitions.length;
            const tabName = formData[SPREADSHEET_NAME];
            const equipmentType = formData.equipmentType;

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
        },
        [tablesDefinitions.length, spreadsheetsCollectionUuid, dispatch, snackError, open]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Dialog
                id="empty-spreadsheet-dialog"
                open={open.value}
                onClose={open.setFalse}
                aria-labelledby="empty-spreadsheet-dialog-title"
                PaperProps={{ sx: dialogStyles.dialogContent }}
            >
                <DialogTitle id="empty-spreadsheet-dialog-title">
                    <FormattedMessage id="spreadsheet/create_new_spreadsheet/create_empty_spreadsheet" />
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
                            <SelectInput
                                options={Object.values(TABLES_TYPES).map((equipmentType) => ({
                                    id: equipmentType,
                                    label: equipmentType,
                                }))}
                                name={EQUIPMENT_TYPE_FIELD}
                                label="spreadsheet/create_new_spreadsheet/equipment_type"
                                size="small"
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
