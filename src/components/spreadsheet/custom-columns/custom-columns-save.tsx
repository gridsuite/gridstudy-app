/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackMessage, useStateBoolean } from '@gridsuite/commons-ui';
import CreateCompositeModificationDialog, {
    ICompositeCreateModificationDialog,
} from '../../dialogs/create-composite-modification-dialog';
import React from 'react';
import { createSpreadsheetModel } from '../../../services/explore';

export type CustomColumnsSaveProps = {
    indexTab: number;
};

export default function CustomColumnsSave({ indexTab }: Readonly<CustomColumnsSaveProps>) {
    const { snackInfo, snackError } = useSnackMessage();
    const dialogOpen = useStateBoolean(false);

    const saveSpreadsheetColumnsConfiguration = ({
        name,
        description,
        folderName,
        folderId,
    }: ICompositeCreateModificationDialog) => {
        var spreadsheetConfigObject = {
            id: '1580be4f-9d92-4a8c-8813-d9ed9b2cbd38',
            sheetType: 'BATTERIES',
            customColumns: [
                {
                    name: 'cust_a',
                    formula: 'country',
                },
            ],
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

            <CreateCompositeModificationDialog
                open={dialogOpen.value}
                onSave={saveSpreadsheetColumnsConfiguration}
                onClose={dialogOpen.setFalse}
            />
        </>
    );
}
