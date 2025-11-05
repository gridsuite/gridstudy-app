/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Box } from '@mui/material';
import { GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { DefaultCellRenderer } from '../../custom-aggrid/cell-renderers';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/utils/custom-aggrid-header-utils';
import { ComputingType } from '@gridsuite/commons-ui';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from '../../../utils/store-sort-filter-fields';
import {
    FilterType as AgGridFilterType,
    numericFilterParams,
    textFilterParams,
} from '../../../types/custom-aggrid-types';
import { ColumnContext } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { PccMinResultTableProps, SinglePccMinResultInfos } from './pcc-min-result.type';
import { AgGridReact } from 'ag-grid-react';
import { RenderTableAndExportCsv } from 'components/utils/renderTable-ExportCsv';
import { RESULTS_LOADING_DELAY } from 'components/network/constants';
import RunningStatus from 'components/utils/running-status';
import { useOpenLoaderShortWait } from 'components/dialogs/commons/handle-loader';

const PccMinResultTable: FunctionComponent<PccMinResultTableProps> = ({ result, isFetching, onFilter, filters }) => {
    const intl = useIntl();
    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);
    const gridRef = useRef<AgGridReact>(null);

    const columns = useMemo(() => {
        const data = <T,>(value: T) => value;

        const sortParams: ColumnContext['sortParams'] = {
            table: PCCMIN_ANALYSIS_RESULT_SORT_STORE,
            tab: PCCMIN_RESULT,
        };

        const filterParams = {
            type: AgGridFilterType.PccMin,
            tab: PCCMIN_RESULT,
            updateFilterCallback: onFilter,
        };

        const inputFilterParams = (
            filterDefinition: Pick<
                Required<ColumnContext>['filterComponentParams']['filterParams'],
                'dataType' | 'comparators'
            >
        ) => {
            return {
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...filterDefinition,
                        ...filterParams,
                    },
                },
            };
        };

        return [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Bus' }),
                colId: 'busId',
                field: 'busId',
                context: {
                    ...data({ sortParams, ...inputFilterParams(textFilterParams) }),
                },
                minWidth: 180,
            }),

            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Contingency' }),
                colId: 'limitingEquipment',
                field: 'limitingEquipment',
                context: {
                    ...data({ sortParams, ...inputFilterParams(textFilterParams) }),
                },

                minWidth: 180,
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'PccMinTri' }),
                colId: 'pccMinTri',
                field: 'pccMinTri',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    sortParams,
                    ...inputFilterParams(numericFilterParams),
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IccMinTri' }),
                colId: 'iccMinTri',
                field: 'iccMinTri',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    sortParams,
                    ...inputFilterParams(numericFilterParams),
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'xOhm' }),
                colId: 'x',
                field: 'x',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    sortParams,
                    ...inputFilterParams(numericFilterParams),
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'rOhm' }),
                colId: 'r',
                field: 'r',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    sortParams,
                    ...inputFilterParams(numericFilterParams),
                },
            }),
        ];
    }, [onFilter, intl]);

    const messages = useIntlResultStatusMessages(intl, true, filters.length > 0);

    const defaultColDef = useMemo(
        () => ({
            suppressMovable: true,
            resizable: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const rowsToShow = getRows(result, pccMinStatus);
    const message = getNoRowsMessage(messages, result, pccMinStatus, !isFetching);

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
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({ id: 'Results' })}
                    rows={rowsToShow}
                    overlayNoRowsTemplate={message}
                    skipColumnHeaders={false}
                    showLinearProgress={openPccMinLoader}
                />
            </Box>
        </Box>
    );
};

export default PccMinResultTable;
