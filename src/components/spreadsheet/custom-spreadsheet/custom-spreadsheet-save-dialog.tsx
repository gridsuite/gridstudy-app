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
import { SpreadsheetConfig } from '../../../types/custom-columns.types';
import { v4 as uuid4 } from 'uuid';

export type CustomSpreadsheetSaveDialogProps = {
    tabIndex: number;
    open: UseStateBooleanReturn;
};

export default function CustomSpreadsheetSaveDialog({ tabIndex, open }: Readonly<CustomSpreadsheetSaveDialogProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tabIndex]
    );
    const allReorderedTableDefinitionIndexes = useSelector((state: AppState) => state.tables.columnsNames);

    const customColumns = useMemo(() => {
        return customColumnsDefinitions.map(({ id, name, formula, dependencies }) => ({
            uuid: uuid4(),
            id,
            name,
            formula,
            dependencies,
        }));
    }, [customColumnsDefinitions]);

    const staticColumnIdToField = useMemo(() => {
        return tableDefinition.columns.reduce((acc, item) => {
            acc[item.colId!] = item.field ?? '';
            return acc;
        }, {} as Record<string, string>);
    }, [tableDefinition.columns]);

    const reorderedStaticColumnIds = useMemo(() => {
        const allReorderedColumns = allReorderedTableDefinitionIndexes[tabIndex];
        return allReorderedColumns.map((col) => col.colId);
    }, [allReorderedTableDefinitionIndexes, tabIndex]);

    const staticColumnFormulas = useMemo(() => {
        return reorderedStaticColumnIds && staticColumnIdToField
            ? reorderedStaticColumnIds.map((colId: string) => ({
                  name: colId,
                  formula: staticColumnIdToField[colId],
                  id: staticColumnIdToField[colId],
                  dependencies: [],
                  uuid: uuid4(),
              }))
            : [];
    }, [reorderedStaticColumnIds, staticColumnIdToField]);

    const saveSpreadsheetColumnsConfiguration = ({
        name,
        description,
        folderName,
        folderId,
    }: IElementCreationDialog) => {
        const spreadsheetConfig: SpreadsheetConfig = {
            sheetType: tableDefinition.type,
            customColumns: [...staticColumnFormulas, ...customColumns],
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
