/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, IconButton } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useCallback } from 'react';
import { EDIT_COLUMN } from './utils/config-tables';

const styles = {
    exportCsv: (theme) => ({
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        position: 'absolute',
        right: 0,
    }),
};

export const CsvExport = ({
    gridRef,
    columns,
    tableNamePrefix = '',
    tableName,
    disabled,
}) => {
    const intl = useIntl();

    const getCSVFilename = useCallback(() => {
        const localisedTabName = intl.formatMessage({ id: tableName });
        return localisedTabName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, [intl, tableName]);

    const downloadCSVData = useCallback(() => {
        const filteredColumnsKeys = columns
            .filter((column) => column.field !== EDIT_COLUMN)
            .map((column) => column.field);

        gridRef?.current?.api?.exportDataAsCsv({
            suppressQuotes: true,
            columnKeys: filteredColumnsKeys,
            fileName: tableNamePrefix.concat(getCSVFilename()),
        });
    }, [columns, getCSVFilename, gridRef, tableNamePrefix]);

    return (
        <Grid item sx={styles.exportCsv}>
            <span>
                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
            </span>
            <span>
                <IconButton
                    disabled={disabled}
                    aria-label="exportCSVButton"
                    onClick={downloadCSVData}
                >
                    <GetAppIcon />
                </IconButton>
            </span>
        </Grid>
    );
};
