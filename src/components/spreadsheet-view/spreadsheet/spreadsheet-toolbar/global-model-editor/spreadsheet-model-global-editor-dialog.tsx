/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { Grid } from '@mui/material';
import {
    CustomFormProvider,
    ModificationDialog,
    type MuiStyles,
    type UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SpreadsheetModelGlobalEditorTable } from './spreadsheet-model-global-editor-table';
import FormulaSearchReplace from './formula-search-replace';
import { FormulaSearchProvider } from './formula-search-context';
import {
    COLUMNS_MODEL,
    columnsModelForm,
    columnsModelFormSchema,
    initialColumnsModelForm,
} from './spreadsheet-model-global-editor.utils';
import { ColumnGlobalModel } from './spreadsheet-model-global-editor.type';

export type SpreadsheetModelGlobalEditorDialogProps = {
    open: UseStateBooleanReturn;
    columnsModel: ColumnGlobalModel[] | undefined;
    updateColumnsModel: (newColumnsModel: columnsModelForm) => void;
} & Omit<React.ComponentProps<typeof ModificationDialog>, 'open' | 'onClose' | 'onSave' | 'onClear' | 'titleId'>;

const styles = {
    dialogContent: {
        width: '100%',
        height: '70%',
        maxWidth: 'none',
        margin: 'auto',
    },
} as const satisfies MuiStyles;

const toCustomColumnsGlobalModelDialogFormValues = (columnsModel: ColumnGlobalModel[]) => {
    return { [COLUMNS_MODEL]: columnsModel };
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

    const onSave = (data: columnsModelForm) => {
        // Strip extraneous 'selected' field to match ColumnGlobalModel
        const cleanedData = {
            [COLUMNS_MODEL]: data[COLUMNS_MODEL].map(({ selected, ...rest }) => rest),
        } as columnsModelForm;
        updateColumnsModel(cleanedData);
    };
    const onClear = () => {
        reset(initialColumnsModelForm);
    };
    const onClose = () => {
        open.setFalse();
    };

    useEffect(() => {
        if (open.value && columnsModel != null) {
            reset(
                toCustomColumnsGlobalModelDialogFormValues(
                    columnsModel.map((value) => ({
                        ...value,
                        selected: false,
                    }))
                )
            );
        }
    }, [open.value, columnsModel, reset]);

    return (
        <CustomFormProvider validationSchema={columnsModelFormSchema} {...formMethods}>
            <ModificationDialog
                titleId={'spreadsheet/global-model-edition/edit'}
                open={open.value}
                onClose={onClose}
                onSave={onSave}
                onClear={onClear}
                PaperProps={{ sx: styles.dialogContent }}
                {...dialogProps}
            >
                <FormulaSearchProvider>
                    <Grid container direction="column">
                        <Grid item container justifyContent="flex-start" sx={{ my: 2 }}>
                            <FormulaSearchReplace />
                        </Grid>
                        <Grid item>
                            <SpreadsheetModelGlobalEditorTable />
                        </Grid>
                    </Grid>
                </FormulaSearchProvider>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
