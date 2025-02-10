/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ElementType, useSnackMessage, UseStateBooleanReturn } from '@gridsuite/commons-ui';
import ElementCreationDialog, { IElementCreationDialog } from '../../dialogs/element-creation-dialog';
import { useMemo } from 'react';
import { createSpreadsheetModel } from '../../../services/explore';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ColumnWithFormulaDto, SpreadsheetConfig } from '../../../types/custom-columns.types';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { v4 as uuid4 } from 'uuid';

export type CustomSpreadsheetSaveDialogProps = {
    tabIndex: number;
    open: UseStateBooleanReturn;
};

export default function CustomSpreadsheetSaveDialog({ tabIndex, open }: Readonly<CustomSpreadsheetSaveDialogProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);
    const columnsStates = useSelector((state: AppState) => state.tables.columnsStates[tabIndex]);

    const customColumns = useMemo(() => {
        return tableDefinition.columns.reduce((acc, item) => {
            acc[item.id] = {
                uuid: item?.uuid ?? uuid4(),
                id: item.id,
                name: item.name,
                type: item.type,
                precision: item.precision,
                formula: item.formula,
                dependencies: JSON.stringify(item.dependencies),
            };
            return acc;
        }, {} as Record<string, ColumnWithFormulaDto>);
    }, [tableDefinition.columns]);

    const reorderedColumnsIds = useMemo(() => {
        return columnsStates.map((col) => col.colId);
    }, [columnsStates]);

    const reorderedColumns = useMemo(() => {
        return reorderedColumnsIds && customColumns
            ? reorderedColumnsIds.map((colId: string) => customColumns[colId])
            : [];
    }, [reorderedColumnsIds, customColumns]);

    const saveSpreadsheetColumnsConfiguration = ({
        name,
        description,
        folderName,
        folderId,
    }: IElementCreationDialog) => {
        const spreadsheetConfig: SpreadsheetConfig = {
            sheetType: tableDefinition.type,
            customColumns: reorderedColumns,
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

    return (
        <>
            {open.value && (
                <ElementCreationDialog
                    open={open.value}
                    onClose={open.setFalse}
                    onSave={saveSpreadsheetColumnsConfiguration}
                    type={ElementType.SPREADSHEET_CONFIG}
                    titleId={'spreadsheet/save/dialog_title'}
                />
            )}
        </>
    );
}
