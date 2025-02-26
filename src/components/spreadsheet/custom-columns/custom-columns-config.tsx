/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import AddColumnRightLight from 'images/add_column_right_light.svg?react';
import AddColumnRightDark from 'images/add_column_right_dark.svg?react';
import { useSelector } from 'react-redux';
import { LIGHT_THEME, useStateBoolean } from '@gridsuite/commons-ui';
import CustomColumnDialog from './custom-columns-dialog';
import { spreadsheetStyles } from '../utils/style';

import { AppState } from '../../../redux/app-state.type';

export type CustomColumnsConfigProps = {
    tabIndex: number;
};

export default function CustomColumnsConfig({ tabIndex }: Readonly<CustomColumnsConfigProps>) {
    const dialogOpen = useStateBoolean(false);
    const theme = useSelector((state: AppState) => state.theme);

    return (
        <>
            <Button sx={spreadsheetStyles.spreadsheetButton} size={'small'} onClick={dialogOpen.setTrue}>
                {theme === LIGHT_THEME ? <AddColumnRightLight /> : <AddColumnRightDark />}
                <FormattedMessage id="spreadsheet/custom_column/add_columns" />
            </Button>

            <CustomColumnDialog tabIndex={tabIndex} open={dialogOpen} />
        </>
    );
}
