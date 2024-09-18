/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Badge, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
//import CustomColumnsDialog from './custom-columns-dialog';
import { TABLES_NAMES } from '../utils/config-tables';
import { AppState } from '../../../redux/reducer';
import { useStateBoolean, useStateNumber } from '../../../hooks/use-states';
import CustomColumnsDialog from './custom-columns-dialog';

export type CustomColumnsConfigProps = {
    indexTab: number;
};

export default function CustomColumnsConfig({ indexTab }: Readonly<CustomColumnsConfigProps>) {
    const formulaCalculating = useStateBoolean(false); //TODO
    const formulaError = useStateBoolean(false); //TODO
    const numberColumns = useStateNumber(0);
    const dialogOpen = useStateBoolean(false);
    const allDefinitions = useSelector((state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[indexTab]]);
    const uEffectNumberColumnsSetValue = numberColumns.setValue; // eslint detection
    useEffect(() => {
        uEffectNumberColumnsSetValue(allDefinitions.columns.length);
    }, [allDefinitions.columns.length, uEffectNumberColumnsSetValue]);

    /* eslint-enable react-hooks/rules-of-hooks */
    return (
        <>
            <LoadingButton
                variant="text"
                color={formulaError.value ? 'error' : 'inherit'}
                aria-label={`Open custom columns config (actual ${numberColumns.value} columns)`}
                endIcon={
                    <Badge
                        color="secondary"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        max={9}
                        badgeContent={numberColumns.value}
                    >
                        <CalculateIcon />
                    </Badge>
                }
                loadingPosition="start"
                loading={formulaCalculating.value}
                onClick={dialogOpen.setTrue}
            >
                <FormattedMessage id="spreadsheet/custom_column/main_button">
                    {(txt) => (
                        <Box component="span" data-note="anti-translate-crash">
                            {txt}
                        </Box>
                    )}
                </FormattedMessage>
            </LoadingButton>
            <CustomColumnsDialog indexTab={indexTab} open={dialogOpen} />
        </>
    );
}
