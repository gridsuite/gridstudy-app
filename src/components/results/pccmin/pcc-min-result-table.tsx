/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import { FilterType as AgGridFilterType, FilterConfig } from '../../../types/custom-aggrid-types';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SinglePccMinResultInfos } from './pcc-min-result.type';
import { AgGridReact } from 'ag-grid-react';
import { RenderTableAndExportCsv } from 'components/utils/renderTable-ExportCsv';

interface PccMinResultTableProps {
    result: SinglePccMinResultInfos[];
    isFetching: boolean;
    onFilter: () => void;
    filters: FilterConfig[];
}

const PccMinResultTable: FunctionComponent<PccMinResultTableProps> = ({ result, isFetching, onFilter, filters }) => {
    const intl = useIntl();
    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);

    const columns = useMemo(() => {
        const data = <T,>(data: T, defaultData: T | undefined = {} as T) => data;

        const sortParams: ColumnContext['sortParams'] = {
            table: PCCMIN_ANALYSIS_RESULT_SORT_STORE,
            tab: PCCMIN_RESULT,
        };

        const filterParams = {
            type: AgGridFilterType.PccMin,
            tab: PCCMIN_RESULT,
            updateFilterCallback: onFilter,
        };

        const textFilterParams = {
            dataType: FILTER_DATA_TYPES.TEXT,
            comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
        };

        const numericFilterParams = {
            dataType: FILTER_DATA_TYPES.NUMBER,
            comparators: Object.values(FILTER_NUMBER_COMPARATORS),
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
            {
                ...makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({ id: 'Bus' }),
                    colId: 'busId',
                    field: 'busId',
                    context: {
                        ...data({ sortParams, ...inputFilterParams(textFilterParams) }),
                    },
                }),
                minWidth: 180,
            },
            {
                ...makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({ id: 'Contingency' }),
                    colId: 'limitingEquipment',
                    field: 'limitingEquipment',
                    context: {
                        ...data({ sortParams, ...inputFilterParams(textFilterParams) }),
                    },
                }),
                minWidth: 180,
            },
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

    const onGridReady = useCallback((params: GridReadyEvent) => {
        if (params?.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const onRowDataUpdated = useCallback((params: RowDataUpdatedEvent) => {
        params.api.sizeColumnsToFit();
    }, []);

    const rows: SinglePccMinResultInfos[] = useMemo(() => {
        return result;
    }, [result]);
    const message = getNoRowsMessage(messages, rows, pccMinStatus, !isFetching);
    const rowsToShow = getRows(rows, pccMinStatus);
    const gridRef = useRef<AgGridReact>(null);

    return (
        <Box sx={{ flexGrow: 3 }}>
            <RenderTableAndExportCsv
                gridRef={gridRef}
                columns={columns}
                defaultColDef={defaultColDef}
                tableName={intl.formatMessage({
                    id: 'Results',
                })}
                rows={rowsToShow}
                onRowDataUpdated={onRowDataUpdated}
                onGridReady={onGridReady}
                overlayNoRowsTemplate={message}
                skipColumnHeaders={false}
            />
        </Box>
    );
};

export default PccMinResultTable;
