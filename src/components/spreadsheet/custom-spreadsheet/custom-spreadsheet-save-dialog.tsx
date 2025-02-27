/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ElementCreationDialog,
    ElementType,
    IElementCreationDialog,
    useSnackMessage,
    UseStateBooleanReturn,
} from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import { createSpreadsheetModel } from '../../../services/explore';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { v4 as uuid4 } from 'uuid';
import { ColumnDefinitionDto, SpreadsheetConfig } from '../config/spreadsheet.type';

export type CustomSpreadsheetSaveDialogProps = {
    tabIndex: number;
    open: UseStateBooleanReturn;
};

export default function CustomSpreadsheetSaveDialog({ tabIndex, open }: Readonly<CustomSpreadsheetSaveDialogProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const customColumns = useMemo(() => {
        return tableDefinition?.columns.reduce((acc, item) => {
            acc[item.id] = {
                uuid: item?.uuid ?? uuid4(),
                id: item.id,
                name: item.name,
                type: item.type,
                precision: item.precision,
                formula: item.formula,
                dependencies: item.dependencies?.length ? JSON.stringify(item.dependencies) : undefined,
            };
            return acc;
        }, {} as Record<string, ColumnDefinitionDto>);
    }, [tableDefinition?.columns]);

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
            {open.value && studyUuid && (
                <ElementCreationDialog
                    open={open.value}
                    onClose={open.setFalse}
                    onSave={saveSpreadsheetColumnsConfiguration}
                    type={ElementType.SPREADSHEET_CONFIG}
                    titleId={'spreadsheet/save/dialog_title'}
                    studyUuid={studyUuid}
                />
            )}
        </>
    );
}
