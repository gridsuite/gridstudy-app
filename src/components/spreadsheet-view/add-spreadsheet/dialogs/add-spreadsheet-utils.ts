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
import { snackWithFallback, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import {
    addFilterForNewSpreadsheet,
    addSortForNewSpreadsheet,
    initOrUpdateSpreadsheetGlobalFilters,
    setAddedSpreadsheetTab,
    updateTableDefinition,
} from 'redux/actions';
import { FilterConfig, SortConfig, SortWay } from 'types/custom-aggrid-types';
import { getSpreadsheetModel } from 'services/study-config';
import { v4 as uuid4 } from 'uuid';
import { COLUMN_DEPENDENCIES } from '../../columns/column-creation-form';
import { SpreadsheetFilterState } from 'redux/reducer.type';
import { TableSortConfig } from '../../../../types/custom-aggrid-types';
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
    columnFilterInfos: {
        filterDataType: colFilter?.dataType,
        filterType: colFilter?.type,
        filterValue: colFilter?.value ? JSON.stringify(colFilter.value) : undefined,
        filterTolerance: colFilter?.tolerance,
    },
});

export const mapColumnsDto = (columns: ColumnDefinitionDto[]) => {
    return columns.map((column) => ({
        uuid: column?.uuid,
        id: column.id,
        name: column.name,
        type: column.type,
        precision: column?.precision,
        formula: column.formula,
        columnFilterInfos: {
            filterDataType: column.columnFilterInfos?.filterDataType,
            filterTolerance: column.columnFilterInfos?.filterTolerance,
            filterType: column.columnFilterInfos?.filterType,
            filterValue: column.columnFilterInfos?.filterValue,
        },
        visible: column.visible,
        [COLUMN_DEPENDENCIES]: column.dependencies?.length ? JSON.parse(column.dependencies) : undefined,
    }));
};

export const extractColumnsFilters = (columns: ColumnDefinitionDto[]): FilterConfig[] => {
    return columns
        .filter(
            (col) =>
                col.columnFilterInfos?.filterDataType &&
                col.columnFilterInfos?.filterType &&
                col.columnFilterInfos?.filterValue
        )
        .map((col) => ({
            column: col.id,
            dataType: col.columnFilterInfos?.filterDataType,
            tolerance: col.columnFilterInfos?.filterTolerance,
            type: col.columnFilterInfos?.filterType,
            value: JSON.parse(col.columnFilterInfos?.filterValue ?? ''),
        }));
};

const createSpreadsheetConfig = (
    columns: ColumnDefinitionDto[],
    globalFilters: GlobalFilter[],
    sheetType: SpreadsheetEquipmentType,
    tabName: string,
    sortConfig?: SortConfig
) => ({
    name: tabName,
    sheetType,
    columns: columns.map((col) => ({
        ...col,
        dependencies: col?.[COLUMN_DEPENDENCIES]?.length ? JSON.stringify(col[COLUMN_DEPENDENCIES]) : undefined,
    })),
    globalFilters,
    sortConfig: sortConfig,
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
                visible: col.visible,
                locked: false,
            }));
            const columnsFilters = extractColumnsFilters(model.columns);
            const formattedGlobalFilters = model.globalFilters ?? [];
            dispatch(updateTableDefinition(newTableDefinition));
            dispatch(addFilterForNewSpreadsheet(uuid, columnsFilters));
            dispatch(initOrUpdateSpreadsheetGlobalFilters(uuid, formattedGlobalFilters));
            dispatch(
                addSortForNewSpreadsheet(uuid, [
                    {
                        colId: model.sortConfig ? model.sortConfig.colId : 'id',
                        sort: model.sortConfig ? model.sortConfig.sort : SortWay.ASC,
                    },
                ])
            );
        })
        .catch((error) => {
            snackWithFallback(snackError, error, {
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
    sortConfig?: SortConfig;
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
    sortConfig,
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
    const spreadsheetConfig = createSpreadsheetConfig(columnsDefinition, globalFilters, sheetType, tabName, sortConfig);

    addSpreadsheetConfigToCollection(studyUuid, spreadsheetsCollectionUuid, spreadsheetConfig)
        .then((uuid: UUID) => {
            dispatch(setAddedSpreadsheetTab(uuid));
            handleSuccess(uuid, newTableDefinition, dispatch, snackError, open, nodeAliases, resetNodeAliases);
        })
        .catch((error) => {
            snackWithFallback(snackError, error, {
                headerId: 'spreadsheet/create_new_spreadsheet/error_adding_spreadsheet',
            });
            open.setFalse();
        });
};

export interface ProcessedCollectionData {
    tableDefinitions: SpreadsheetTabDefinition[];
    tablesFilters: SpreadsheetFilterState;
    tableGlobalFilters: Record<UUID, GlobalFilter[]>;
    tablesSorts: TableSortConfig;
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

    const tablesSorts: TableSortConfig = collectionData.spreadsheetConfigs.reduce(
        (sorts, spreadsheetConfig) => ({
            ...sorts,
            [spreadsheetConfig.id]: spreadsheetConfig?.sortConfig ? [spreadsheetConfig.sortConfig] : [],
        }),
        {}
    );

    return { tableDefinitions, tablesFilters, tableGlobalFilters, tablesSorts };
}
