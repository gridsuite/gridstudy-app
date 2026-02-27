/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ElementType,
    IElementCreationDialog,
    IElementUpdateDialog,
    snackWithFallback,
    useSnackMessage,
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSpreadsheetModel, updateSpreadsheetModel } from '../../../../../services/explore';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer.type';
import { v4 as uuid4 } from 'uuid';
import { ColumnDefinitionDto, SpreadsheetConfig, SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { SPREADSHEET_SORT_STORE, SPREADSHEET_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { useNodeAliases } from '../../../hooks/use-node-aliases';
import { SaveSpreadsheetModelDialog } from './save-spreadsheet-model-dialog';

import { getSelectedGlobalFilters } from '../../../../results/common/global-filter/use-selected-global-filters';

export type SaveSpreadsheetDialogProps = {
    tableDefinition: SpreadsheetTabDefinition;
    open: UseStateBooleanReturn;
};

export default function SaveSpreadsheetDialog({ tableDefinition, open }: Readonly<SaveSpreadsheetDialogProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const { nodeAliases } = useNodeAliases();
    const tableFilters = useSelector((state: AppState) => state[SPREADSHEET_STORE_FIELD][tableDefinition.uuid]);
    const sortConfig = useSelector((state: AppState) => state.tableSort[SPREADSHEET_SORT_STORE][tableDefinition.uuid]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [includeFilters, setIncludeFilters] = useState(false);
    const [includeVisibility, setIncludeVisibility] = useState(false);
    const [includeSorting, setIncludeSorting] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    useEffect(() => {
        setShowSaveDialog(open.value);
    }, [open.value]);

    const customColumns = useMemo(() => {
        return tableDefinition?.columns.reduce(
            (acc, item) => {
                const columnFilter = includeFilters
                    ? tableFilters?.find((filter) => filter.column === item.id)
                    : undefined;
                acc[item.id] = {
                    uuid: item?.uuid ?? uuid4(),
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    precision: item.precision,
                    formula: item.formula,
                    dependencies: item.dependencies?.length ? JSON.stringify(item.dependencies) : undefined,
                    columnFilterInfos: {
                        filterDataType: columnFilter?.dataType,
                        filterTolerance: columnFilter?.tolerance,
                        filterType: columnFilter?.type,
                        filterValue: JSON.stringify(columnFilter?.value) ?? undefined,
                    },
                    visible: includeVisibility ? item.visible : true,
                };
                return acc;
            },
            {} as Record<string, ColumnDefinitionDto>
        );
    }, [includeFilters, includeVisibility, tableDefinition?.columns, tableFilters]);

    const reorderedColumns = useMemo(() => {
        return tableDefinition?.columns && customColumns
            ? tableDefinition?.columns?.map((column) => customColumns[column.id])
            : [];
    }, [tableDefinition, customColumns]);

    const saveSpreadsheetColumnsConfiguration = ({
        name,
        description,
        folderName,
        folderId,
    }: IElementCreationDialog) => {
        const tableGlobalFilters = getSelectedGlobalFilters(tableDefinition.uuid);
        const spreadsheetConfig: SpreadsheetConfig = {
            name: tableDefinition?.name,
            sheetType: tableDefinition?.type,
            columns: reorderedColumns,
            globalFilters: includeFilters ? (tableGlobalFilters ?? []) : [],
            nodeAliases: nodeAliases?.map((n) => n.alias),
            sortConfig: includeSorting ? (sortConfig[0] ?? undefined) : undefined,
        };

        createSpreadsheetModel(name, description, folderId, spreadsheetConfig)
            .then(() => {
                snackInfo({
                    headerId: 'spreadsheet/save/confirmation_message',
                    headerValues: {
                        folderName: folderName,
                    },
                });
            })
            .catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'spreadsheet/save/error_message' });
            });
    };

    const updateSpreadsheetColumnsConfiguration = ({
        id,
        name,
        description,
        elementFullPath,
    }: IElementUpdateDialog) => {
        const tableGlobalFilters = getSelectedGlobalFilters(tableDefinition.uuid);
        const spreadsheetConfig: SpreadsheetConfig = {
            name: tableDefinition?.name,
            sheetType: tableDefinition?.type,
            columns: reorderedColumns,
            globalFilters: includeFilters ? (tableGlobalFilters ?? []) : [],
            nodeAliases: nodeAliases?.map((n) => n.alias),
            sortConfig: includeSorting ? (sortConfig[0] ?? undefined) : undefined,
        };

        updateSpreadsheetModel(id, name, description, spreadsheetConfig)
            .then(() => {
                snackInfo({
                    headerId: 'spreadsheet/save/update_confirmation_message',
                    headerValues: {
                        item: elementFullPath,
                    },
                });
            })
            .catch((error) => {
                snackWithFallback(snackError, error, {
                    headerId: 'spreadsheet/save/update_error_message',
                    headerValues: {
                        item: elementFullPath,
                    },
                });
            });
    };

    const handleSaveDialogClose = useCallback(() => {
        setShowSaveDialog(false);
        open.setFalse();
    }, [open]);

    return (
        <>
            {showSaveDialog && studyUuid && (
                <SaveSpreadsheetModelDialog
                    open={showSaveDialog}
                    onClose={handleSaveDialogClose}
                    onSave={saveSpreadsheetColumnsConfiguration}
                    onUpdate={updateSpreadsheetColumnsConfiguration}
                    type={ElementType.SPREADSHEET_CONFIG}
                    titleId={'spreadsheet/save/dialog_title'}
                    studyUuid={studyUuid}
                    selectorTitleId="spreadsheet/create_new_spreadsheet/select_spreadsheet_model"
                    createLabelId="spreadsheet/save/create_new_model"
                    updateLabelId="spreadsheet/save/replace_existing_model"
                    includeFilters={includeFilters}
                    setIncludeFilters={setIncludeFilters}
                    includeVisibility={includeVisibility}
                    setIncludeVisibility={setIncludeVisibility}
                    includeSorting={includeSorting}
                    setIncludeSorting={setIncludeSorting}
                />
            )}
        </>
    );
}
