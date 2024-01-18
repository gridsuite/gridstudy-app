/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import GetAppIcon from '@mui/icons-material/GetApp';
import { useCallback } from 'react';
import { EDIT_COLUMN } from './utils/config-tables';
import { formatNAValue } from './utils/cell-renderers';

export const CsvExport = ({
    gridRef,
    columns,
    tableNamePrefix = '',
    tableName,
    disabled,
    skipColumnHeaders = false,
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

        const processData = () => {
            const gridData =
                gridRef?.current?.api
                    ?.getModel()
                    ?.rowsToDisplay.map((node) => node.data) || [];
            Object.keys(gridData).forEach((item) => {
                gridData[item].limitName = formatNAValue(
                    gridData[item].limitName,
                    intl
                );
            });
            return gridData;
        };

        gridRef?.current?.api?.exportDataAsCsv({
            suppressQuotes: true,
            columnKeys: filteredColumnsKeys,
            skipColumnHeaders: skipColumnHeaders,
            fileName: tableNamePrefix.concat(getCSVFilename()),
            rowData: processData(),
        });
    }, [
        columns,
        getCSVFilename,
        gridRef,
        tableNamePrefix,
        skipColumnHeaders,
        intl,
    ]);

    return (
        <>
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
        </>
    );
};
