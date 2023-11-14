/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import {
    ConstraintsFromContingencyItem,
    ContingenciesFromConstraintItem,
    LimitViolation,
    SecurityAnalysisNmkTableRow,
    Constraint,
    CustomColDef,
    FilterEnums,
} from './security-analysis.type';
import { IntlShape } from 'react-intl';
import {
    ColDef,
    ICellRendererParams,
    PostSortRowsParams,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import { ContingencyCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import { convertDuration } from '../loadflow/load-flow-result-utils';
import {
    FILTER_TEXT_COMPARATORS,
    FILTER_UI_TYPES,
} from '../../custom-aggrid/custom-aggrid-header';
import { fetchSecurityAnalysisAvailableComputationStatus } from '../../../services/security-analysis';

const contingencyGetterValues = (params: ValueGetterParams) => {
    if (params.data?.contingencyId && params.data?.contingencyEquipmentsIds) {
        return {
            cellValue: params.data?.contingencyId,
            tooltipValue: params.data?.contingencyEquipmentsIds.join('\n'),
        };
    }
};

export const computeLoading = (
    limitViolation: LimitViolation
): number | undefined => {
    const {
        value = 0,
        limit = 0,
        limitReduction = 0,
        limitType,
    } = limitViolation || {};
    return limitType === 'CURRENT'
        ? (100 * value) / (limit * limitReduction)
        : undefined;
};

export const flattenNmKResultsContingencies = (
    intl: IntlShape,
    result: ConstraintsFromContingencyItem[] = []
) => {
    const rows: SecurityAnalysisNmkTableRow[] = [];

    result?.forEach(
        ({
            subjectLimitViolations = [],
            contingency,
        }: ConstraintsFromContingencyItem) => {
            const { contingencyId, status, elements = [] } = contingency || {};
            rows.push({
                contingencyId,
                contingencyEquipmentsIds: elements.map((element) => element.id),
                status,
                violationCount: subjectLimitViolations.length,
            });
            subjectLimitViolations?.forEach((constraint: Constraint) => {
                const { limitViolation = {} as LimitViolation, subjectId } =
                    constraint || {};

                rows.push({
                    subjectId,
                    limitType: intl.formatMessage({
                        id: limitViolation.limitType,
                    }),
                    limit: limitViolation.limit,
                    value: limitViolation.value,
                    loading: limitViolation.loading,
                    side: limitViolation.side,
                    linkedElementId: contingencyId,
                });
            });
        }
    );

    return rows;
};

export const flattenNmKResultsConstraints = (
    intl: IntlShape,
    result: ContingenciesFromConstraintItem[] = []
) => {
    const rows: SecurityAnalysisNmkTableRow[] = [];

    result?.forEach(({ contingencies = [], subjectId }) => {
        if (!rows.find((row) => row.subjectId === subjectId)) {
            rows.push({ subjectId });

            contingencies.forEach(
                ({ contingency = {}, limitViolation = {} }) => {
                    rows.push({
                        contingencyId: contingency.contingencyId,
                        contingencyEquipmentsIds: contingency.elements?.map(
                            (element) => element.id
                        ),
                        status: contingency.status,
                        limitType: intl.formatMessage({
                            id: limitViolation.limitType,
                        }),
                        limitName: limitViolation.limitName,
                        side: limitViolation.side,
                        acceptableDuration: limitViolation.acceptableDuration,
                        limit: limitViolation.limit,
                        value: limitViolation.value,
                        loading: limitViolation.loading,
                        linkedElementId: subjectId,
                    });
                }
            );
        }
    });

    return rows;
};

export const securityAnalysisTableNColumnsDefinition = (
    intl: IntlShape
): ColDef[] => [
    {
        headerName: intl.formatMessage({ id: 'Equipment' }),
        field: 'subjectId',
        filter: 'agTextColumnFilter',
    },
    {
        headerName: intl.formatMessage({ id: 'LimitType' }),
        field: 'limitType',
        filter: 'agTextColumnFilter',
    },
    {
        headerName: intl.formatMessage({ id: 'Limit' }),
        field: 'limit',
        numeric: true,
        fractionDigits: 2,
    },
    {
        headerName: intl.formatMessage({ id: 'Value' }),
        field: 'value',
        numeric: true,
        fractionDigits: 2,
    },
    {
        headerName: intl.formatMessage({ id: 'Loading' }),
        field: 'loading',
        numeric: true,
        fractionDigits: 2,
    },
];

export const securityAnalysisTableNmKContingenciesColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: (
        cellData: ICellRendererParams
    ) => React.JSX.Element | undefined,
    makeColumn: (customColDef: CustomColDef) => any
): ColDef[] => {
    return [
        makeColumn({
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
            isSortable: true,
            isFilterable: true,
            filterParams: {
                filterUIType: FILTER_UI_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'status',
            isFilterable: true,
            isSortable: true,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitType' }),
            field: 'limitType',
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        }),
        makeColumn({
            headerName: intl.formatMessage({
                id: 'LimitAcceptableDuration',
            }),
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) =>
                convertDuration(value.data.acceptableDuration),
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            numeric: true,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            field: 'value',
            numeric: true,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            numeric: true,
        }),
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeColumn({
            field: 'linkedElementId',
            isHidden: true,
        }),
    ];
};

export const securityAnalysisTableNmKConstraintsColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: (
        cellData: ICellRendererParams
    ) => React.JSX.Element | undefined,
    makeColumn: (customColDef: CustomColDef) => any
): ColDef[] => {
    return [
        makeColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            isSortable: true,
            isFilterable: true,
            filterParams: {
                filterUIType: FILTER_UI_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'status',
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitType' }),
            field: 'limitType',
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        }),
        makeColumn({
            headerName: intl.formatMessage({
                id: 'LimitAcceptableDuration',
            }),
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) =>
                convertDuration(value.data.acceptableDuration),
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            numeric: true,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Value' }),
            field: 'value',
            numeric: true,
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            numeric: true,
        }),
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeColumn({
            field: 'linkedElementId',
            isHidden: true,
        }),
    ];
};

export const securityAnalysisTableNmKFilterDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnums = {}
) => {
    return [
        {
            field: 'status',
            options: filterEnums.computationsStatus,
        },
    ];
};

export const handlePostSortRows = (params: PostSortRowsParams) => {
    const isFromContingency = !params.nodes.find(
        (node) => Object.keys(node.data).length === 1
    );

    const agGridRows = params.nodes;
    const idField = isFromContingency ? 'contingencyId' : 'subjectId';
    const linkedElementId = 'linkedElementId';
    const isContingency = !isFromContingency;

    // Because Map remembers the original insertion order of the keys.
    const mappedRows = new Map();

    if (isContingency) {
        mappedRows.set('contingencies', []);
    }

    // first index by main resource idField
    agGridRows.forEach((row) => {
        if (row.data[idField] != null) {
            mappedRows.set(row.data[idField], [row]);
        }
    });

    // then index by linked resource linkedElementId
    let currentRows;
    agGridRows.forEach((row) => {
        if (isContingency && !row.data[linkedElementId] && !row.data[idField]) {
            currentRows = mappedRows.get('contingencies');
            if (currentRows) {
                currentRows.push(row);
                mappedRows.set('contingencies', currentRows);
            }
        } else if (row.data[idField] == null) {
            currentRows = mappedRows.get(row.data[linkedElementId]);
            if (currentRows) {
                currentRows.push(row);
                mappedRows.set(row.data[linkedElementId], currentRows);
            }
        }
    });

    return Object.assign(agGridRows, [...mappedRows.values()].flat());
};

// We can use this custom hook for fetching enums for AutoComplete filter
export const useFetchFiltersEnums = (isEmptyResult: boolean = true) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [result, setResult] = useState({
        computationsStatus: null,
    });

    useEffect(() => {
        const fetchAllData = () => {
            const promises = [
                // We can add another fetch for other enums
                fetchSecurityAnalysisAvailableComputationStatus(),
            ];

            setLoading(true);
            Promise.all(promises)
                .then(([computationsStatusResult]) => {
                    setResult({
                        computationsStatus: computationsStatusResult,
                    });
                    setLoading(false);
                })
                .catch((err) => {
                    setError(err);
                    setLoading(false);
                });
        };

        if (!isEmptyResult) {
            fetchAllData();
        }
    }, [isEmptyResult]);

    return [loading, result, error];
};

export const SECURITY_ANALYSIS_RESULT_INVALIDATIONS = [
    'securityAnalysisResult',
];

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

export enum NMK_TYPE {
    CONSTRAINTS_FROM_CONTINGENCIES = 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS = 'contingencies-from-constraints',
}

export enum RESULT_TYPE {
    N = 'N',
    NMK_LIMIT_VIOLATIONS = 'NMK_LIMIT_VIOLATIONS',
    NMK_CONTINGENCIES = 'NMK_CONTINGENCIES',
}

export const PAGE_OPTIONS = [25, 100, 500, 1000];

export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[0];
