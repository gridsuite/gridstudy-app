/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { ProcessCellForExportParams } from 'ag-grid-community';
import { useIntl } from 'react-intl';
import { TABLES_NAMES } from '../config/config-tables';
import { EDIT_COLUMN } from '../utils/constants';
import { formatNAValue } from '../utils/cell-renderers';
import { CsvDownloadProps } from './csv-export.type';

export const useCsvExport = () => {
    const intl = useIntl();

    const existsInTablesNames = function (name: string) {
        return TABLES_NAMES.findIndex((n) => n === name) !== -1;
    };

    const getCSVFilename = useCallback(
        (tableName: string) => {
            const localisedTabName = existsInTablesNames(tableName) ? intl.formatMessage({ id: tableName }) : tableName;
            return localisedTabName
                .trim()
                .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
                .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
        },
        [intl]
    );

    const downloadCSVData = useCallback(
        (props: CsvDownloadProps) => {
            const isFieldDefined = (field: string | undefined): field is string => {
                return field !== undefined;
            };
            const filteredColumnsKeys = props.columns
                .map((column) => column.field)
                .filter(isFieldDefined) // TODO should not be required with recent TS version
                .filter((field) => field !== EDIT_COLUMN);

            const processCell = (params: ProcessCellForExportParams): string => {
                if (params.column.getColId() === 'limitName') {
                    return formatNAValue(params.value, intl);
                }
                return params.value;
            };
            const prefix = props.tableNamePrefix ?? '';

            props.gridRef?.current?.api?.exportDataAsCsv({
                suppressQuotes: true,
                columnKeys: filteredColumnsKeys,
                skipColumnHeaders: props.skipColumnHeaders,
                fileName: prefix.concat(getCSVFilename(props.tableName)),
                processCellCallback: processCell,
            });
        },
        [getCSVFilename, intl]
    );

    return { downloadCSVData };
};
