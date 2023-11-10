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
import {
    CustomAGGrid,
    CustomColDef,
} from 'components/custom-aggrid/custom-aggrid';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { FROM_COLUMN_TO_FIELD } from 'components/results/shortcircuit/shortcircuit-analysis-result-content';
import { CustomSetFilter } from 'components/utils/aggrid/custom-set-filter';
import { Option } from 'components/results/shortcircuit/shortcircuit-analysis-result.type';
import { securityAnalysisTableNmKFilterDefinition } from '../securityanalysis/security-analysis-result-utils';
import CustomHeaderComponent, {
    FILTER_TEXT_COMPARATORS,
    FILTER_UI_TYPES,
} from '../../custom-aggrid/custom-aggrid-header';
import { ISortConfig } from '../../../hooks/use-aggrid-sort';
import {
    FilterEnums,
    FilterSelectorType,
} from '../securityanalysis/security-analysis.type';

type SortProps = {
    onSortChanged: (colKey: string, sortWay: number) => void;
    sortConfig?: ISortConfig;
};

type FilterProps = {
    updateFilter: (field: string, value: string) => void;
    filterSelector: FilterSelectorType | undefined;
};

interface ShortCircuitAnalysisResultProps {
    result: SCAFaultResult[];
    analysisType: ShortCircuitAnalysisType;
    // updateFilter: (filter: ColumnFilter[]) => void;
    // updateSort: (sort: ColumnSort[]) => void;
    isFetching: boolean;
    faultTypeOptions: Option[];
    limitViolationTypeOptions: Option[];
    sortProps: SortProps;
    filterProps: FilterProps;
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
    // updateFilter,
    // updateSort,
    isFetching,
    faultTypeOptions,
    limitViolationTypeOptions,
    sortProps,
    filterProps,
}) => {
    const intl = useIntl();
    const theme = useTheme();

    const { onSortChanged, sortConfig } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};

    const textFilterParams = useMemo(() => {
        return {
            filterUIType: FILTER_UI_TYPES.TEXT,
            filterComparators: [
                FILTER_TEXT_COMPARATORS.STARTS_WITH,
                FILTER_TEXT_COMPARATORS.CONTAINS,
            ],
            filterMaxNumConditions: 1,
        };
    }, []);

    const filtersDef = useMemo(() => {
        return [
            {
                field: 'faultType',
                options: faultTypeOptions,
            },
            {
                field: 'limitType',
                options: limitViolationTypeOptions,
            },
        ];
    }, [faultTypeOptions, limitViolationTypeOptions, intl]);

    const makeColumn = useCallback(
        ({
            headerName,
            field = '',
            isSortable = false,
            isFilterable = false,
            filterParams,
            isHidden = false,
            isNumeric = false,
        }: CustomColDef) => {
            const { options: filterOptions = [] } =
                filtersDef.find((filterDef) => filterDef?.field === field) ||
                {};

            return {
                headerName,
                field,
                hide: isHidden,
                headerTooltip: headerName,
                numeric: isNumeric,
                fractionDigits: isNumeric ? 1 : undefined,
                headerComponent: CustomHeaderComponent,
                headerComponentParams: {
                    field,
                    displayName: headerName,
                    isSortable,
                    sortConfig,
                    onSortChanged: (newSortValue: number = 0) => {
                        onSortChanged(field, newSortValue);
                    },
                    isFilterable,
                    filterParams: {
                        ...filterParams,
                        filterSelector,
                        filterOptions,
                        updateFilter,
                    },
                },
            };
        },
        [filtersDef, sortConfig, updateFilter, filterSelector, onSortChanged]
    );

    const columns = useMemo(
        () => [
            makeColumn({
                headerName: intl.formatMessage({ id: 'IDNode' }),
                field: 'elementId',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                isFilterable:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                filterParams: textFilterParams,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'Type' }),
                field: 'faultType',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                isFilterable:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'Feeders' }),
                field: 'connectableId',
                isSortable: analysisType === ShortCircuitAnalysisType.ONE_BUS,
                isFilterable:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                filterParams: textFilterParams,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'IscKA' }),
                field: 'current',
                isSortable: true,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'LimitType' }),
                field: 'limitType',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                isFilterable:
                    analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                field: 'limitMin',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                field: 'limitMax',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                field: 'shortCircuitPower',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                field: 'deltaCurrentIpMin',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                isNumeric: true,
            }),
            makeColumn({
                headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                field: 'deltaCurrentIpMax',
                isSortable: analysisType === ShortCircuitAnalysisType.ALL_BUSES,
                isNumeric: true,
            }),
            makeColumn({
                field: 'linkedElementId',
                isHidden: true,
            }),
        ],
        [analysisType, intl, makeColumn, textFilterParams]
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

    const rows = useMemo(() => flattenResult(result), [result]);
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
            />
        </Box>
    );
};

export default ShortCircuitAnalysisResultTable;
