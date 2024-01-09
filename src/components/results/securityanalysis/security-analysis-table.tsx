/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { SecurityAnalysisResultProps } from './security-analysis.type';
import { CustomAGGrid } from '../../custom-aggrid/custom-aggrid';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { GridReadyEvent } from 'ag-grid-community';
import { FormattedMessage, IntlShape, useIntl } from 'react-intl';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../redux/reducer.type';
import { ComputingType } from '../../computing-status/computing-type';
import { Box, IconButton } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    csvExport: {
        display: 'flex',
        alignItems: 'baseline',
    },
    grid: {
        flexGrow: '1',
    },
};

export const SecurityAnalysisTable: FunctionComponent<
    SecurityAnalysisResultProps
> = ({ rows, columnDefs, isLoadingResult, agGridProps, exportCsv }) => {
    const intl: IntlShape = useIntl();
    const resultStatusMessages = useIntlResultStatusMessages(intl);
    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
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
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={{ flexGrow: 1 }}></Box>
                <Box>
                    <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                </Box>
                <Box>
                    <IconButton
                        disabled={!rowsToShow || rowsToShow.length === 0}
                        aria-label="exportCSVButton"
                        onClick={exportCsv}
                    >
                        <GetAppIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={styles.grid}>
                <CustomAGGrid
                    rowData={rowsToShow}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    overlayNoRowsTemplate={overlayNoRowsTemplate}
                    {...agGridProps}
                />
            </Box>
        </Box>
    );
};
