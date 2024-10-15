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
import { TABLES_DEFINITION_INDEXES, TABLES_NAMES } from '../utils/config-tables';
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';

export type CustomColumnsSaveProps = {
    indexTab: number;
};

export default function CustomColumnsSave({ indexTab }: Readonly<CustomColumnsSaveProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const intl = useIntl();

    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]].columns
    );
    const allReorderedTableDefinitionIndexes = useSelector(
        (state: AppState) => state.allReorderedTableDefinitionIndexes
    );
    const dialogOpen = useStateBoolean(false);

    const currentType = useMemo(() => {
        const equipment: any = TABLES_DEFINITION_INDEXES.get(indexTab);
        return equipment ? equipment.type : EQUIPMENT_TYPES.SUBSTATION;
    }, [indexTab]);

    const customColumns = useMemo(() => {
        return customColumnsDefinitions.map(({ name, formula }) => ({ name, formula }));
    }, [customColumnsDefinitions]);

    const staticColumnIdToField = useMemo(() => {
        const equipment: any = TABLES_DEFINITION_INDEXES.get(indexTab);
        return equipment ? new Map<string, string>(equipment.columns.map((c: any) => [c.id, c.field])) : null;
    }, [indexTab]);

    const reorderedStaticColumnIds = useMemo(() => {
        const allReorderedColumns = allReorderedTableDefinitionIndexes[indexTab];
        return allReorderedColumns
            ? JSON.parse(allReorderedColumns)
            : TABLES_DEFINITION_INDEXES.get(indexTab)?.columns.map((item) => item.id);
    }, [indexTab, allReorderedTableDefinitionIndexes]);

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
        const spreadsheetConfigObject = {
            sheetType: currentType,
            customColumns: [...staticColumnFormulas, ...customColumns],
        };

        createSpreadsheetModel(name, description, folderId, spreadsheetConfigObject)
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

            <ElementCreationDialog
                open={dialogOpen.value}
                onSave={saveSpreadsheetColumnsConfiguration}
                onClose={dialogOpen.setFalse}
                type={ElementType.SPREADSHEET_CONFIG}
                titleId={'spreadsheet/custom_column/save_dialog_title'}
            />
        </>
    );
}
