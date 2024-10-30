/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { FunctionComponent, RefObject, useCallback } from 'react';
import { ExportButton } from 'components/utils/export-button';
import { formatNAValue } from './utils/cell-renderers';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ProcessCellForExportParams } from 'ag-grid-community';
import { EDIT_COLUMN } from './utils/constants';

interface CsvExportProps {
    gridRef: RefObject<AgGridReact>;
    columns: ColDef[];
    tableName?: string;
    disabled: boolean;
    tableNamePrefix?: string;
    skipColumnHeaders?: boolean;
}

export const CsvExport: FunctionComponent<CsvExportProps> = ({
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
        const isFieldDefined = (field: string | undefined): field is string => {
            return field !== undefined;
        };
        const filteredColumnsKeys = columns
            .map((column) => column.field)
            .filter(isFieldDefined) // TODO should not be required with recent TS version
            .filter((field) => field !== EDIT_COLUMN);

        const processCell = (params: ProcessCellForExportParams): string => {
            if (params.column.getColId() === 'limitName') {
                return formatNAValue(params.value, intl);
            }
            return params.value;
        };

        gridRef?.current?.api?.exportDataAsCsv({
            suppressQuotes: true,
            columnKeys: filteredColumnsKeys,
            skipColumnHeaders: skipColumnHeaders,
            fileName: tableNamePrefix.concat(getCSVFilename()),
            processCellCallback: processCell,
        });
    }, [columns, getCSVFilename, gridRef, tableNamePrefix, skipColumnHeaders, intl]);

    return <ExportButton disabled={disabled} onClick={downloadCSVData} />;
};
