/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComponentResult,
    CountryAdequacy,
    ExchangePair,
    ExchangeValue,
    OverloadedEquipment,
    OverloadedEquipmentFromBack,
} from './load-flow-result.type';
import { IntlShape } from 'react-intl';
import { ColDef, ICellRendererParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { UNDEFINED_ACCEPTABLE_DURATION } from '../../utils/utils';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';
import { JSX, useEffect, useState } from 'react';
import { translateLimitNameBackToFront, translateLimitNameFrontToBack } from '../common/utils';
import {
    LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_RESULT,
    LOADFLOW_RESULT_SORT_STORE,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
} from 'utils/store-sort-filter-fields';
import { fetchAvailableFilterEnumValues } from '../../../services/study';
import { ComputingType } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import RunningStatus from 'components/utils/running-status';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import CustomAggridDurationFilter from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-duration-filter';
import {
    FilterConfig,
    FilterType as AgGridFilterType,
    numericFilterParams,
    textFilterParams,
} from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
    FilterEnumsType,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { convertDuration, formatNAValue } from 'components/custom-aggrid/utils/format-values-utils';
import { SubjectIdRendererType } from '../securityanalysis/security-analysis.type';
import { updateComputationColumnsFilters } from '../common/column-filter/update-computation-columns-filters';
import { SortParams } from '../../custom-aggrid/hooks/use-custom-aggrid-sort';
import { BranchSide } from '../../utils/constants';

export const convertSide = (side: string | undefined, intl: IntlShape): string => {
    return side === BranchSide.ONE
        ? intl.formatMessage({ id: 'Side1' })
        : side === BranchSide.TWO
          ? intl.formatMessage({ id: 'Side2' })
          : '';
};

export const FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT: Record<string, string> = {
    subjectId: 'subjectId',
    locationId: 'locationId',
    status: 'status',
    limitType: 'limitType',
    limitName: 'limitName',
    nextLimitName: 'nextLimitName',
    side: 'side',
    acceptableDuration: 'acceptableDuration',
    limit: 'limit',
    patlLimit: 'patlLimit',
    value: 'value',
    loading: 'loading',
    actualOverloadDuration: 'actualOverload',
    upComingOverloadDuration: 'upComingOverload',
    overload: 'overload',
    patlOverload: 'patlOverload',
};
export const FROM_COLUMN_TO_FIELD_LOADFLOW_RESULT: Record<string, string> = {
    connectedComponentNum: 'connectedComponentNum',
    status: 'status',
    synchronousComponentNum: 'synchronousComponentNum',
    iterationCount: 'iterationCount',
    id: 'id',
    activePowerMismatch: 'activePowerMismatch',
    distributedActivePower: 'distributedActivePower',
};

const translatedFilterParams = {
    dataType: FILTER_DATA_TYPES.TEXT,
    comparators: [FILTER_TEXT_COMPARATORS.EQUALS],
};

export const mappingFields = (index: number): Record<string, string> => {
    switch (index) {
        case 0:
        case 1:
            return FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT;

        case 2:
            return FROM_COLUMN_TO_FIELD_LOADFLOW_RESULT;
        default:
            return {};
    }
};

export const mappingTabs = (index: number): string => {
    switch (index) {
        case 0:
            return LOADFLOW_CURRENT_LIMIT_VIOLATION;
        case 1:
            return LOADFLOW_VOLTAGE_LIMIT_VIOLATION;
        case 2:
            return LOADFLOW_RESULT;
        default:
            return '';
    }
};

export const makeData = (
    overloadedEquipments: OverloadedEquipmentFromBack[],
    intl: IntlShape
): OverloadedEquipment[] => {
    return overloadedEquipments.map((overloadedEquipment) => {
        return {
            overload: overloadedEquipment.overload,
            patlOverload: overloadedEquipment.patlOverload,
            subjectId: overloadedEquipment.subjectId,
            locationId: overloadedEquipment.locationId,
            value: overloadedEquipment.value,
            actualOverloadDuration:
                overloadedEquipment.actualOverloadDuration === UNDEFINED_ACCEPTABLE_DURATION
                    ? null
                    : overloadedEquipment.actualOverloadDuration,
            upComingOverloadDuration: overloadedEquipment.upComingOverloadDuration,
            limit: overloadedEquipment.limit,
            patlLimit: overloadedEquipment.patlLimit,
            limitName: translateLimitNameBackToFront(overloadedEquipment.limitName, intl),
            nextLimitName: translateLimitNameBackToFront(overloadedEquipment.nextLimitName, intl),
            side: overloadedEquipment.side,
            limitType: overloadedEquipment.limitType,
        };
    });
};

// We can use this custom hook for fetching enums for AutoComplete filter
export const useFetchFiltersEnums = (): {
    error: boolean;
    loading: boolean;
    result: FilterEnumsType;
} => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [result, setResult] = useState<FilterEnumsType>({
        status: null,
        limitType: null,
        side: null,
    });
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    useEffect(() => {
        if (loadFlowStatus !== RunningStatus.SUCCEED || !studyUuid || !currentNode?.id || !currentRootNetworkUuid) {
            return;
        }

        const filterTypes = ['computation-status', 'limit-types', 'branch-sides'];

        const promises = filterTypes.map((filterType) =>
            fetchAvailableFilterEnumValues(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                ComputingType.LOAD_FLOW,
                filterType
            )
        );

        setLoading(true);
        Promise.all(promises)
            .then(([computationsStatusResult, limitTypesResult, branchSidesResult]) => {
                setResult({
                    status: computationsStatusResult,
                    limitType: limitTypesResult,
                    side: branchSidesResult,
                });
            })
            .catch((err) => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [loadFlowStatus, studyUuid, currentNode?.id, currentRootNetworkUuid]);

    return { loading, result, error };
};

export const convertFilterValues = (filterSelector: FilterConfig[], intl: IntlShape) => {
    return filterSelector.map((filter) => {
        switch (filter.column) {
            case 'limitName':
                return {
                    ...filter,
                    value: translateLimitNameFrontToBack(filter.value as string, intl),
                };
            default:
                return filter;
        }
    });
};
interface TableParams {
    sortParams: SortParams;
    filterParams: {
        type: AgGridFilterType;
        tab: string;
        updateFilterCallback: typeof updateComputationColumnsFilters;
    };
}

const createTableParams = (tabIndex: number): TableParams => {
    const tab = mappingTabs(tabIndex);
    return {
        sortParams: {
            table: LOADFLOW_RESULT_SORT_STORE,
            tab,
        },
        filterParams: {
            type: AgGridFilterType.Loadflow,
            tab,
            updateFilterCallback: updateComputationColumnsFilters,
        },
    };
};

const makeAgGridFloatColumn = (
    intlId: string,
    fieldId: string,
    intl: IntlShape,
    sortParams: ColumnContext['sortParams'],
    filterParams: {
        type: AgGridFilterType;
        tab: string;
    }
) => {
    return {
        headerName: intl.formatMessage({ id: intlId }),
        colId: fieldId,
        field: fieldId,
        context: {
            numeric: true,
            fractionDigits: 2,
            sortParams,
            filterComponent: CustomAggridComparatorFilter,
            filterComponentParams: {
                filterParams: {
                    ...numericFilterParams,
                    ...filterParams,
                },
            },
        },
    };
};

const createColumnContext = (
    sortParams: ColumnContext['sortParams'] | undefined,
    filterParams: any,
    filterComponent: any,
    extraFilterParams = {},
    extraComponentParams = {}
) => ({
    sortParams,
    filterComponent,
    filterComponentParams: {
        filterParams: {
            ...filterParams,
            ...extraFilterParams,
        },
        ...extraComponentParams,
    },
});

export const loadFlowCurrentViolationsColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    subjectIdRenderer: SubjectIdRendererType
): ColDef[] => {
    const { sortParams, filterParams } = createTableParams(tabIndex);

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
            colId: 'subjectId',
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            context: createColumnContext(sortParams, filterParams, CustomAggridComparatorFilter, textFilterParams),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitNameCurrentViolation' }),
            colId: 'limitName',
            field: 'limitName',
            context: createColumnContext(
                sortParams,
                filterParams,
                CustomAggridComparatorFilter,
                translatedFilterParams
            ),
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
        }),
        makeAgGridCustomHeaderColumn(makeAgGridFloatColumn('LimitLoading', 'overload', intl, sortParams, filterParams)),
        makeAgGridCustomHeaderColumn(
            makeAgGridFloatColumn('PatlLoading', 'patlOverload', intl, sortParams, filterParams)
        ),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'actualOverloadDuration' }),
            colId: 'actualOverloadDuration',
            field: 'actualOverloadDuration',
            context: createColumnContext(sortParams, filterParams, CustomAggridDurationFilter, numericFilterParams),
            valueGetter: (value: ValueGetterParams) => convertDuration(value.data.actualOverloadDuration),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'upComingOverloadDuration' }),
            colId: 'upComingOverloadDuration',
            field: 'upComingOverloadDuration',
            context: createColumnContext(sortParams, filterParams, CustomAggridDurationFilter, numericFilterParams),
            valueGetter: (value: ValueGetterParams) => {
                if (value.data.upComingOverloadDuration === null) {
                    return intl.formatMessage({ id: 'NoneUpcomingOverload' });
                } else if (value.data.upComingOverloadDuration === UNDEFINED_ACCEPTABLE_DURATION) {
                    return ' ';
                }
                return convertDuration(value.data.upComingOverloadDuration);
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'NextLimitNameCurrentViolation' }),
            colId: 'nextLimitName',
            field: 'nextLimitName',
            context: createColumnContext(
                sortParams,
                filterParams,
                CustomAggridComparatorFilter,
                translatedFilterParams
            ),
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
        }),
        makeAgGridCustomHeaderColumn(
            makeAgGridFloatColumn('CurrentViolationLimit', 'limit', intl, sortParams, filterParams)
        ),
        makeAgGridCustomHeaderColumn(
            makeAgGridFloatColumn('PatlLimitValue', 'patlLimit', intl, sortParams, filterParams)
        ),
        makeAgGridCustomHeaderColumn(
            makeAgGridFloatColumn('CurrentViolationValue', 'value', intl, sortParams, filterParams)
        ),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            colId: 'side',
            field: 'side',
            context: createColumnContext(
                sortParams,
                filterParams,
                CustomAggridAutocompleteFilter,
                { dataType: FILTER_DATA_TYPES.TEXT },
                {
                    options: filterEnums['side'] ?? [],
                    getOptionLabel: getEnumLabel,
                }
            ),
            valueGetter: (value: ValueGetterParams) => value.data.side,
            valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.value),
        }),
    ];
};

export const loadFlowVoltageViolationsColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    subjectIdRenderer: SubjectIdRendererType
): ColDef[] => {
    const { sortParams, filterParams } = createTableParams(tabIndex);

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipmentBus' }),
            colId: 'locationId',
            field: 'locationId',
            context: createColumnContext(sortParams, filterParams, CustomAggridComparatorFilter, textFilterParams),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipmentVoltageLevel' }),
            colId: 'subjectId',
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            context: createColumnContext(sortParams, filterParams, CustomAggridComparatorFilter, textFilterParams),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            colId: 'limitType',
            field: 'limitType',
            context: createColumnContext(
                sortParams,
                filterParams,
                CustomAggridAutocompleteFilter,
                { dataType: FILTER_DATA_TYPES.TEXT },
                {
                    options: filterEnums['limitType'] ?? [],
                    getOptionLabel: getEnumLabel,
                }
            ),
            valueGetter: (value: ValueGetterParams) => value.data.limitType,
            valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.value),
        }),
        makeAgGridCustomHeaderColumn(
            makeAgGridFloatColumn('VoltageViolationLimit', 'limit', intl, sortParams, filterParams)
        ),
        makeAgGridCustomHeaderColumn(
            makeAgGridFloatColumn('VoltageViolationValue', 'value', intl, sortParams, filterParams)
        ),
    ];
};

export const componentColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    statusCellRender: (cellData: ICellRendererParams) => JSX.Element
): ColDef[] => {
    const { filterParams } = createTableParams(tabIndex);

    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'connectedComponentNum' }),
            colId: 'connectedComponentNum',
            field: 'connectedComponentNum',
            context: createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'synchronousComponentNum' }),
            colId: 'synchronousComponentNum',
            field: 'synchronousComponentNum',
            context: createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'status' }),
            colId: 'status',
            field: 'status',
            context: createColumnContext(
                undefined,
                filterParams,
                CustomAggridAutocompleteFilter,
                { dataType: FILTER_DATA_TYPES.TEXT },
                {
                    options: filterEnums['status'] ?? [],
                    getOptionLabel: getEnumLabel,
                }
            ),
            valueGetter: (value: ValueGetterParams) => value.data.status,
            valueFormatter: (params: ValueFormatterParams) => getEnumLabel(params.value),
            cellRenderer: statusCellRender,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'consumptions' }),
            colId: 'consumptions',
            field: 'consumptions',
            context: {
                numeric: true,
                fractionDigits: 2,
                ...createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'generations' }),
            colId: 'generations',
            field: 'generations',
            context: {
                numeric: true,
                fractionDigits: 2,
                ...createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'exchanges' }),
            colId: 'exchanges',
            field: 'exchanges',
            context: {
                numeric: true,
                fractionDigits: 2,
                ...createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'losses' }),
            colId: 'losses',
            field: 'losses',
            context: {
                numeric: true,
                fractionDigits: 2,
                ...createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'distributedActivePower' }),
            colId: 'distributedActivePower',
            field: 'distributedActivePower',
            context: {
                numeric: true,
                fractionDigits: 2,
                ...createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, textFilterParams),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'slackBusActivePowerMismatch',
            }),
            colId: 'activePowerMismatch',
            field: 'activePowerMismatch',
            context: {
                numeric: true,
                fractionDigits: 2,
                ...createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'slackBusId' }),
            colId: 'id',
            field: 'id',
            context: createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, textFilterParams),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'iterationCount' }),
            colId: 'iterationCount',
            field: 'iterationCount',
            context: createColumnContext(undefined, filterParams, CustomAggridComparatorFilter, numericFilterParams),
        }),
    ];
};

export const countryAdequaciesColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Country' }),
            colId: 'country',
            field: 'country',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'countryAdequacyLoad' }),
            colId: 'load',
            field: 'load',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'countryAdequacyGeneration' }),
            colId: 'generation',
            field: 'generation',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'losses' }),
            colId: 'losses',
            field: 'losses',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'netPosition' }),
            colId: 'netPosition',
            field: 'netPosition',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
    ];
};

export const exchangesColumnsDefinition = (intl: IntlShape): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'borders' }),
            colId: 'countryA',
            field: 'countryA',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: '',
            colId: 'countryB',
            field: 'countryB',
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'exchange' }),
            colId: 'exchange',
            field: 'exchange',
            context: {
                numeric: true,
                fractionDigits: 2,
            },
        }),
    ];
};

export const formatComponentResult = (componentResults: ComponentResult[]) => {
    return componentResults
        ?.toSorted(
            (a, b) =>
                a.connectedComponentNum - b.connectedComponentNum ||
                a.synchronousComponentNum - b.synchronousComponentNum
        )
        .map((componentResult) => {
            return {
                componentResultUuid: componentResult.componentResultUuid,
                connectedComponentNum: componentResult.connectedComponentNum,
                synchronousComponentNum: componentResult.synchronousComponentNum,
                status: componentResult.status,
                iterationCount: componentResult.iterationCount,
                id: componentResult.slackBusResults?.map((slackBus) => slackBus.id).join(' | '),
                activePowerMismatch: componentResult.slackBusResults
                    ?.map((slackBus) => slackBus.activePowerMismatch)
                    .reduce((prev, current) => prev + current, 0),
                distributedActivePower: componentResult.distributedActivePower,
                consumptions: componentResult.consumptions,
                generations: componentResult.generations,
                exchanges: componentResult.exchanges,
                losses: componentResult.losses,
            };
        });
};

export const formatCountryAdequaciesResult = (
    countryAdequacies: CountryAdequacy[],
    translate: (countryCode: string) => string
) => {
    return countryAdequacies
        ?.map((countryAdequacyResult) => {
            return {
                countryAdequacyUuid: countryAdequacyResult.countryAdequacyUuid,
                country: translate(countryAdequacyResult.country),
                load: countryAdequacyResult.load,
                generation: countryAdequacyResult.generation,
                losses: countryAdequacyResult.losses,
                netPosition: countryAdequacyResult.netPosition,
            };
        })
        ?.sort((a, b) => a.country.localeCompare(b.country));
};

function generateExchangePairs(
    exchanges: Record<string, ExchangeValue[]>,
    translate: (countryCode: string) => string
): ExchangePair[] {
    const result: ExchangePair[] = [];

    if (exchanges !== undefined && Object.keys(exchanges).length > 0) {
        const sortedCountryKeys = Object.keys(exchanges).sort((a, b) => translate(a).localeCompare(translate(b)));
        sortedCountryKeys.forEach((country) => {
            const sortedCountryExchanges = [...exchanges[country]].sort((a, b) =>
                translate(a.country).localeCompare(translate(b.country))
            );
            const exchangeTotal = sortedCountryExchanges.reduce((sum, exchange) => sum + exchange.exchange, 0);
            result.push({
                exchangeUuid: undefined,
                countryA: translate(country),
                countryB: '',
                exchange: exchangeTotal,
            });
            sortedCountryExchanges.forEach((exchange) => {
                result.push({
                    exchangeUuid: exchange.exchangeUuid,
                    countryA: '',
                    countryB: translate(exchange.country),
                    exchange: exchange.exchange,
                });
            });
        });
    }

    return result;
}

export const formatExchangesResult = (
    exchanges: Record<string, ExchangeValue[]>,
    translate: (countryCode: string) => string
) => {
    const res: ExchangePair[] = generateExchangePairs(exchanges, translate);
    return res?.map((exchangePair) => {
        return {
            exchangeUuid: exchangePair.exchangeUuid,
            countryA: exchangePair.countryA,
            countryB: exchangePair.countryB,
            exchange: exchangePair.exchange,
        };
    });
};
