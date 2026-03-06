/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Box, Button, useTheme } from '@mui/material';
import { SCAFaultResult, SCAFeederResult, ShortCircuitAnalysisType } from './shortcircuit-analysis-result.type';
import {
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    RowClassParams,
    RowDataUpdatedEvent,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { useSelector } from 'react-redux';
import { AppState } from '../../../redux/reducer.type';
import {
    ComputingType,
    CustomAGGrid,
    DefaultCellRenderer,
    OverflowableText,
    unitToKiloUnit,
} from '@gridsuite/commons-ui';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/utils/custom-aggrid-header-utils';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    FilterConfig,
    FilterEnumsType,
    numericFilterParams,
    TableType,
    textFilterParams,
} from '../../../types/custom-aggrid-types';
import { mappingTabs } from './shortcircuit-analysis-result-content';
import { resultsStyles } from '../common/utils';
import { AGGRID_LOCALES } from '../../../translations/not-intl/aggrid-locales';
import { useWorkspacePanelActions } from 'components/workspace/hooks/use-workspace-panel-actions';
import { PanelType } from '../../workspace/types/workspace.types';
import { updateComputationColumnsFilters } from '../common/column-filter/update-computation-columns-filters';
import type { UUID } from 'node:crypto';
import { useAgGridInitialColumnFilters } from '../common/use-ag-grid-initial-column-filters';
import { createMultiEnumFilterParams } from '../common/column-filter/utilis';

interface ShortCircuitAnalysisResultProps {
    result: SCAFaultResult[] | undefined;
    analysisType: ShortCircuitAnalysisType;
    isFetching: boolean;
    filterEnums: FilterEnumsType;
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    goToFirstPage: () => void;
    computationSubType: string;
}

type ShortCircuitAnalysisAGGridResult =
    | ShortCircuitAnalysisResultsFaultHeader
    | ShortCircuitAnalysisResultsLimitViolation
    | ShortCircuitAnalysisResultsFeederResult;

interface ShortCircuitAnalysisResultsFaultHeader {
    faultId: string;
    elementId: string;
    voltageLevel: string;
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
    filterEnums,
    onGridColumnsChanged,
    onRowDataUpdated,
    goToFirstPage,
    computationSubType,
}) => {
    const intl = useIntl();
    const theme = useTheme();
    const { openSLD } = useWorkspacePanelActions();

    const filters = useSelector(
        (state: AppState) =>
            state.tableFilters.columnsFilters?.[TableType.ShortcircuitAnalysis]?.[computationSubType]?.columns
    );
    const voltageLevelIdRenderer = useCallback(
        (props: ICellRendererParams) => {
            const { value } = props || {};
            const onClick = () => {
                openSLD({ equipmentId: value, panelType: PanelType.SLD_VOLTAGE_LEVEL });
            };
            if (value) {
                return (
                    <Button sx={resultsStyles.sldLink} onClick={onClick}>
                        <OverflowableText text={value} />
                    </Button>
                );
            }
        },
        [openSLD]
    );

    const getEnumLabel = useCallback(
        (value: string) =>
            value
                ? intl.formatMessage({
                      id: value,
                      defaultMessage: value,
                  })
                : '',
        [intl]
    );

    const columns = useMemo(() => {
        const isAllBusesAnalysisType = analysisType === ShortCircuitAnalysisType.ALL_BUSES;

        const onlyIfIsAllBuses = <T,>(data: T, defaultData: T | undefined = {} as T) =>
            isAllBusesAnalysisType ? data : defaultData;

        const onlyIfIsOneBus = <T,>(data: T, defaultData: T | undefined = {} as T) =>
            !isAllBusesAnalysisType ? data : defaultData;

        const sortParams: ColumnContext['sortParams'] = {
            table: SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE,
            tab: mappingTabs(analysisType),
        };

        const filterParams = {
            type: TableType.ShortcircuitAnalysis,
            tab: mappingTabs(analysisType),
            updateFilterCallback: (
                agGridApi?: GridApi,
                filters?: FilterConfig[],
                colId?: string,
                studyUuid?: UUID,
                filterType?: TableType,
                filterSubType?: string
            ) =>
                updateComputationColumnsFilters(
                    agGridApi,
                    filters,
                    colId,
                    studyUuid,
                    filterType,
                    filterSubType,
                    goToFirstPage
                ),
        };

        const inputFilterParams = (
            field: string,
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

        const autocompleteFilterParams = (colId: string) => {
            return {
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        ...filterParams,
                    },
                    options: filterEnums[colId] ?? [],
                    getOptionLabel: getEnumLabel,
                },
            };
        };

        return [
            {
                ...makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({ id: 'IDNode' }),
                    colId: 'elementId',
                    field: 'elementId',
                    context: {
                        ...onlyIfIsAllBuses({ sortParams, ...inputFilterParams('elementId', textFilterParams) }),
                    },
                }),
                minWidth: 180,
            },
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'busVoltageLevel' }),
                colId: 'voltageLevel',
                field: 'voltageLevel',
                cellRenderer: voltageLevelIdRenderer,
                context: {
                    ...onlyIfIsAllBuses({ sortParams, ...inputFilterParams('voltageLevel', textFilterParams) }),
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Type' }),
                colId: 'faultType',
                field: 'faultType',
                filterParams: createMultiEnumFilterParams,
                context: {
                    ...onlyIfIsAllBuses({ sortParams, ...autocompleteFilterParams('faultType') }),
                },
                valueGetter: (value: ValueGetterParams) => value.data.faultType,
                valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.value),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Feeders' }),
                colId: 'connectableId',
                field: 'connectableId',
                context: {
                    sortParams: onlyIfIsAllBuses({ ...sortParams, isChildren: true }, sortParams),
                    ...inputFilterParams('connectableId', textFilterParams),
                },
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscKA' }),
                colId: 'current',
                field: 'current',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    sortParams,
                    ...inputFilterParams('current', numericFilterParams),
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.current),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'Side' }),
                colId: 'side',
                field: 'side',
                hide: isAllBusesAnalysisType,
                filterParams: createMultiEnumFilterParams,
                context: {
                    ...onlyIfIsOneBus({ sortParams, ...autocompleteFilterParams('side') }),
                },
                valueGetter: (value: ValueGetterParams) => value.data.side,
                valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.value),
            }),
            {
                ...makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({ id: 'LimitType' }),
                    colId: 'limitType',
                    field: 'limitType',
                    filterParams: createMultiEnumFilterParams,
                    context: {
                        ...onlyIfIsAllBuses({ sortParams, ...autocompleteFilterParams('limitType') }),
                    },
                    valueGetter: (value: ValueGetterParams) => value.data.limitType,
                    valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.value),
                }),
                minWidth: 150,
            },
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscMinKA' }),
                colId: 'limitMin',
                field: 'limitMin',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    ...onlyIfIsAllBuses({ sortParams, ...inputFilterParams('limitMin', numericFilterParams) }),
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.limitMin),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'IscMaxKA' }),
                colId: 'limitMax',
                field: 'limitMax',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    ...onlyIfIsAllBuses({ sortParams, ...inputFilterParams('limitMax', numericFilterParams) }),
                },
                valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.limitMax),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'PscMVA' }),
                colId: 'shortCircuitPower',
                field: 'shortCircuitPower',
                context: {
                    numeric: true,
                    fractionDigits: 2,
                    ...onlyIfIsAllBuses({ sortParams, ...inputFilterParams('shortCircuitPower', numericFilterParams) }),
                },
            }),
            {
                ...makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({ id: 'deltaCurrentIpMin' }),
                    colId: 'deltaCurrentIpMin',
                    field: 'deltaCurrentIpMin',
                    context: {
                        numeric: true,
                        fractionDigits: 2,
                        ...onlyIfIsAllBuses({
                            sortParams,
                            ...inputFilterParams('deltaCurrentIpMin', numericFilterParams),
                        }),
                    },
                    valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.deltaCurrentIpMin),
                }),
                minWidth: 180,
            },
            {
                ...makeAgGridCustomHeaderColumn({
                    headerName: intl.formatMessage({ id: 'deltaCurrentIpMax' }),
                    colId: 'deltaCurrentIpMax',
                    field: 'deltaCurrentIpMax',
                    context: {
                        numeric: true,
                        fractionDigits: 2,
                        ...onlyIfIsAllBuses({
                            sortParams,
                            ...inputFilterParams('deltaCurrentIpMax', numericFilterParams),
                        }),
                    },
                    valueGetter: (params: ValueGetterParams) => unitToKiloUnit(params.data?.deltaCurrentIpMax),
                }),
                minWidth: 180,
            },
            {
                field: 'linkedElementId',
                hide: true,
            },
        ];
    }, [analysisType, goToFirstPage, intl, voltageLevelIdRenderer, filterEnums, getEnumLabel]);

    const shortCircuitAnalysisStatus = useSelector(
        (state: AppState) =>
            state.computingStatus[
                analysisType === ShortCircuitAnalysisType.ALL_BUSES
                    ? ComputingType.SHORT_CIRCUIT
                    : ComputingType.SHORT_CIRCUIT_ONE_BUS
            ]
    );

    const messages = useIntlResultStatusMessages(intl, true, filters?.length > 0);

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

    const onGridReady = useAgGridInitialColumnFilters(
        TableType.ShortcircuitAnalysis,
        computationSubType,
        onGridColumnsChanged
    );
    const handleRowDataUpdated = useCallback(
        (event: RowDataUpdatedEvent) => {
            if (event?.api) {
                onRowDataUpdated(event);
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
                        limitType: lv.limitType,
                    };
                }

                const current = getCurrent(faultResult);
                const deltaCurrentIpMax = faultResult.shortCircuitLimits.deltaCurrentIpMax;
                const deltaCurrentIpMin = faultResult.shortCircuitLimits.deltaCurrentIpMin;

                rows.push({
                    faultId: fault.id,
                    elementId: fault.elementId,
                    voltageLevel: fault.voltageLevelId,
                    faultType: fault.faultType,
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
                        limitType: lv.limitType,
                        limitMin: lv.limitType === 'LOW_SHORT_CIRCUIT_CURRENT' ? lv.limit : null,
                        limitMax: lv.limitType === 'HIGH_SHORT_CIRCUIT_CURRENT' ? lv.limit : null,
                        current: lv.value,
                        elementId: '', // we have to add this otherwise it's automatically filtered
                        voltageLevel: '', // we have to add this otherwise it's automatically filtered
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
                        voltageLevel: '', // we have to add this otherwise it's automatically filtered
                        faultType: '', // we have to add this otherwise it's automatically filtered
                        limitType: '', // we have to add this otherwise it's automatically filtered
                        side: side,
                    });
                });
            });
            return rows;
        },
        [getCurrent, analysisType]
    );
    const rows = useMemo(() => {
        if (result) {
            return flattenResult(result);
        } else {
            return undefined;
        }
    }, [flattenResult, result]);

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

export default ShortCircuitAnalysisResultTable;
