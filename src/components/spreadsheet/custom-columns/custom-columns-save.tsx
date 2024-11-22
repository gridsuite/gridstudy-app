/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import { IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { ElementType, useSnackMessage, useStateBoolean } from '@gridsuite/commons-ui';
import ElementCreationDialog, { IElementCreationDialog } from '../../dialogs/element-creation-dialog';
import { useMemo } from 'react';
import { createSpreadsheetModel } from '../../../services/explore';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { SpreadsheetConfig } from '../../../types/custom-columns.types';

export type CustomColumnsSaveProps = {
    tabIndex: number;
};

export default function CustomColumnsSave({ tabIndex }: Readonly<CustomColumnsSaveProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const intl = useIntl();

    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const tablesDefinitionIndexes = useSelector((state: AppState) => state.tables.definitionIndexes);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[tabIndex]].columns
    );
    const allReorderedTableDefinitionIndexes = useSelector(
        (state: AppState) => state.allReorderedTableDefinitionIndexes
    );
    const dialogOpen = useStateBoolean(false);

    const currentType = useMemo(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? equipment.type : EQUIPMENT_TYPES.SUBSTATION;
    }, [tabIndex, tablesDefinitionIndexes]);

    const customColumns = useMemo(() => {
        return customColumnsDefinitions.map(({ name, formula }) => ({ name, formula }));
    }, [customColumnsDefinitions]);

    const staticColumnIdToField = useMemo(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? new Map<string, string>(equipment.columns.map((c) => [c.id, c.field ?? ''])) : null;
    }, [tabIndex, tablesDefinitionIndexes]);

    const reorderedStaticColumnIds = useMemo(() => {
        const allReorderedColumns = allReorderedTableDefinitionIndexes[tabIndex];
        return allReorderedColumns
            ? JSON.parse(allReorderedColumns)
            : tablesDefinitionIndexes.get(tabIndex)?.columns.map((item) => item.id);
    }, [allReorderedTableDefinitionIndexes, tabIndex, tablesDefinitionIndexes]);

    const staticColumnFormulas = useMemo(() => {
        return reorderedStaticColumnIds && staticColumnIdToField
            ? reorderedStaticColumnIds.map((colId: string) => ({
                  name: intl.formatMessage({ id: colId }),
                  formula: staticColumnIdToField.get(colId),
              }))
            : [];
    }, [reorderedStaticColumnIds, staticColumnIdToField, intl]);

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
                    headerId: 'spreadsheet/custom_column/save_confirmation_message',
                    headerValues: {
                        folderName: folderName,
                    },
                });
            })
            .catch((errmsg) => {
                snackError({
                    messageTxt: errmsg,
                    headerId: 'spreadsheet/custom_column/save_error_message',
                });
            });
    };

    return (
        <>
            <span>
                <FormattedMessage id="spreadsheet/custom_column/save_columns" />
            </span>
            <IconButton aria-label="dialog" onClick={dialogOpen.setTrue}>
                <SaveIcon />
            </IconButton>

            {dialogOpen.value && (
                <ElementCreationDialog
                    open={dialogOpen.value}
                    onSave={saveSpreadsheetColumnsConfiguration}
                    onClose={dialogOpen.setFalse}
                    type={ElementType.SPREADSHEET_CONFIG}
                    titleId={'spreadsheet/custom_column/save_dialog_title'}
                />
            )}
        </>
    );
}
