/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { useIntl } from 'react-intl';
import { Dialog, DialogActions, DialogContent, DialogTitle, Box, Grid } from '@mui/material';
import { CancelButton, CustomFormProvider, SubmitButton, TextInput } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SpreadsheetTabDefinition } from './config/spreadsheet.type';
import { UUID } from 'crypto';

interface RenameTabDialogProps {
    open: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    currentName: string;
    tabUuid: UUID | null;
    tablesDefinitions: SpreadsheetTabDefinition[];
}

interface RenameTabForm {
    name: string;
}

export default function RenameTabDialog({
    open,
    onClose,
    onRename,
    currentName,
    tabUuid,
    tablesDefinitions,
}: Readonly<RenameTabDialogProps>) {
    const intl = useIntl();

    const schema = yup.object().shape({
        name: yup
            .string()
            .required()
            .max(60, 'spreadsheet/spreadsheet_name_le_60')
            .test(
                'unique-name',
                intl.formatMessage({ id: 'spreadsheet/create_new_spreadsheet/spreadsheet_name_already_exists' }),
                (value) => {
                    if (!value) {
                        return true;
                    }
                    // Check if name is already in use by another tab (not the one being renamed)
                    return !tablesDefinitions.some((tab) => tab.name === value && tab.uuid !== tabUuid);
                }
            ),
    });

    const formMethods = useForm<RenameTabForm>({
        defaultValues: { name: currentName },
        resolver: yupResolver(schema),
    });

    const { handleSubmit, reset } = formMethods;

    React.useEffect(() => {
        if (open) {
            reset({ name: currentName });
        }
    }, [open, currentName, reset]);

    const onSubmit = (data: RenameTabForm) => {
        onRename(data.name);
    };

    return (
        <CustomFormProvider validationSchema={schema} {...formMethods}>
            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="rename-tab-dialog-title"
                PaperProps={{ sx: { width: '20%' } }}
            >
                <DialogTitle id="rename-tab-dialog-title">
                    {intl.formatMessage({ id: 'spreadsheet/rename_dialog_title' })}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} direction="column">
                        <Grid item>
                            <TextInput
                                name="name"
                                label="spreadsheet/create_new_spreadsheet/spreadsheet_name"
                                formProps={{
                                    autoFocus: true,
                                    fullWidth: true,
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'end' }}>
                        <CancelButton onClick={onClose} />
                        <SubmitButton onClick={handleSubmit(onSubmit)} variant="outlined" />
                    </Box>
                </DialogActions>
            </Dialog>
        </CustomFormProvider>
    );
}
