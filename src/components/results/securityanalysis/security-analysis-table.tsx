/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import { SecurityAnalysisResultProps } from './security-analysis.type';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { GridReadyEvent } from 'ag-grid-community';
import { IntlShape, useIntl } from 'react-intl';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ComputingType } from '../../computing-status/computing-type';
import { CustomAGGrid } from '@gridsuite/commons-ui';

export const SecurityAnalysisTable: FunctionComponent<SecurityAnalysisResultProps> = ({
    rows,
    columnDefs,
    isLoadingResult,
    agGridProps,
}) => {
    const intl: IntlShape = useIntl();
    const resultStatusMessages = useIntlResultStatusMessages(intl);
    const securityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );
    const rowsToShow = getRows(rows, securityAnalysisStatus);

    const overlayNoRowsTemplate = getNoRowsMessage(
        resultStatusMessages,
        rows,
        securityAnalysisStatus,
        !isLoadingResult
    );

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    const defaultColDef = useMemo(
        () => ({
            resizable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            suppressMovable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
            comparator: (): number => 0, // we disable the AGGrid sort because we do it in the server
        }),
        []
    );

    return (
        <CustomAGGrid
            rowData={rowsToShow}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            overlayNoRowsTemplate={overlayNoRowsTemplate}
            {...agGridProps}
        />
    );
};
