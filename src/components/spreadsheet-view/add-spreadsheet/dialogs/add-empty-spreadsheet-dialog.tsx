/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Grid } from '@mui/material';
import {
    CustomFormProvider,
    EquipmentType,
    SelectInput,
    TextInput,
    UseStateBooleanReturn,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { EQUIPMENT_TYPE_FIELD } from 'components/utils/field-constants';
import { AppState } from 'redux/reducer';
import { UUID } from 'crypto';
import { dialogStyles } from '../styles/styles';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { getEmptySpreadsheetFormSchema, initialEmptySpreadsheetForm, SPREADSHEET_NAME } from './add-spreadsheet-form';
import { addNewSpreadsheet } from './add-spreadsheet-utils';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { ColumnDefinitionDto } from '../../types/spreadsheet.type';
import { v4 as uuid4 } from 'uuid';

interface AddEmptySpreadsheetDialogProps {
    open: UseStateBooleanReturn;
}

const TABLES_TYPES = [
    EquipmentType.SUBSTATION,
    EquipmentType.VOLTAGE_LEVEL,
    EquipmentType.LINE,
    EquipmentType.TWO_WINDINGS_TRANSFORMER,
    EquipmentType.THREE_WINDINGS_TRANSFORMER,
    EquipmentType.GENERATOR,
    EquipmentType.LOAD,
    EquipmentType.SHUNT_COMPENSATOR,
    EquipmentType.STATIC_VAR_COMPENSATOR,
    EquipmentType.BATTERY,
    EquipmentType.HVDC_LINE,
    EquipmentType.LCC_CONVERTER_STATION,
    EquipmentType.VSC_CONVERTER_STATION,
    EquipmentType.TIE_LINE,
    EquipmentType.DANGLING_LINE,
    EquipmentType.BUS,
    EquipmentType.BUSBAR_SECTION,
];

const DEFAULT_ID_COLUMN: ColumnDefinitionDto = {
    uuid: uuid4() as UUID,
    id: 'id',
    name: 'id',
    type: COLUMN_TYPES.TEXT,
    formula: 'id',
    visible: true,
};

/**
 * Dialog for creating an empty spreadsheet
 */
export default function AddEmptySpreadsheetDialog({ open, ...dialogProps }: Readonly<AddEmptySpreadsheetDialogProps>) {
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

    const onSubmit = useCallback(
        (formData: any) => {
            if (!studyUuid) {
                return;
            }
            const tabIndex = tablesDefinitions.length;
            const tabName = formData[SPREADSHEET_NAME];
            const equipmentType = formData.equipmentType;

            addNewSpreadsheet({
                studyUuid,
                columns: [DEFAULT_ID_COLUMN],
                sheetType: equipmentType,
                tabIndex,
                tabName,
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
                onClear={() => null}
                PaperProps={{ sx: dialogStyles.dialogContent }}
                {...dialogProps}
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
                            options={Object.values(TABLES_TYPES).map((elementType) => ({
                                id: elementType,
                                label: elementType,
                            }))}
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
