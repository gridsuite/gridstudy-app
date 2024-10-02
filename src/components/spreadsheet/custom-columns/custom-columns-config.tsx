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
import { TABLES_NAMES } from '../utils/config-tables';
import { AppState } from '../../../redux/reducer';
import { useStateBoolean } from '@gridsuite/commons-ui';
import CustomColumnDialog from './custom-columns-dialog';

export type CustomColumnsConfigProps = {
    indexTab: number;
};

export default function CustomColumnsConfig({ indexTab }: Readonly<CustomColumnsConfigProps>) {
    const dialogOpen = useStateBoolean(false);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]].columns
    );

    return (
        <>
            <Button color="inherit" onClick={dialogOpen.setTrue}>
                <FormattedMessage id="spreadsheet/custom_column/main_button" />
                <Badge
                    color="secondary"
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    badgeContent={customColumnsDefinitions.length}
                >
                    <CalculateIcon />
                </Badge>
            </Button>
            <CustomColumnDialog
                indexTab={indexTab}
                open={dialogOpen}
                customColumnsDefinitions={customColumnsDefinitions}
            />
        </>
    );
}
