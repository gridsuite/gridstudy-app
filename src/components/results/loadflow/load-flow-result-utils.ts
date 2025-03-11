/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentResult, LimitTypes, OverloadedEquipment, OverloadedEquipmentFromBack } from './load-flow-result.type';
import { IntlShape } from 'react-intl';
import { ColDef, ICellRendererParams, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import { BranchSide } from '../../utils/constants';
import { UNDEFINED_ACCEPTABLE_DURATION } from '../../utils/utils';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { useEffect, useState } from 'react';
import { translateLimitNameBackToFront, translateLimitNameFrontToBack } from '../common/utils';
import {
    LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_RESULT,
    LOADFLOW_RESULT_SORT_STORE,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
} from 'utils/store-sort-filter-fields';
import { fetchAvailableFilterEnumValues } from '../../../services/study';
import computingType, { ComputingType } from '../../computing-status/computing-type';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import RunningStatus from 'components/utils/running-status';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import CustomAggridDurationFilter from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-duration-filter';
import { FilterConfig, FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { convertDuration, formatNAValue } from 'components/spreadsheet/utils/equipment-table-utils';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FilterEnumsType,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';

export const convertSide = (side: string | undefined, intl: IntlShape) => {
    return side === BranchSide.ONE
        ? intl.formatMessage({ id: 'Side1' })
        : side === BranchSide.TWO
        ? intl.formatMessage({ id: 'Side2' })
        : undefined;
};

export const FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT: Record<string, string> = {
    subjectId: 'subjectId',
    locationId: 'locationId',
    status: 'status',
    limitType: 'limitType',
    limitName: 'limitName',
    side: 'side',
    acceptableDuration: 'acceptableDuration',
    limit: 'limit',
    value: 'value',
    loading: 'loading',
    actualOverloadDuration: 'actualOverload',
    upComingOverloadDuration: 'upComingOverload',
    overload: 'overload',
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

const textFilterParams = {
    dataType: FILTER_DATA_TYPES.TEXT,
    comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
};

const translatedFilterParams = {
    dataType: FILTER_DATA_TYPES.TEXT,
    comparators: [FILTER_TEXT_COMPARATORS.EQUALS],
};

const numericFilterParams = {
    dataType: FILTER_DATA_TYPES.NUMBER,
    comparators: Object.values(FILTER_NUMBER_COMPARATORS),
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
            subjectId: overloadedEquipment.subjectId,
            locationId: overloadedEquipment.locationId,
            value: overloadedEquipment.value,
            actualOverloadDuration:
                overloadedEquipment.actualOverloadDuration === UNDEFINED_ACCEPTABLE_DURATION
                    ? null
                    : overloadedEquipment.actualOverloadDuration,
            upComingOverloadDuration: overloadedEquipment.upComingOverloadDuration,
            limit: overloadedEquipment.limit,
            limitName: translateLimitNameBackToFront(overloadedEquipment.limitName, intl),
            side: convertSide(overloadedEquipment.side, intl),
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
    const [loading, setLoading] = useState(true);
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
                computingType.LOAD_FLOW,
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

export const loadFlowCurrentViolationsColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number
): ColDef[] => {
    const sortParams: ColumnContext['sortParams'] = {
        table: LOADFLOW_RESULT_SORT_STORE,
        tab: mappingTabs(tabIndex),
    };
    const filterParams = {
        type: AgGridFilterType.Loadflow,
        tab: mappingTabs(tabIndex),
    };
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
            colId: 'subjectId',
            field: 'subjectId',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...filterParams, ...textFilterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitNameCurrentViolation' }),
            colId: 'limitName',
            field: 'limitName',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...filterParams, ...translatedFilterParams } },
            },
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
            colId: 'limit',
            field: 'limit',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            colId: 'overload',
            field: 'overload',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'actualOverloadDuration' }),
            colId: 'actualOverloadDuration',
            field: 'actualOverloadDuration',
            context: {
                sortParams,
                filterComponent: CustomAggridDurationFilter,
                filterComponentParams: {
                    filterParams: {
                        ...filterParams,
                        ...numericFilterParams,
                    },
                },
            },
            valueGetter: (value: ValueGetterParams) => convertDuration(value.data.actualOverloadDuration),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'upComingOverloadDuration' }),
            colId: 'upComingOverloadDuration',
            field: 'upComingOverloadDuration',
            context: {
                sortParams,
                filterComponent: CustomAggridDurationFilter,
                filterComponentParams: {
                    filterParams: {
                        ...filterParams,
                        ...numericFilterParams,
                    },
                },
            },
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
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            colId: 'side',
            field: 'side',
            context: {
                sortParams,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        ...filterParams,
                    },
                    options: filterEnums['side'] ?? [],
                    getOptionLabel: getEnumLabel,
                },
            },
        }),
    ];
};

export const formatLimitType = (limitType: string, intl: IntlShape) => {
    return limitType in LimitTypes ? intl.formatMessage({ id: limitType }) : limitType;
};
export const loadFlowVoltageViolationsColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number
): ColDef[] => {
    const sortParams: ColumnContext['sortParams'] = {
        table: LOADFLOW_RESULT_SORT_STORE,
        tab: mappingTabs(tabIndex),
    };
    const filterParams = {
        type: AgGridFilterType.Loadflow,
        tab: mappingTabs(tabIndex),
    };
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
            colId: 'locationId',
            field: 'locationId',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...filterParams, ...textFilterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            colId: 'limitType',
            field: 'limitType',
            context: {
                sortParams,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        ...filterParams,
                    },
                    options: filterEnums['limitType'] ?? [],
                    getOptionLabel: getEnumLabel,
                },
            },
            valueGetter: (value: ValueGetterParams) => {
                return formatLimitType(value.data.limitType, intl);
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'VoltageViolationLimit' }),
            colId: 'limit',
            field: 'limit',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
    ];
};

export const loadFlowResultColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    statusCellRender: (cellData: ICellRendererParams) => React.JSX.Element,
    numberRenderer: (cellData: ICellRendererParams) => React.JSX.Element
): ColDef[] => {
    const sortParams: ColumnContext['sortParams'] = {
        table: LOADFLOW_RESULT_SORT_STORE,
        tab: mappingTabs(tabIndex),
    };
    const filterParams = {
        type: AgGridFilterType.Loadflow,
        tab: mappingTabs(tabIndex),
    };
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'connectedComponentNum' }),
            colId: 'connectedComponentNum',
            field: 'connectedComponentNum',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'synchronousComponentNum' }),
            colId: 'synchronousComponentNum',
            field: 'synchronousComponentNum',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'status' }),
            colId: 'status',
            field: 'status',
            context: {
                sortParams,
                filterComponent: CustomAggridAutocompleteFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        ...filterParams,
                    },
                    options: filterEnums['status'] ?? [],
                    getOptionLabel: getEnumLabel,
                },
            },
            cellRenderer: statusCellRender,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'iterationCount' }),
            colId: 'iterationCount',
            field: 'iterationCount',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'slackBusId' }),
            colId: 'id',
            field: 'id',
            context: {
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...textFilterParams, ...filterParams } },
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
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: { filterParams: { ...numericFilterParams, ...filterParams } },
            },
            cellRenderer: numberRenderer,
        }),
    ];
};

export const formatComponentResult = (componentResults: ComponentResult[]) => {
    return componentResults?.map((componentResult) => {
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
        };
    });
};
