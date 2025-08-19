/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Grid } from '@mui/material';
import { CustomFormProvider, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { SpreadsheetModelGlobalEditorTable } from './spreadsheet-model-global-editor-table';
import {
    COLUMNS_MODEL,
    columnsModelForm,
    columnsModelFormSchema,
    initialColumnsModelForm,
} from './spreadsheet-model-global-editor.utils';
import { ColumnGlobalModel } from './spreadsheet-model-global-edtor.type';

export type SpreadsheetModelGlobalEditorDialogProps = {
    open: UseStateBooleanReturn;
    columnsModel: ColumnGlobalModel[] | undefined;
    updateColumnsModel: (newColumnsModel: columnsModelForm) => void;
};

const styles = {
    dialogContent: {
        width: '100%',
        height: '70%',
        maxWidth: 'none',
        margin: 'auto',
    },
};

const toCustomColumnGlobalModelDialogFormValues = (columsModel: ColumnGlobalModel[]) => {
    return { [COLUMNS_MODEL]: columsModel };
};

export function SpreadsheetModelGlobalEditorDialog({
    open,
    columnsModel,
    updateColumnsModel,
    ...dialogProps
}: Readonly<SpreadsheetModelGlobalEditorDialogProps>) {
    const formMethods = useForm<columnsModelForm>({
        defaultValues: initialColumnsModelForm,
        resolver: yupResolver(columnsModelFormSchema),
    });

    const { reset } = formMethods;

    const onValidate = (data: columnsModelForm) => {
        onClose();
        updateColumnsModel(data);
    };

    const onClose = () => {
        open.setFalse();
        reset(initialColumnsModelForm);
    };

    useEffect(() => {
        if (open.value && columnsModel != null) {
            let selected = { selected: false };
            reset(
                toCustomColumnGlobalModelDialogFormValues(
                    columnsModel.map((value) => {
                        return { ...value, ...selected };
                    })
                )
            );
        }
    }, [open, columnsModel, reset]);

    return (
        <CustomFormProvider validationSchema={columnsModelFormSchema} {...formMethods}>
            <ModificationDialog
                titleId={'spreadsheet/global-model-edition/edit'}
                open={open.value}
                onClose={onClose}
                onSave={onValidate}
                onClear={() => null}
                PaperProps={{ sx: styles.dialogContent }}
                {...dialogProps}
            >
                <Grid container>
                    <SpreadsheetModelGlobalEditorTable columnsModel={columnsModel} />
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
