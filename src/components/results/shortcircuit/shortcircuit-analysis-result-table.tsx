/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, Ref, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { unitToKiloUnit } from 'utils/rounding';
import {
    SCAFaultResult,
    ShortCircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import {
    FilterChangedEvent,
    GridReadyEvent,
    IRowNode,
    PostSortRowsParams,
    RowClassParams,
    SortChangedEvent,
} from 'ag-grid-community';
import { CustomAGGrid } from 'components/custom-aggrid/custom-aggrid';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { TextMatcherParams } from 'ag-grid-community/dist/lib/filter/provided/text/textFilter';
import { AgGridReact } from 'ag-grid-react';

interface ShortCircuitAnalysisResultProps {
    gridRef: Ref<AgGridReact>;
    result: SCAFaultResult[];
    analysisType: ShortCircuitAnalysisType;
    setFilter: (filter: any) => void;
    setSort: (sort: any) => void;
}

type ShortCircuitAnalysisAGGridResult =
    | ShortCircuitAnalysisResultsFaultHeader
    | ShortCircuitAnalysisResultsLimitViolation
    | ShortCircuitAnalysisResultsFeederResult;

interface ShortCircuitAnalysisResultsFaultHeader {
    faultId: string;
    elementId: string;
    faultType: string;
    shortCircuitPower: number;
    current: number;
    limitType?: string | null;
    limitMin?: number | null;
    limitMax?: number | null;
    limitName?: string;
    deltaCurrentIpMax?: number | null;
    deltaCurrentIpMin?: number | null;
}

interface ShortCircuitAnalysisResultsLimitViolation {
    current: number;
    limitType?: string | null;
    limitMin?: number | null;
    limitMax?: number | null;
    limitName?: string;
}

interface ShortCircuitAnalysisResultsFeederResult {
    connectableId: string;
    current: number;
    linkedElementId: string;
}

interface ColumnConfig {
    headerName?: string;
    field: string;
    isNumeric?: boolean;
    fractionDigits?: number;
    isHidden?: boolean;
    isSortable?: boolean;
}

const ShortCircuitAnalysisResultTable: FunctionComponent<
    ShortCircuitAnalysisResultProps
> = ({ gridRef, result, analysisType, setFilter, setSort }) => {
    const intl = useIntl();
    const theme = useTheme();

    const columns = useMemo(
        () => [
            {
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
            },
            {
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
                sortable: analysisType === ShortCircuitAnalysisType.ONE_BUS,
                comparator: (): number => 0, // we disable the AGGrid sort because we do it in the server
                filter:
                    analysisType === ShortCircuitAnalysisType.ONE_BUS
                        ? 'agTextColumnFilter'
                        : null,
                filterParams: {
                    debounceMs: 1200, // we don't want to fetch the back end too fast
                    filterOptions: ['contains', 'startsWith'],
                    textMatcher: (): boolean => true, // we disable the AGGrid filter because we do it in the server
                },
            },
            {
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                fractionDigits: 1,
                numeric: true,
                sortable: analysisType === ShortCircuitAnalysisType.ONE_BUS,
                comparator: (): number => 0, // we disable the AGGrid sort because we do it in the server
                filter:
                    analysisType === ShortCircuitAnalysisType.ONE_BUS
                        ? 'agNumberColumnFilter'
                        : null,
                filterParams: {
                    debounceMs: 1200, // we don't want to fetch the back end too fast
                    filterOptions: [
                        'notEqual',
                        'lessThanOrEqual',
                        'greaterThanOrEqual',
                    ],
                    // didn't find a way to disable filters here
                },
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
            },
            {
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                field: 'deltaCurrentIpMin',
                fractionDigits: 1,
                numeric: true,
            },
            {
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                field: 'deltaCurrentIpMax',
                fractionDigits: 1,
                numeric: true,
            },
            {
                field: 'linkedElementId',
                hide: true,
            },
        ],
        [intl, analysisType]
    );

    const shortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[
                analysisType === ShortCircuitAnalysisType.ALL_BUSES
                    ? ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS
                    : ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS
            ]
    );

    const messages = useIntlResultStatusMessages(intl, true);
    const groupPostSort = (
        sortedRows: IRowNode[],
        idField: string,
        linkedIdField: string
    ) => {
        // Because Map remembers the original insertion order of the keys.
        const rowsMap = new Map<string, IRowNode[]>();
        // first index by main resource idField
        sortedRows.forEach((row) => {
            if (row.data[idField] != null) {
                rowsMap.set(row.data[idField], [row]);
            }
        });

        // then index by linked resource linkedIdField
        let currentRows;
        sortedRows.forEach((row) => {
            if (row.data[idField] == null) {
                currentRows = rowsMap.get(row.data[linkedIdField]);
                if (currentRows) {
                    currentRows.push(row);
                    rowsMap.set(row.data[linkedIdField], currentRows);
                }
            }
        });
        return [...rowsMap.values()].flat();
    };

    const getRowStyle = useCallback(
        (params: RowClassParams) => {
            if (!params?.data?.linkedElementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const flattenResult = (shortCircuitAnalysisResult: SCAFaultResult[]) => {
        const rows: ShortCircuitAnalysisAGGridResult[] = [];

        shortCircuitAnalysisResult?.forEach((faultResult: SCAFaultResult) => {
            const fault = faultResult.fault;
            const limitViolations = faultResult.limitViolations ?? [];
            let firstLimitViolation;
            if (limitViolations.length > 0) {
                let lv = limitViolations[0];
                firstLimitViolation = {
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitName: lv.limitName,
                };
            }

            const current = faultResult.current;
            const deltaCurrentIpMax =
                faultResult.shortCircuitLimits.deltaCurrentIpMax;
            const deltaCurrentIpMin =
                faultResult.shortCircuitLimits.deltaCurrentIpMin;

            rows.push({
                faultId: fault.id,
                elementId: fault.elementId,
                faultType: intl.formatMessage({ id: fault.faultType }),
                shortCircuitPower: faultResult.shortCircuitPower,
                limitMin: unitToKiloUnit(faultResult.shortCircuitLimits.ipMin),
                limitMax: unitToKiloUnit(faultResult.shortCircuitLimits.ipMax),
                deltaCurrentIpMax: deltaCurrentIpMax,
                deltaCurrentIpMin: deltaCurrentIpMin,
                current: current,
                connectableId: '', // we have to add this otherwise it's automatically filtered
                ...firstLimitViolation,
            });
            limitViolations.slice(1).forEach((lv) => {
                rows.push({
                    limitType: intl.formatMessage({
                        id: lv.limitType,
                    }),
                    limitMin:
                        lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT'
                            ? unitToKiloUnit(lv.limit)
                            : null,
                    limitMax:
                        lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT'
                            ? unitToKiloUnit(lv.limit)
                            : null,
                    limitName: lv.limitName,
                    current: lv.value,
                });
            });
            const feederResults = faultResult.feederResults ?? [];
            feederResults.forEach((feederResult) => {
                let current = NaN;
                if (analysisType === ShortCircuitAnalysisType.ALL_BUSES) {
                    current = feederResult.current;
                } else if (analysisType === ShortCircuitAnalysisType.ONE_BUS) {
                    current = feederResult.positiveMagnitude;
                }

                rows.push({
                    connectableId: feederResult.connectableId,
                    linkedElementId: fault.id,
                    current: current,
                });
            });
        });
        return rows;
    };

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

    const onFilterChanged = useCallback((e: FilterChangedEvent) => {
        // to see what contains filter model : https://www.ag-grid.com/javascript-data-grid/filter-api/
        const formattedFilter = Object.entries(e.api.getFilterModel())
            .map(([column, filter]) => {
                // if a column has only one filter, then 'conditions' is not present
                if (!filter.conditions) {
                    return [
                        {
                            dataType: filter.filterType,
                            type: filter.type,
                            value: filter.filter,
                            column: column,
                        },
                    ];
                }
                // otherwise, if a column has several filters, then 'conditions' is present and contains the list of filters
                else {
                    return filter.conditions.map((condition: any) => {
                        return {
                            dataType: condition.filterType,
                            type: condition.type,
                            value: condition.filter,
                            column: column,
                        };
                    });
                }
            })
            .flat();

        setFilter(formattedFilter);
    }, []);

    const onSortChanged = useCallback((e: SortChangedEvent) => {
        // We filter and sort the array and only keep the fields we need
        // The order is important, it decides in which order the columns are sorted in the back-end
        const columnStates = e.columnApi
            .getColumnState()
            .filter(function (s) {
                return s.sort != null;
            })
            .sort(function (a, b) {
                if (a.sortIndex == null || b.sortIndex == null) {
                    return 0;
                }
                return a.sortIndex - b.sortIndex;
            })
            .map(function (s) {
                return { colId: s.colId, sort: s.sort };
            });

        setSort(columnStates);
    }, []);

    const handlePostSortRows = useCallback((params: PostSortRowsParams) => {
        const rows = params.nodes;
        Object.assign(
            rows,
            groupPostSort(rows, 'elementId', 'linkedElementId')
        );
    }, []);

    const rows = flattenResult(result);
    const message = getNoRowsMessage(
        messages,
        rows,
        shortCircuitAnalysisStatus
    );
    const rowsToShow = getRows(rows, shortCircuitAnalysisStatus);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <CustomAGGrid
                ref={gridRef}
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                enableCellTextSelection={true}
                postSortRows={handlePostSortRows}
                columnDefs={columns}
                overlayNoRowsTemplate={message}
                onFilterChanged={onFilterChanged}
                onSortChanged={onSortChanged}
            />
        </Box>
    );
};

export default ShortCircuitAnalysisResultTable;
