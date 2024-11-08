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
import { convertDuration, formatNAValue } from '../../spreadsheet/utils/cell-renderers';
import { UNDEFINED_ACCEPTABLE_DURATION } from '../../utils/utils';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FilterEnumsType,
    FilterPropsType,
    FilterSelectorType,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { useEffect, useState } from 'react';
import { translateLimitNameBackToFront, translateLimitNameFrontToBack } from '../common/utils';
import {
    LOADFLOW_CURRENT_LIMIT_VIOLATION,
    LOADFLOW_RESULT,
    LOADFLOW_VOLTAGE_LIMIT_VIOLATION,
} from 'utils/store-sort-filter-fields';
import { fetchAvailableFilterEnumValues } from '../../../services/study';
import computingType, { ComputingType } from '../../computing-status/computing-type';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import RunningStatus from 'components/utils/running-status';

export const convertMillisecondsToMinutesSeconds = (durationInMilliseconds: number): string => {
    const durationInSeconds = Math.floor(durationInMilliseconds / 1000);

    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    if (seconds === 0) {
        return minutes + "'";
    }

    if (minutes === 0) {
        return seconds + '"';
    }

    return minutes + "' " + seconds + '"';
};

export const convertSide = (side: string | undefined, intl: IntlShape) => {
    return side === BranchSide.ONE
        ? intl.formatMessage({ id: 'Side1' })
        : side === BranchSide.TWO
        ? intl.formatMessage({ id: 'Side2' })
        : undefined;
};

export const FROM_COLUMN_TO_FIELD_LIMIT_VIOLATION_RESULT: Record<string, string> = {
    subjectId: 'subjectId',
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
    filterDataType: FILTER_DATA_TYPES.TEXT,
    filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
};

const translatedFilterParams = {
    filterDataType: FILTER_DATA_TYPES.TEXT,
    filterComparators: [FILTER_TEXT_COMPARATORS.EQUALS],
};

const numericFilterParams = {
    filterDataType: FILTER_DATA_TYPES.NUMBER,
    filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
};

export const getIdType = (index: number): string => {
    switch (index) {
        case 0:
            return 'overload';
        case 1:
            return 'subjectId';
        case 2:
            return 'connectedComponentNum';
        default:
            return '';
    }
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
            value: overloadedEquipment.value,
            actualOverloadDuration:
                // @ts-expect-error TS2367: This comparison appears to be unintentional because the types 300 and 2147483647 have no overlap. => never true
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
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    useEffect(() => {
        if (loadFlowStatus !== RunningStatus.SUCCEED) {
            return;
        }

        const filterTypes = ['computation-status', 'limit-types', 'branch-sides'];

        const promises = filterTypes.map((filterType) =>
            fetchAvailableFilterEnumValues(studyUuid, currentNode?.id, computingType.LOAD_FLOW, filterType)
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
    }, [loadFlowStatus, studyUuid, currentNode?.id]);

    return { loading, result, error };
};

export const convertFilterValues = (filterSelector: FilterSelectorType[], intl: IntlShape) => {
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
    sortProps: SortPropsType,
    filterProps: FilterPropsType,
    filterEnums: FilterEnumsType
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
            field: 'subjectId',
            sortProps,
            filterProps,
            filterParams: textFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitNameCurrentViolation' }),
            field: 'limitName',
            sortProps,
            filterProps,
            filterParams: translatedFilterParams,
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'overload',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'actualOverloadDuration' }),
            field: 'actualOverloadDuration',
            sortProps,
            filterProps,
            filterParams: {
                ...numericFilterParams,
                isDuration: true,
            },
            valueGetter: (value: ValueGetterParams) => convertDuration(value.data.actualOverloadDuration),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'upComingOverloadDuration' }),
            field: 'upComingOverloadDuration',
            sortProps,
            filterProps,
            filterParams: {
                ...numericFilterParams,
                isDuration: true,
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
            field: 'side',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
    ];
};

export const formatLimitType = (limitType: string, intl: IntlShape) => {
    return limitType in LimitTypes ? intl.formatMessage({ id: limitType }) : limitType;
};
export const loadFlowVoltageViolationsColumnsDefinition = (
    intl: IntlShape,
    sortProps: SortPropsType,
    filterProps: FilterPropsType,
    filterEnums: FilterEnumsType
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
            field: 'subjectId',
            sortProps,
            filterProps,
            filterParams: textFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
            valueGetter: (value: ValueGetterParams) => {
                return formatLimitType(value.data.limitType, intl);
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'VoltageViolationLimit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
    ];
};

export const loadFlowResultColumnsDefinition = (
    intl: IntlShape,
    sortProps: SortPropsType,
    filterProps: FilterPropsType,
    filterEnums: FilterEnumsType,
    statusCellRender: (cellData: ICellRendererParams) => React.JSX.Element,
    numberRenderer: (cellData: ICellRendererParams) => React.JSX.Element
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'connectedComponentNum' }),
            field: 'connectedComponentNum',
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'synchronousComponentNum' }),
            field: 'synchronousComponentNum',
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'status' }),
            field: 'status',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
            cellRenderer: statusCellRender,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'iterationCount' }),
            field: 'iterationCount',
            sortProps,
            filterProps,
            filterParams: numericFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'slackBusId' }),
            field: 'id',
            filterProps,
            filterParams: textFilterParams,
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'slackBusActivePowerMismatch',
            }),
            field: 'activePowerMismatch',
            numeric: true,
            fractionDigits: 2,
            filterProps,
            filterParams: numericFilterParams,
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
