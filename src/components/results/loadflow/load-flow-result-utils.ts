/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    LimitTypes,
    OverloadedEquipment,
    OverloadedEquipmentFromBack,
} from './load-flow-result.type';
import { IntlShape } from 'react-intl';
import {
    ColDef,
    ICellRendererParams,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import { BranchSide } from '../../utils/constants';
import {
    convertDuration,
    formatNAValue,
} from '../../spreadsheet/utils/cell-renderers';
import { UNDEFINED_ACCEPTABLE_DURATION } from '../../utils/utils';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { FilterEnumsType, FilterPropsType } from 'hooks/use-aggrid-row-filter';
import { SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FILTER_DATA_TYPES,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { useEffect, useState } from 'react';
import {
    fetchSecurityAnalysisAvailableBranchSides,
    fetchSecurityAnalysisAvailableComputationStatus,
    fetchSecurityAnalysisAvailableLimitTypes,
} from 'services/security-analysis';

const PERMANENT_LIMIT_NAME = 'permanent';

export const convertMillisecondsToMinutesSeconds = (
    durationInMilliseconds: number
): string => {
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
export const convertLimitName = (limitName: string | null, intl: IntlShape) => {
    return limitName === PERMANENT_LIMIT_NAME
        ? intl.formatMessage({ id: 'PermanentLimitName' })
        : limitName;
};

export const FROM_COLUMN_TO_FIELD: Record<string, string> = {
    subjectId: 'subjectId',
    contingencyId: 'contingencyId',
    status: 'status',
    limitType: 'limitType',
    limitName: 'limitName',
    side: 'side',
    acceptableDuration: 'acceptableDuration',
    limit: 'limit',
    value: 'value',
    loading: 'loading',
};

export const getIdType = (index: number): string => {
    return index === 0 || index === 1 ? 'subjectId' : 'contingencyId';
};

export const makeData = (
    overloadedEquipment: OverloadedEquipmentFromBack,
    intl: IntlShape
): OverloadedEquipment => {
    return {
        overload: (overloadedEquipment.value / overloadedEquipment.limit) * 100,
        name: overloadedEquipment.subjectId,
        value: overloadedEquipment.value,
        actualOverloadDuration:
            overloadedEquipment.actualOverloadDuration ===
            UNDEFINED_ACCEPTABLE_DURATION
                ? null
                : overloadedEquipment.actualOverloadDuration,
        upComingOverloadDuration: overloadedEquipment.upComingOverloadDuration,
        limit: overloadedEquipment.limit,
        limitName: convertLimitName(overloadedEquipment.limitName, intl),
        side: convertSide(overloadedEquipment.side, intl),
        limitType: overloadedEquipment.limitType,
    };
};

// We can use this custom hook for fetching enums for AutoComplete filter
export const useFetchFiltersEnums = (
    hasResult: boolean = false,
    setFilter: (value: boolean) => void
): { error: boolean; loading: boolean; result: FilterEnumsType } => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [result, setResult] = useState<FilterEnumsType>({
        status: null,
        limitType: null,
        side: null,
    });

    useEffect(() => {
        if (!hasResult) {
            const promises = [
                // We can add another fetch for other enums
                fetchSecurityAnalysisAvailableComputationStatus(),
                fetchSecurityAnalysisAvailableLimitTypes(),
                fetchSecurityAnalysisAvailableBranchSides(),
            ];

            setLoading(true);
            Promise.all(promises)
                .then(
                    ([
                        computationsStatusResult,
                        limitTypesResult,
                        branchSidesResult,
                    ]) => {
                        setResult({
                            status: computationsStatusResult,
                            limitType: limitTypesResult,
                            side: branchSidesResult,
                        });
                        setFilter(true);
                        setLoading(false);
                    }
                )
                .catch((err) => {
                    setFilter(false);
                    setError(err);
                    setLoading(false);
                });
        }
    }, [hasResult, setFilter]);

    return { loading, result, error };
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
            field: 'name',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitNameCurrentViolation' }),
            field: 'limitName',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
            valueFormatter: (params: ValueFormatterParams) =>
                formatNAValue(params.value, intl),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CurrentViolationLimit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: [
                    FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL,
                    FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL,
                    FILTER_NUMBER_COMPARATORS.NOT_EQUAL,
                ],
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CurrentViolationValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: [
                    FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL,
                    FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL,
                    FILTER_NUMBER_COMPARATORS.NOT_EQUAL,
                ],
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'overload',
            numeric: true,
            fractionDigits: 2,
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'actualOverloadDuration' }),
            field: 'actualOverloadDuration',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
            valueGetter: (value: ValueGetterParams) =>
                convertDuration(value.data.actualOverloadDuration),
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'upComingOverloadDuration' }),
            field: 'upComingOverloadDuration',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
            valueGetter: (value: ValueGetterParams) => {
                if (value.data.upComingOverloadDuration === null) {
                    return intl.formatMessage({ id: 'NoneUpcomingOverload' });
                } else if (
                    value.data.upComingOverloadDuration ===
                    UNDEFINED_ACCEPTABLE_DURATION
                ) {
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
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
    ];
};

export const formatLimitType = (limitType: string, intl: IntlShape) => {
    return limitType in LimitTypes
        ? intl.formatMessage({ id: limitType })
        : limitType;
};
export const loadFlowVoltageViolationsColumnsDefinition = (
    intl: IntlShape
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({ id: 'VoltageLevel' }),
            field: 'name',
        },
        {
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            valueFormatter: (params: ValueFormatterParams) =>
                formatLimitType(params.value, intl),
        },
        {
            headerName: intl.formatMessage({ id: 'VoltageViolationLimit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
            filter: 'agNumberColumnFilter',
        },
        {
            headerName: intl.formatMessage({ id: 'VoltageViolationValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            filter: 'agNumberColumnFilter',
        },
    ];
};

export const loadFlowResultColumnsDefinition = (
    intl: IntlShape,
    statusCellRender: (cellData: ICellRendererParams) => React.JSX.Element,
    numberRenderer: (cellData: ICellRendererParams) => React.JSX.Element
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({
                id: 'connectedComponentNum',
            }),
            field: 'connectedComponentNum',
            numeric: true,
            filter: 'agNumberColumnFilter',
        },
        {
            headerName: intl.formatMessage({
                id: 'synchronousComponentNum',
            }),
            field: 'synchronousComponentNum',
            numeric: true,
            filter: 'agNumberColumnFilter',
        },
        {
            headerName: intl.formatMessage({ id: 'status' }),
            field: 'status',
            cellRenderer: statusCellRender,
        },
        {
            headerName: intl.formatMessage({
                id: 'iterationCount',
            }),
            field: 'iterationCount',
        },
        {
            headerName: intl.formatMessage({
                id: 'slackBusId',
            }),
            field: 'slackBusId',
        },
        {
            headerName: intl.formatMessage({
                id: 'slackBusActivePowerMismatch',
            }),
            field: 'slackBusActivePowerMismatch',
            numeric: true,
            fractionDigits: 2,
            cellRenderer: numberRenderer,
            filter: 'agNumberColumnFilter',
        },
    ];
};
