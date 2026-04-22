/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Grid } from '@mui/material';
import { CustomFormProvider, SelectInput, TextInput, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { EQUIPMENT_TYPE_FIELD } from 'components/utils/field-constants';
import { AppState } from 'redux/reducer.type';
import type { UUID } from 'node:crypto';
import { dialogStyles } from '../styles/styles';
import { ModificationDialog, type ModificationDialogProps } from 'components/dialogs/commons/modificationDialog';
import {
    type EmptySpreadsheetForm,
    getEmptySpreadsheetFormSchema,
    initialEmptySpreadsheetForm,
    SPREADSHEET_NAME,
} from './add-spreadsheet-form';
import { addNewSpreadsheet } from './add-spreadsheet-utils';
import { ColumnDefinitionDto, SpreadsheetEquipmentType } from '../../types/spreadsheet.type';
import { v4 as uuid4 } from 'uuid';
import type { DialogComponentProps } from '../types';
import { COLUMN_TYPES } from '../../../../types/custom-aggrid-types';

export type AddEmptySpreadsheetDialogProps = Pick<DialogComponentProps, 'open'>;

const TABLES_OPTIONS = Object.values(SpreadsheetEquipmentType).map(
    (elementType) => ({ id: elementType, label: elementType }) as const
);

const DEFAULT_ID_COLUMN = {
    uuid: uuid4() as UUID,
    name: 'ID',
    id: 'id',
    type: COLUMN_TYPES.TEXT,
    formula: 'id',
    visible: true,
} as const satisfies ColumnDefinitionDto;

/**
 * Dialog for creating an empty spreadsheet
 */
export default function AddEmptySpreadsheetDialog({ open }: Readonly<AddEmptySpreadsheetDialogProps>) {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const spreadsheetsCollectionUuid = useSelector((state: AppState) => state.tables.uuid);

    const tablesNames = useMemo(() => tablesDefinitions.map((def) => def.name), [tablesDefinitions]);
    const formSchema = useMemo(() => getEmptySpreadsheetFormSchema(tablesNames), [tablesNames]);

    const formMethods = useForm({
        defaultValues: initialEmptySpreadsheetForm,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    // Reset form when dialog opens
    useEffect(() => {
        reset(initialEmptySpreadsheetForm);
    }, [open.value, reset]);

    const onSubmit = useCallback<ModificationDialogProps<EmptySpreadsheetForm>['onSave']>(
        (formData) => {
            if (!studyUuid) {
                return;
            }
            addNewSpreadsheet({
                studyUuid,
                columns: [DEFAULT_ID_COLUMN],
                sheetType: formData.equipmentType,
                tabIndex: tablesDefinitions.length,
                tabName: formData[SPREADSHEET_NAME],
                spreadsheetsCollectionUuid: spreadsheetsCollectionUuid as UUID,
                dispatch,
                snackError,
                open,
            });
        },
        [tablesDefinitions.length, studyUuid, spreadsheetsCollectionUuid, dispatch, snackError, open]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                titleId={'spreadsheet/create_new_spreadsheet/create_empty_spreadsheet'}
                open={open.value}
                onClose={open.setFalse}
                onSave={onSubmit}
                onClear={() => {}}
                PaperProps={{ sx: dialogStyles.dialogContent }}
            >
                <Grid container spacing={2} direction="column" marginTop="auto">
                    <Grid item xs>
                        <TextInput
                            name={SPREADSHEET_NAME}
                            label="spreadsheet/create_new_spreadsheet/spreadsheet_name"
                            formProps={{ autoFocus: true }}
                        />
                    </Grid>
                    <Grid item xs>
                        <SelectInput
                            options={TABLES_OPTIONS}
                            name={EQUIPMENT_TYPE_FIELD}
                            label="spreadsheet/create_new_spreadsheet/element_type"
                            size="small"
                        />
                    </Grid>
                </Grid>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
