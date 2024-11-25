/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Badge, Button } from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { useStateBoolean } from '@gridsuite/commons-ui';
import CustomColumnDialog from './custom-columns-dialog';
import { spreadsheetStyles } from '../utils/style';

export type CustomColumnsConfigProps = {
    indexTab: number;
};

export default function CustomColumnsConfig({ indexTab }: Readonly<CustomColumnsConfigProps>) {
    const dialogOpen = useStateBoolean(false);
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[indexTab]].columns
    );

    return (
        <>
            <Badge
                color="secondary"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                badgeContent={customColumnsDefinitions.length}
            >
                <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={dialogOpen.setTrue}>
                    <CalculateIcon />
                    <FormattedMessage id="spreadsheet/custom_column/add_columns" />
                </Button>
            </Badge>

            <CustomColumnDialog
                indexTab={indexTab}
                open={dialogOpen}
                customColumnsDefinitions={customColumnsDefinitions}
            />
        </>
    );
}
