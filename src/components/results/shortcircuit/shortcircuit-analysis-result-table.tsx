/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { unitToKiloUnit } from 'utils/rounding';
import {
    ColumnFilter,
    ColumnSort,
    SCAFaultResult,
    SCAFeederResult,
    ShortCircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import {
    FilterChangedEvent,
    GridReadyEvent,
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
import { DATA_KEY_TO_SORT_KEY } from 'components/results/shortcircuit/shortcircuit-analysis-result-content';
import CustomSetFilter from 'components/utils/aggrid/custom-set-filter';
import { Option } from 'components/results/shortcircuit/shortcircuit-analysis-result.type';

interface ShortCircuitAnalysisResultProps {
    result: SCAFaultResult[];
    analysisType: ShortCircuitAnalysisType;
    updateFilter: (filter: ColumnFilter[]) => void;
    updateSort: (sort: ColumnSort[]) => void;
    isFetching: boolean;
    faultTypeOptions: Option[];
    limitViolationTypeOptions: Option[];
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

const ShortCircuitAnalysisResultTable: FunctionComponent<
    ShortCircuitAnalysisResultProps
> = ({
    result,
    analysisType,
    updateFilter,
    updateSort,
    isFetching,
    faultTypeOptions,
    limitViolationTypeOptions,
}) => {
    const intl = useIntl();
    const theme = useTheme();

    const textFilterParams = useMemo(() => {
        return {
            debounceMs: 1200, // we don't want to fetch the back end too fast
            maxNumConditions: 1,
            filterOptions: ['contains', 'startsWith'],
            textMatcher: (): boolean => true, // we disable the AGGrid filter because we do it in the server
        };
    }, []);

    const numberFilterParams = useMemo(() => {
        return {
            debounceMs: 1200, // we don't want to fetch the back end too fast
            maxNumConditions: 1,
            filterOptions: [
                'notEqual',
                'lessThanOrEqual',
                'greaterThanOrEqual',
            ],
            // didn't find a way to disable filters here
        };
    }, []);

    const columns = useMemo(
        () => [
            {
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                filter:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES
                        ? 'agTextColumnFilter'
                        : null,
                filterParams: textFilterParams,
            },
            {
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                filter:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES
                        ? CustomSetFilter
                        : null,
                filterParams: {
                    options: faultTypeOptions,
                },
            },
            {
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
                sortable: analysisType === ShortCircuitAnalysisType.ONE_BUS,
                filter:
                    analysisType === ShortCircuitAnalysisType.ONE_BUS
                        ? 'agTextColumnFilter'
                        : null,
                filterParams: textFilterParams,
            },
            {
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                fractionDigits: 1,
                numeric: true,
                sortable: true,
                filter: 'agNumberColumnFilter',
                filterParams: numberFilterParams,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                filter:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES
                        ? CustomSetFilter
                        : null,
                filterParams: {
                    options: limitViolationTypeOptions,
                },
            },
            {
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                fractionDigits: 1,
                numeric: true,
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            },
            {
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                fractionDigits: 1,
                numeric: true,
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            },
            {
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                fractionDigits: 1,
                numeric: true,
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            },
            {
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                field: 'deltaCurrentIpMin',
                fractionDigits: 1,
                numeric: true,
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            },
            {
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                field: 'deltaCurrentIpMax',
                fractionDigits: 1,
                numeric: true,
                sortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            },
            {
                field: 'linkedElementId',
                hide: true,
            },
        ],
        [
            textFilterParams,
            numberFilterParams,
            intl,
            analysisType,
            faultTypeOptions,
            limitViolationTypeOptions,
        ]
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

    const getCurrent = (x: SCAFaultResult | SCAFeederResult) => {
        let current = NaN;
        if (analysisType === ShortCircuitAnalysisType.ALL_BUSES) {
            current = x.current;
        } else if (analysisType === ShortCircuitAnalysisType.ONE_BUS) {
            current = x.positiveMagnitude;
        }
        return current;
    };

    // When we filter / sort the 'current' column in one bus, it's actually the 'fortescueCurrent.positiveMagnitude' field in the back-end
    const fromFrontColumnToBack = useCallback(
        (column: string) => {
            if (
                analysisType === ShortCircuitAnalysisType.ONE_BUS &&
                column === 'current'
            ) {
                return 'fortescueCurrent.positiveMagnitude';
            }
            return DATA_KEY_TO_SORT_KEY[column];
        },
        [analysisType]
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

            const current = getCurrent(faultResult);

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
                    elementId: '', // we have to add this otherwise it's automatically filtered
                    faultType: '', // we have to add this otherwise it's automatically filtered
                    connectableId: '', // we have to add this otherwise it's automatically filtered
                });
            });
            const feederResults = faultResult.feederResults ?? [];
            feederResults.forEach((feederResult) => {
                const current = getCurrent(feederResult);

                rows.push({
                    connectableId: feederResult.connectableId,
                    linkedElementId: fault.id,
                    current: current,
                    elementId: '', // we have to add this otherwise it's automatically filtered
                    faultType: '', // we have to add this otherwise it's automatically filtered
                    limitType: '', // we have to add this otherwise it's automatically filtered
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
            comparator: (): number => 0, // we disable the AGGrid sort because we do it in the server
        }),
        []
    );

    const onGridReady = useCallback((params: GridReadyEvent) => {
        if (params?.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const onFilterChanged = useCallback(
        (e: FilterChangedEvent) => {
            // to see what contains filter model : https://www.ag-grid.com/javascript-data-grid/filter-api/
            const formattedFilter = Object.entries(e.api.getFilterModel()).map(
                ([column, filter]) => {
                    return {
                        dataType: filter.filterType,
                        type: filter.type,
                        value: filter.filter,
                        field: fromFrontColumnToBack(column),
                    };
                }
            );

            updateFilter(formattedFilter);
        },
        [updateFilter, fromFrontColumnToBack]
    );

    const onSortChanged = useCallback(
        (e: SortChangedEvent) => {
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
                    return {
                        colId: fromFrontColumnToBack(s.colId),
                        sort: s.sort,
                    };
                });

            updateSort(columnStates);
        },
        [updateSort, fromFrontColumnToBack]
    );

    const rows = flattenResult(result);
    const message = getNoRowsMessage(
        messages,
        rows,
        shortCircuitAnalysisStatus,
        !isFetching
    );
    const rowsToShow = getRows(rows, shortCircuitAnalysisStatus);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <CustomAGGrid
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                enableCellTextSelection={true}
                columnDefs={columns}
                overlayNoRowsTemplate={message}
                onFilterChanged={onFilterChanged}
                onSortChanged={onSortChanged}
            />
        </Box>
    );
};

export default ShortCircuitAnalysisResultTable;
