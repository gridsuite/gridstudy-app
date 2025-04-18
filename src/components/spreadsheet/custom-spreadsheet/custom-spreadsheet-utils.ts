/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import {
    ColumnDefinition,
    ColumnDefinitionDto,
    SpreadsheetEquipmentType,
    SpreadsheetTabDefinition,
} from '../config/spreadsheet.type';
import { COLUMN_DEPENDENCIES } from '../custom-columns/custom-columns-form';
import { Dispatch } from 'redux';
import { UseStateBooleanReturn } from '@gridsuite/commons-ui';
import { addFilterForNewSpreadsheet, addSortForNewSpreadsheet, updateTableDefinition } from 'redux/actions';
import { SortWay } from 'types/custom-aggrid-types';
import { addSpreadsheetConfigToCollection, getSpreadsheetModel } from 'services/study-config';
import { v4 as uuid4 } from 'uuid';

const createNewTableDefinition = (
    columns: ColumnDefinition[],
    sheetType: SpreadsheetEquipmentType,
    tabIndex: number,
    tabName: string
): SpreadsheetTabDefinition => ({
    uuid: uuid4() as UUID,
    index: tabIndex,
    name: tabName,
    type: sheetType,
    columns: columns.map((col) => ({
        ...col,
        visible: true,
        locked: false,
    })),
});

export const mapColumnsDto = (columns: ColumnDefinitionDto[]) => {
    return columns.map((column) => ({
        ...column,
        [COLUMN_DEPENDENCIES]: column.dependencies?.length ? JSON.parse(column.dependencies) : undefined,
    }));
};

const createSpreadsheetConfig = (
    columns: ColumnDefinition[],
    sheetType: SpreadsheetEquipmentType,
    tabName: string
) => ({
    name: tabName,
    sheetType,
    columns: columns.map((col) => ({
        ...col,
        dependencies: col?.[COLUMN_DEPENDENCIES]?.length ? JSON.stringify(col[COLUMN_DEPENDENCIES]) : undefined,
    })),
});

const handleSuccess = (
    uuid: UUID,
    newTableDefinition: SpreadsheetTabDefinition,
    dispatch: Dispatch,
    snackError: any,
    open: UseStateBooleanReturn
) => {
    newTableDefinition.uuid = uuid;
    // we need to refetch the model to get the new column uuids
    getSpreadsheetModel(uuid)
        .then((model) => {
            newTableDefinition.columns = model.columns.map((col: ColumnDefinitionDto) => ({
                ...col,
                dependencies: col.dependencies?.length ? JSON.parse(col.dependencies) : undefined,
                visible: true,
                locked: false,
            }));
            dispatch(updateTableDefinition(newTableDefinition));
            dispatch(addFilterForNewSpreadsheet(uuid, []));
            dispatch(addSortForNewSpreadsheet(uuid, [{ colId: 'id', sort: SortWay.ASC }]));
        })
        .catch((error) => {
            snackError({
                messageTxt: error,
                headerId: 'spreadsheet/create_new_spreadsheet/error_loading_model',
            });
        })
        .finally(() => {
            open.setFalse();
        });
};

interface AddNewSpreadsheetParams {
    columns: ColumnDefinition[];
    sheetType: SpreadsheetEquipmentType;
    tabIndex: number;
    tabName: string;
    spreadsheetsCollectionUuid: UUID;
    dispatch: Dispatch;
    snackError: any;
    open: UseStateBooleanReturn;
}

export const addNewSpreadsheet = ({
    columns,
    sheetType,
    tabIndex,
    tabName,
    spreadsheetsCollectionUuid,
    dispatch,
    snackError,
    open,
}: AddNewSpreadsheetParams) => {
    const newTableDefinition = createNewTableDefinition(columns, sheetType, tabIndex, tabName);
    const spreadsheetConfig = createSpreadsheetConfig(columns, sheetType, tabName);

    addSpreadsheetConfigToCollection(spreadsheetsCollectionUuid, spreadsheetConfig)
        .then((uuid: UUID) => handleSuccess(uuid, newTableDefinition, dispatch, snackError, open))
        .catch((error) => {
            snackError({
                messageTxt: error,
                headerId: 'spreadsheet/create_new_spreadsheet/error_adding_spreadsheet',
            });
            open.setFalse();
        });
};
