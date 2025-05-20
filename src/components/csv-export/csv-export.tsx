/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback } from 'react';
import { ExportButton } from 'components/utils/export-button';
import { CsvExportProps } from './csv-export.type';
import { useCsvExport } from './use-csv-export';

export const CsvExport: FunctionComponent<CsvExportProps> = ({
    gridRef,
    columns,
    tableNamePrefix = '',
    tableName,
    disabled,
    skipColumnHeaders = false,
}) => {
    const { downloadCSVData } = useCsvExport();
    const download = useCallback(() => {
        downloadCSVData({ gridRef, columns, tableName, tableNamePrefix, skipColumnHeaders });
    }, [downloadCSVData, gridRef, columns, tableName, tableNamePrefix, skipColumnHeaders]);

    return <ExportButton disabled={disabled} onClick={download} />;
};
