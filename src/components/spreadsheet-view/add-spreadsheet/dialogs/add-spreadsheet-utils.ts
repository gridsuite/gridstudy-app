/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'node:crypto';
import {
    ColumnDefinition,
    ColumnDefinitionDto,
    SpreadsheetCollectionDto,
    SpreadsheetConfigDto,
    SpreadsheetEquipmentType,
    SpreadsheetTabDefinition,
} from '../../types/spreadsheet.type';
import { Dispatch } from 'redux';
import { UseStateBooleanReturn } from '@gridsuite/commons-ui';
import {
    addFilterForNewSpreadsheet,
    addSortForNewSpreadsheet,
    saveSpreadsheetGlobalFilters,
    setAddedSpreadsheetTab,
    updateTableDefinition,
} from 'redux/actions';
import { FilterConfig, SortWay } from 'types/custom-aggrid-types';
import { getSpreadsheetModel } from 'services/study-config';
import { v4 as uuid4 } from 'uuid';
import { COLUMN_DEPENDENCIES } from '../../columns/column-creation-form';
import { GlobalFilterSpreadsheetState, SpreadsheetFilterState } from 'redux/reducer';
import { addSpreadsheetConfigToCollection } from 'services/study/study-config';
import { GlobalFilter } from '../../../results/common/global-filter/global-filter-types';
import { ResetNodeAliasCallback } from '../../hooks/use-node-aliases';

const createNewTableDefinition = (
    columns: ColumnDefinition[],
    sheetType: SpreadsheetEquipmentType,
    tabIndex: number,
    tabName: string
) => ({
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

// This function is used to map the ColumnDefinition to ColumnDefinitionDto before sending it to the backend
export const mapColDefToDto = (colDef: ColumnDefinition, colFilter?: FilterConfig) => ({
    uuid: colDef.uuid,
    id: colDef.id,
    name: colDef.name,
    type: colDef.type,
    precision: colDef.precision,
    formula: colDef.formula,
    dependencies: colDef.dependencies?.length ? JSON.stringify(colDef.dependencies) : undefined,
    filterDataType: colFilter?.dataType,
    filterType: colFilter?.type,
    filterValue: colFilter?.value ? JSON.stringify(colFilter.value) : undefined,
    filterTolerance: colFilter?.tolerance,
});

export const mapColumnsDto = (columns: ColumnDefinitionDto[]) => {
    return columns.map((column) => ({
        uuid: column?.uuid,
        id: column.id,
        name: column.name,
        type: column.type,
        precision: column?.precision,
        formula: column.formula,
        filterDataType: column.filterDataType,
        filterTolerance: column.filterTolerance,
        filterType: column.filterType,
        filterValue: column.filterValue,
        visible: column.visible,
        [COLUMN_DEPENDENCIES]: column.dependencies?.length ? JSON.parse(column.dependencies) : undefined,
    }));
};

export const extractColumnsFilters = (columns: ColumnDefinitionDto[]): FilterConfig[] => {
    return columns
        .filter((col) => col.filterDataType && col.filterType && col.filterValue)
        .map((col) => ({
            column: col.id,
            dataType: col.filterDataType,
            tolerance: col.filterTolerance,
            type: col.filterType,
            value: JSON.parse(col.filterValue ?? ''),
        }));
};

const createSpreadsheetConfig = (
    columns: ColumnDefinitionDto[],
    globalFilters: GlobalFilter[],
    sheetType: SpreadsheetEquipmentType,
    tabName: string
) => ({
    name: tabName,
    sheetType,
    columns: columns.map((col) => ({
        ...col,
        dependencies: col?.[COLUMN_DEPENDENCIES]?.length ? JSON.stringify(col[COLUMN_DEPENDENCIES]) : undefined,
    })),
    globalFilters,
});

const handleSuccess = (
    uuid: UUID,
    newTableDefinition: SpreadsheetTabDefinition,
    dispatch: Dispatch,
    snackError: any,
    open: UseStateBooleanReturn,
    nodeAliases?: string[],
    resetNodeAliases?: ResetNodeAliasCallback
) => {
    newTableDefinition.uuid = uuid;
    // we need to refetch the model to get the new column uuids
    getSpreadsheetModel(uuid)
        .then((model: SpreadsheetConfigDto) => {
            resetNodeAliases?.(true, nodeAliases);
            newTableDefinition.columns = model.columns.map((col: ColumnDefinitionDto) => ({
                ...col,
                dependencies: col?.dependencies?.length ? JSON.parse(col.dependencies) : undefined,
                visible: true,
                locked: false,
            }));
            const columnsFilters = extractColumnsFilters(model.columns);
            const formattedGlobalFilters = model.globalFilters ?? [];
            dispatch(updateTableDefinition(newTableDefinition));
            dispatch(addFilterForNewSpreadsheet(uuid, columnsFilters));
            dispatch(saveSpreadsheetGlobalFilters(uuid, formattedGlobalFilters));
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
    studyUuid: UUID;
    columns: ColumnDefinitionDto[];
    globalFilters?: GlobalFilter[];
    sheetType: SpreadsheetEquipmentType;
    tabIndex: number;
    tabName: string;
    spreadsheetsCollectionUuid: UUID;
    dispatch: Dispatch;
    snackError: any;
    open: UseStateBooleanReturn;
    nodeAliases?: string[];
    resetNodeAliases?: ResetNodeAliasCallback;
}

export const addNewSpreadsheet = ({
    studyUuid,
    columns,
    globalFilters = [],
    sheetType,
    tabIndex,
    tabName,
    spreadsheetsCollectionUuid,
    dispatch,
    snackError,
    open,
    nodeAliases,
    resetNodeAliases,
}: AddNewSpreadsheetParams) => {
    const columnsDefinition = mapColumnsDto(columns);
    const newTableDefinition = createNewTableDefinition(columnsDefinition, sheetType, tabIndex, tabName);
    const spreadsheetConfig = createSpreadsheetConfig(columnsDefinition, globalFilters, sheetType, tabName);

    addSpreadsheetConfigToCollection(studyUuid, spreadsheetsCollectionUuid, spreadsheetConfig)
        .then((uuid: UUID) => {
            dispatch(setAddedSpreadsheetTab(uuid));
            handleSuccess(uuid, newTableDefinition, dispatch, snackError, open, nodeAliases, resetNodeAliases);
        })
        .catch((error) => {
            snackError({
                messageTxt: error,
                headerId: 'spreadsheet/create_new_spreadsheet/error_adding_spreadsheet',
            });
            open.setFalse();
        });
};

export interface ProcessedCollectionData {
    tableDefinitions: SpreadsheetTabDefinition[];
    tablesFilters: SpreadsheetFilterState;
    tableGlobalFilters: GlobalFilterSpreadsheetState;
}

export function processSpreadsheetsCollectionData(collectionData: SpreadsheetCollectionDto): ProcessedCollectionData {
    const tableDefinitions = collectionData.spreadsheetConfigs.map((spreadsheetConfig, index) => ({
        uuid: spreadsheetConfig.id,
        index: index,
        name: spreadsheetConfig.name,
        columns: mapColumnsDto(spreadsheetConfig.columns),
        type: spreadsheetConfig.sheetType,
    }));

    const tablesFilters = collectionData.spreadsheetConfigs.reduce(
        (filters, spreadsheetConfig) => ({
            ...filters,
            [spreadsheetConfig.id]: extractColumnsFilters(spreadsheetConfig.columns),
        }),
        {}
    );

    const tableGlobalFilters = collectionData.spreadsheetConfigs.reduce(
        (gsFilters, spreadsheetConfig) => ({
            ...gsFilters,
            [spreadsheetConfig.id]: spreadsheetConfig?.globalFilters ?? undefined,
        }),
        {}
    );

    return { tableDefinitions, tablesFilters, tableGlobalFilters };
}
