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
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { SpreadsheetConfig } from '../../../types/custom-columns.types';

export type CustomSpreadsheetSaveDialogProps = {
    tabIndex: number;
    open: UseStateBooleanReturn;
};

export default function CustomSpreadsheetSaveDialog({ tabIndex, open }: Readonly<CustomSpreadsheetSaveDialogProps>) {
    const { snackInfo, snackError } = useSnackMessage();

    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const tablesDefinitionIndexes = useSelector((state: AppState) => state.tables.definitionIndexes);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[tabIndex]].columns
    );
    const allReorderedTableDefinitionIndexes = useSelector(
        (state: AppState) => state.allReorderedTableDefinitionIndexes
    );

    const currentType = useMemo(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? equipment.type : EQUIPMENT_TYPES.SUBSTATION;
    }, [tabIndex, tablesDefinitionIndexes]);

    const customColumns = useMemo(() => {
        return customColumnsDefinitions.map(({ id, name, formula, dependencies }) => ({
            id,
            name,
            formula,
            dependencies: JSON.stringify(dependencies),
        }));
    }, [customColumnsDefinitions]);

    const staticColumnIdToField = useMemo(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? new Map<string, string>(equipment.columns.map((c) => [c.colId!, c.field ?? ''])) : null;
    }, [tabIndex, tablesDefinitionIndexes]);

    const reorderedStaticColumnIds = useMemo(() => {
        const allReorderedColumns = allReorderedTableDefinitionIndexes[tabIndex];
        return allReorderedColumns
            ? JSON.parse(allReorderedColumns)
            : tablesDefinitionIndexes.get(tabIndex)?.columns.map((item) => item.colId);
    }, [allReorderedTableDefinitionIndexes, tabIndex, tablesDefinitionIndexes]);

    const staticColumnFormulas = useMemo(() => {
        return reorderedStaticColumnIds && staticColumnIdToField
            ? reorderedStaticColumnIds.map((colId: string) => ({
                  name: colId,
                  formula: staticColumnIdToField.get(colId),
                  id: staticColumnIdToField.get(colId),
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
            sheetType: currentType,
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
