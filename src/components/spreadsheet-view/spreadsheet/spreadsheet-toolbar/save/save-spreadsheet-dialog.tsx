/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ElementSaveDialog,
    ElementType,
    IElementCreationDialog,
    IElementUpdateDialog,
    useSnackMessage,
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSpreadsheetModel, updateSpreadsheetModel } from '../../../../../services/explore';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer';
import { v4 as uuid4 } from 'uuid';
import { ColumnDefinitionDto, SpreadsheetConfig, SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { SPREADSHEET_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { SaveFilterConfirmationDialog } from './save-filter-confirmation-dialog';
import { useNodeAliases } from '../../../hooks/use-node-aliases';

export type SaveSpreadsheetDialogProps = {
    tableDefinition: SpreadsheetTabDefinition;
    open: UseStateBooleanReturn;
};

export default function SaveSpreadsheetDialog({ tableDefinition, open }: Readonly<SaveSpreadsheetDialogProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const { nodeAliases } = useNodeAliases();
    const tableFilters = useSelector((state: AppState) => state[SPREADSHEET_STORE_FIELD][tableDefinition.uuid]);
    const tableGlobalFilters = useSelector(
        (state: AppState) => state.globalFilterSpreadsheetState[tableDefinition.uuid]
    );
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [includeFilters, setIncludeFilters] = useState(false);
    const [showFilterConfirmation, setShowFilterConfirmation] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const hasFilters = useMemo(() => {
        return (tableFilters && tableFilters.length > 0) || (tableGlobalFilters && tableGlobalFilters.length > 0);
    }, [tableFilters, tableGlobalFilters]);

    // When the dialog is opened, decide which dialog to show first
    useEffect(() => {
        if (open.value) {
            if (hasFilters) {
                setShowFilterConfirmation(true);
                setShowSaveDialog(false);
            } else {
                setShowFilterConfirmation(false);
                setShowSaveDialog(true);
            }
        } else {
            setShowFilterConfirmation(false);
            setShowSaveDialog(false);
        }
    }, [open.value, hasFilters]);

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
                    filterDataType: columnFilter?.dataType,
                    filterTolerance: columnFilter?.tolerance,
                    filterType: columnFilter?.type,
                    filterValue: JSON.stringify(columnFilter?.value) ?? undefined,
                    visible: true,
                };
                return acc;
            },
            {} as Record<string, ColumnDefinitionDto>
        );
    }, [includeFilters, tableDefinition?.columns, tableFilters]);

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
        const spreadsheetConfig: SpreadsheetConfig = {
            name: tableDefinition?.name,
            sheetType: tableDefinition?.type,
            columns: reorderedColumns,
            globalFilters: includeFilters ? (tableGlobalFilters ?? []) : [],
            nodeAliases: nodeAliases?.map((n) => n.alias),
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
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'spreadsheet/save/error_message',
                });
            });
    };

    const updateSpreadsheetColumnsConfiguration = ({
        id,
        name,
        description,
        elementFullPath,
    }: IElementUpdateDialog) => {
        const spreadsheetConfig: SpreadsheetConfig = {
            name: tableDefinition?.name,
            sheetType: tableDefinition?.type,
            columns: reorderedColumns,
            globalFilters: includeFilters ? (tableGlobalFilters ?? []) : [],
            nodeAliases: nodeAliases?.map((n) => n.alias),
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
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'spreadsheet/save/update_error_message',
                    headerValues: {
                        item: elementFullPath,
                    },
                });
            });
    };

    const handleFilterConfirmation = useCallback((include: boolean) => {
        setIncludeFilters(include);
        setShowFilterConfirmation(false);
        setShowSaveDialog(true);
    }, []);

    const handleSaveDialogClose = useCallback(() => {
        setShowSaveDialog(false);
        open.setFalse();
    }, [open]);

    return (
        <>
            {showFilterConfirmation && (
                <SaveFilterConfirmationDialog open={showFilterConfirmation} onConfirm={handleFilterConfirmation} />
            )}

            {showSaveDialog && studyUuid && (
                <ElementSaveDialog
                    open={showSaveDialog}
                    onClose={handleSaveDialogClose}
                    onSave={saveSpreadsheetColumnsConfiguration}
                    OnUpdate={updateSpreadsheetColumnsConfiguration}
                    type={ElementType.SPREADSHEET_CONFIG}
                    titleId={'spreadsheet/save/dialog_title'}
                    studyUuid={studyUuid}
                    selectorTitleId="spreadsheet/create_new_spreadsheet/select_spreadsheet_model"
                    createLabelId="spreadsheet/save/create_new_model"
                    updateLabelId="spreadsheet/save/replace_existing_model"
                />
            )}
        </>
    );
}
