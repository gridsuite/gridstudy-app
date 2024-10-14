/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage, useIntl } from 'react-intl';
import { IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackMessage, useStateBoolean } from '@gridsuite/commons-ui';
import CreateCompositeModificationDialog, {
    ICompositeCreateModificationDialog,
} from '../../dialogs/create-composite-modification-dialog';
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
    const dialogOpen = useStateBoolean(false);

    const currentType = useMemo(() => {
        const equipment: any = TABLES_DEFINITION_INDEXES.get(indexTab);
        return equipment ? equipment.type : EQUIPMENT_TYPES.SUBSTATION;
    }, [indexTab]);

    const customColumns = useMemo(() => {
        return customColumnsDefinitions.map(({ name, formula }) => ({ name, formula }));
    }, [customColumnsDefinitions]);

    const staticColumns = useMemo(() => {
        const equipment: any = TABLES_DEFINITION_INDEXES.get(indexTab);
        return equipment
            ? equipment.columns.map((x: any) => ({ name: intl.formatMessage({ id: x.id }), formula: x.field }))
            : [];
    }, [indexTab]);

    const saveSpreadsheetColumnsConfiguration = ({
        name,
        description,
        folderName,
        folderId,
    }: ICompositeCreateModificationDialog) => {
        const spreadsheetConfigObject = {
            sheetType: currentType,
            customColumns: [...staticColumns, ...customColumns],
        };

        console.log('DBG DBR save', customColumnsDefinitions, staticColumns, spreadsheetConfigObject);

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

            <CreateCompositeModificationDialog
                open={dialogOpen.value}
                onSave={saveSpreadsheetColumnsConfiguration}
                onClose={dialogOpen.setFalse}
            />
        </>
    );
}
