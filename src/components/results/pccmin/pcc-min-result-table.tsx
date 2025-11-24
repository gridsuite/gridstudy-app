/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box } from '@mui/material';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { ColumnContext, ComputingType, DefaultCellRenderer } from '@gridsuite/commons-ui';

import { getPccMinColumns, PccMinResultTableProps } from './pcc-min-result.type';
import { AgGridReact } from 'ag-grid-react';
import { RenderTableAndExportCsv } from 'components/utils/renderTable-ExportCsv';
import { RESULTS_LOADING_DELAY } from 'components/network/constants';
import RunningStatus from 'components/utils/running-status';
import { useOpenLoaderShortWait } from 'components/dialogs/commons/handle-loader';
import { FilterConfig, FilterType as AgGridFilterType } from 'types/custom-aggrid-types';

const PccMinResultTable: FunctionComponent<PccMinResultTableProps & {
    sortParams: ColumnContext['sortParams'];
    filterParamsBase: {
        type: AgGridFilterType;
        tab: string;
        updateFilterCallback: () => void;
        filters?: FilterConfig[];
        setFilters?: (newFilters: FilterConfig[]) => void;
    };
}> = ({ result, isFetching, onFilter, filters, sortParams, filterParamsBase }) => {
    const intl = useIntl();
    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);
    const gridRef = useRef<AgGridReact>(null);

    const columns = useMemo(() => getPccMinColumns(intl, sortParams, { ...filterParamsBase, updateFilterCallback: onFilter }), [intl, sortParams, filterParamsBase, onFilter]);

    const statusMessage = useIntlResultStatusMessages(intl, true, filters.length > 0);

    const pccMinDefaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            resizable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const rowsToShow = getRows(result, pccMinStatus);
    const noRowMessage = getNoRowsMessage(statusMessage, result, pccMinStatus, !isFetching);

    const openPccMinLoader = useOpenLoaderShortWait({
        isLoading: pccMinStatus === RunningStatus.RUNNING || isFetching,
        delay: RESULTS_LOADING_DELAY,
    });
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={columns}
                    defaultColDef={pccMinDefaultColDef}
                    tableName={intl.formatMessage({ id: 'Results' })}
                    rows={rowsToShow}
                    overlayNoRowsTemplate={noRowMessage}
                    skipColumnHeaders={false}
                    showLinearProgress={openPccMinLoader}
                />
            </Box>
        </Box>
    );
};

export default PccMinResultTable;
