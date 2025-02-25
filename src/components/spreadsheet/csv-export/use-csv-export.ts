/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { ProcessCellForExportParams } from 'ag-grid-community';
import { useIntl } from 'react-intl';
import { CsvDownloadProps } from './csv-export.type';
import { formatNAValue } from '../utils/equipment-table-utils';

export const useCsvExport = () => {
    const intl = useIntl();

    const getCSVFilename = useCallback((tableName: string) => {
        return tableName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, []);

    const downloadCSVData = useCallback(
        (props: CsvDownloadProps) => {
            const hasColId = (colId: string | undefined): colId is string => {
                return colId !== undefined;
            };

            const processCell = (params: ProcessCellForExportParams): string => {
                if (params.column.getColId() === 'limitName') {
                    return formatNAValue(params.value, intl);
                }
                return params.value;
            };
            const prefix = props.tableNamePrefix ?? '';

            props.gridRef?.current?.api?.exportDataAsCsv({
                suppressQuotes: true,
                columnKeys: props.columns.map((col) => col.colId).filter(hasColId),
                skipColumnHeaders: props.skipColumnHeaders,
                processHeaderCallback: (params) =>
                    params.column.getColDef().headerComponentParams?.displayName ?? params.column.getColId(),
                fileName: prefix.concat(getCSVFilename(props.tableName)),
                processCellCallback: processCell,
            });
        },
        [getCSVFilename, intl]
    );

    return { downloadCSVData };
};
