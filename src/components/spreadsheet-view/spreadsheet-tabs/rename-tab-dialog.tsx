/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { useIntl } from 'react-intl';
import { Grid } from '@mui/material';
import { CustomFormProvider, ModificationDialog, TextInput } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import type { UUID } from 'node:crypto';

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
    ...dialogProps
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

    const { reset } = formMethods;

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
            <ModificationDialog
                titleId={'spreadsheet/rename_dialog_title'}
                open={open}
                onClose={onClose}
                onSave={onSubmit}
                onClear={() => null}
                PaperProps={{ sx: { width: '30%' } }}
                {...dialogProps}
            >
                <Grid container spacing={2} direction="column" marginTop="auto">
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
            </ModificationDialog>
        </CustomFormProvider>
    );
}
