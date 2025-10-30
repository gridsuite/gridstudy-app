/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box } from '@mui/material';
import { GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer';
import { DefaultCellRenderer } from '../../custom-aggrid/cell-renderers';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/utils/custom-aggrid-header-utils';
import { CustomAGGrid, ComputingType } from '@gridsuite/commons-ui';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from '../../../utils/store-sort-filter-fields';
import { FilterType as AgGridFilterType, FilterConfig } from '../../../types/custom-aggrid-types';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';
import { SinglePccMinResultInfos } from './pcc-min-result.type';

interface PccMinResultTableProps {
    result: SinglePccMinResultInfos[];
    isFetching: boolean;
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    onFilter: () => void;
    filters: FilterConfig[];
    openVoltageLevelDiagram?: (id: string) => void;
}

const PccMinResultTable: FunctionComponent<PccMinResultTableProps> = ({
    result,
    isFetching,
    onGridColumnsChanged,
    onRowDataUpdated,
    onFilter,
    filters,
}) => {
    const intl = useIntl();

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

    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);

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

    const onGridReady = useCallback(
        (params: GridReadyEvent) => {
            if (params?.api) {
                params.api.sizeColumnsToFit();
                onGridColumnsChanged && onGridColumnsChanged(params);
            }
        },
        [onGridColumnsChanged]
    );

    const handleRowDataUpdated = useCallback(
        (event: RowDataUpdatedEvent) => {
            if (event?.api) {
                onRowDataUpdated(event);
            }
        },
        [onRowDataUpdated]
    );

    const rows: SinglePccMinResultInfos[] = useMemo(() => {
        return result;
    }, [result]);

    const message = getNoRowsMessage(messages, rows, pccMinStatus, !isFetching);
    const rowsToShow = getRows(rows, pccMinStatus);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <CustomAGGrid
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                columnDefs={columns}
                overlayNoRowsTemplate={message}
                onRowDataUpdated={handleRowDataUpdated}
                overrideLocales={AGGRID_LOCALES}
                onModelUpdated={({ api }) => {
                    if (api.getDisplayedRowCount()) {
                        api.hideOverlay();
                    } else {
                        api.showNoRowsOverlay();
                    }
                }}
            />
        </Box>
    );
};

export default PccMinResultTable;
