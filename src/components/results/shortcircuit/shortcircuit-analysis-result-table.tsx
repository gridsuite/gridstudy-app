/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, useTheme } from '@mui/material';
import { SCAFaultResult, SCAFeederResult, ShortCircuitAnalysisType } from './shortcircuit-analysis-result.type';
import { GridReadyEvent, RowClassParams, ValueGetterParams } from 'ag-grid-community';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { AppState } from '../../../redux/reducer';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FilterEnumsType,
    FilterParams,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import { unitToKiloUnit } from '../../../utils/unit-converter';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { convertSide } from '../loadflow/load-flow-result-utils';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';

interface ShortCircuitAnalysisResultProps {
    result: SCAFaultResult[];
    analysisType: ShortCircuitAnalysisType;
    isFetching: boolean;
    filterProps: FilterParams;
    sortProps: SortPropsType;
    filterEnums: FilterEnumsType;
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (params: GridReadyEvent) => void;
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
    deltaCurrentIpMax?: number | null;
    deltaCurrentIpMin?: number | null;
}

interface ShortCircuitAnalysisResultsLimitViolation {
    current: number;
    limitType?: string | null;
    limitMin?: number | null;
    limitMax?: number | null;
}

interface ShortCircuitAnalysisResultsFeederResult {
    connectableId: string;
    current: number;
    linkedElementId: string;
    side?: string;
}

const ShortCircuitAnalysisResultTable: FunctionComponent<ShortCircuitAnalysisResultProps> = ({
    result,
    analysisType,
    isFetching,
    sortProps,
    filterProps,
    filterEnums,
    onGridColumnsChanged,
    onRowDataUpdated,
}) => {
    const intl = useIntl();
    const theme = useTheme();

    const getEnumLabel = useCallback(
        (value: string) =>
            intl.formatMessage({
                id: value,
                defaultMessage: value,
            }),
        [intl]
    );

    const columns = useMemo(() => {
        const isAllBusesAnalysisType = analysisType === ShortCircuitAnalysisType.ALL_BUSES;
        const isOneBusAnalysisType = analysisType === ShortCircuitAnalysisType.ONE_BUS;

        const sortPropsCheckedForAllBusesAnalysisType = isAllBusesAnalysisType ? sortProps : undefined;

        const filterPropsCheckedForAllBusesAnalysisType = isAllBusesAnalysisType ? filterProps : undefined;

        const filterPropsCheckedForOneBusAnalysisType = isOneBusAnalysisType ? filterProps : undefined;

        const textFilterParams = {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
        };

        const numericFilterParams = {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        };

        const autoCompleteFilterParams = {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterEnums,
        };

        return [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IDNode' }),
                id: 'elementId',
                field: 'elementId',
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...textFilterParams,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Type' }),
                id: 'faultType',
                field: 'faultType',
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        filterDataType: autoCompleteFilterParams.filterDataType,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                    filterEnums: autoCompleteFilterParams.filterEnums,
                    getEnumLabel: getEnumLabel,
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Feeders' }),
                id: 'connectableId',
                field: 'connectableId',
                sortProps: isAllBusesAnalysisType ? { ...sortProps, children: true } : sortProps,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...textFilterParams,
                        ...filterProps,
                    },
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscKA' }),
                id: 'current',
                field: 'current',
                numeric: true,
                fractionDigits: 2,
                sortProps,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...numericFilterParams,
                        ...filterProps,
                    },
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.current),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Side' }),
                id: 'side',
                field: 'side',
                sortProps,
                hide: !isOneBusAnalysisType,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        ...filterPropsCheckedForOneBusAnalysisType,
                        filterDataType: autoCompleteFilterParams.filterDataType,
                    },
                    filterEnums: autoCompleteFilterParams.filterEnums,
                    getEnumLabel: getEnumLabel,
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'LimitType' }),
                id: 'limitType',
                field: 'limitType',
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        filterDataType: autoCompleteFilterParams.filterDataType,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                    filterEnums: autoCompleteFilterParams.filterEnums,
                    getEnumLabel: getEnumLabel,
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                id: 'limitMin',
                field: 'limitMin',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...numericFilterParams,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.limitMin),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                id: 'limitMax',
                field: 'limitMax',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...numericFilterParams,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.limitMax),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                id: 'shortCircuitPower',
                field: 'shortCircuitPower',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...numericFilterParams,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                id: 'deltaCurrentIpMin',
                field: 'deltaCurrentIpMin',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...numericFilterParams,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.deltaCurrentIpMin),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                id: 'deltaCurrentIpMax',
                field: 'deltaCurrentIpMax',
                numeric: true,
                fractionDigits: 2,
                sortProps: sortPropsCheckedForAllBusesAnalysisType,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        ...numericFilterParams,
                        ...filterPropsCheckedForAllBusesAnalysisType,
                    },
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.deltaCurrentIpMax),
            }),
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [analysisType, sortProps, filterProps, filterEnums, intl, getEnumLabel]);

    const shortCircuitAnalysisStatus = useSelector(
        (state: AppState) =>
            state.computingStatus[
                analysisType === ShortCircuitAnalysisType.ALL_BUSES
                    ? ComputingType.SHORT_CIRCUIT
                    : ComputingType.SHORT_CIRCUIT_ONE_BUS
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
        (params: GridReadyEvent) => {
            if (params?.api) {
                onRowDataUpdated(params);
            }
        },
        [onRowDataUpdated]
    );

    const getCurrent = useCallback(
        (x: SCAFaultResult | SCAFeederResult) => {
            let current = NaN;
            if (analysisType === ShortCircuitAnalysisType.ALL_BUSES) {
                current = x.current;
            } else if (analysisType === ShortCircuitAnalysisType.ONE_BUS) {
                current = x.positiveMagnitude;
            }
            return current;
        },
        [analysisType]
    );

    const flattenResult = useCallback(
        (shortCircuitAnalysisResult: SCAFaultResult[]) => {
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
                    };
                }

                const current = getCurrent(faultResult);
                const deltaCurrentIpMax = faultResult.shortCircuitLimits.deltaCurrentIpMax;
                const deltaCurrentIpMin = faultResult.shortCircuitLimits.deltaCurrentIpMin;

                rows.push({
                    faultId: fault.id,
                    elementId: fault.elementId,
                    faultType: intl.formatMessage({ id: fault.faultType }),
                    shortCircuitPower: faultResult.shortCircuitPower,
                    limitMin: faultResult.shortCircuitLimits.ipMin,
                    limitMax: faultResult.shortCircuitLimits.ipMax,
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
                        limitMin: lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT' ? lv.limit : null,
                        limitMax: lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT' ? lv.limit : null,
                        current: lv.value,
                        elementId: '', // we have to add this otherwise it's automatically filtered
                        faultType: '', // we have to add this otherwise it's automatically filtered
                        connectableId: '', // we have to add this otherwise it's automatically filtered
                    });
                });
                const feederResults = faultResult.feederResults ?? [];
                feederResults.forEach((feederResult) => {
                    const current = getCurrent(feederResult);
                    const side = analysisType === ShortCircuitAnalysisType.ONE_BUS ? feederResult.side : undefined;

                    rows.push({
                        connectableId: feederResult.connectableId,
                        linkedElementId: fault.id,
                        current: current,
                        elementId: '', // we have to add this otherwise it's automatically filtered
                        faultType: '', // we have to add this otherwise it's automatically filtered
                        limitType: '', // we have to add this otherwise it's automatically filtered
                        side: convertSide(side, intl),
                    });
                });
            });
            return rows;
        },
        [getCurrent, intl, analysisType]
    );
    const rows = useMemo(() => flattenResult(result), [flattenResult, result]);

    const message = getNoRowsMessage(messages, rows, shortCircuitAnalysisStatus, !isFetching);
    const rowsToShow = getRows(rows, shortCircuitAnalysisStatus);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <CustomAGGrid
                rowData={rowsToShow}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                getRowStyle={getRowStyle}
                columnDefs={columns}
                overlayNoRowsTemplate={message}
                onRowDataUpdated={handleRowDataUpdated}
            />
        </Box>
    );
};

export default ShortCircuitAnalysisResultTable;
