/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import {
    ConstraintsFromContingencyItem,
    ContingenciesFromConstraintItem,
    Contingency,
    LimitViolation,
    SecurityAnalysisNmkTableRow,
    subjectLimitViolations,
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

const contingencyGetterValues = (params: ValueGetterParams) => {
    if (params.data?.contingencyId && params.data?.contingencyEquipmentsIds) {
        return {
            cellValue: params.data?.contingencyId,
            tooltipValue: params.data?.contingencyEquipmentsIds.join('\n'),
        };
    }
};

export const computeLoading = (
    limitViolation: LimitViolation | subjectLimitViolations | Contingency
): number | undefined => {
    return (limitViolation.loading =
        limitViolation.limitType === 'CURRENT'
            ? (100 * limitViolation.value) /
              (limitViolation.limit *
                  (limitViolation as LimitViolation).limitReduction)
            : undefined);
};

export const flattenNmKResultsContingencies = (
    intl: IntlShape,
    result: ConstraintsFromContingencyItem[] = []
) => {
    const rows: SecurityAnalysisNmkTableRow[] = [];

    result.forEach(
        ({
            subjectLimitViolations = [],
            elements = [],
            id,
            status,
        }: ConstraintsFromContingencyItem) => {
            if (!!subjectLimitViolations.length) {
                rows.push({
                    limit: 0,
                    limitType: '',
                    subjectId: '',
                    value: 0,
                    contingencyId: id,
                    contingencyEquipmentsIds: elements.map(
                        (element) => element.id
                    ),
                    computationStatus: status,
                    violationCount: subjectLimitViolations.length,
                });
                subjectLimitViolations?.forEach(
                    (constraint: subjectLimitViolations) => {
                        rows.push({
                            subjectId: constraint.subjectId,
                            limitType: intl.formatMessage({
                                id: constraint.limitType,
                            }),
                            limit: constraint.limit,
                            value: constraint.value,
                            loading: constraint.loading,
                            side: constraint.side,
                            linkedElementId: id,
                        });
                    }
                );
            }
        }
    );

    return rows;
};

export const flattenNmKResultsConstraints = (
    intl: IntlShape,
    result?: ContingenciesFromConstraintItem[]
) => {
    const rows: SecurityAnalysisNmkTableRow[] = [];

    result?.forEach(({ contingencies = [], subjectId }) => {
        if (!rows.find((row) => row.subjectId === subjectId)) {
            if (contingencies.length) {
                rows.push({ subjectId });
                contingencies.forEach((contingency: Contingency) => {
                    rows.push({
                        contingencyId: contingency.contingencyId,
                        contingencyEquipmentsIds: contingency.elements?.map(
                            (element) => element.id
                        ),
                        computationStatus: contingency.computationStatus,
                        limitType: contingency.limitType,
                        limitName: contingency.limitName,
                        side: contingency.side,
                        acceptableDuration: contingency.acceptableDuration,
                        limit: contingency.limit,
                        value: contingency.value,
                        loading: contingency.loading,
                        linkedElementId: subjectId,
                    });
                });
            }
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
        valueFormatter: (params: ValueFormatterParams) =>
            params.data?.limit?.toFixed(1),
    },
    {
        headerName: intl.formatMessage({ id: 'Value' }),
        field: 'value',
        valueFormatter: (params: ValueFormatterParams) =>
            params.data?.value?.toFixed(1),
    },
    {
        headerName: intl.formatMessage({ id: 'Loading' }),
        field: 'loading',
        valueFormatter: (params: ValueFormatterParams) =>
            params.data.loading?.toFixed(1),
    },
];

export const securityAnalysisTableNmKContingenciesColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: (
        cellData: ICellRendererParams
    ) => React.JSX.Element | undefined
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
        },
        {
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'computationStatus',
        },
        {
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
        },
        {
            headerName: intl.formatMessage({ id: 'LimitType' }),
            field: 'limitType',
        },
        {
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
        },
        {
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        },
        {
            headerName: intl.formatMessage({
                id: 'LimitAcceptableDuration',
            }),
            field: 'acceptableDuration',
        },
        {
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.limit?.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'Value' }),
            field: 'value',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.value?.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.loading?.toFixed(1),
        },
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        {
            field: 'linkedElementId',
            hide: true,
        },
    ];
};

export const securityAnalysisTableNmKConstraintsColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: (
        cellData: ICellRendererParams
    ) => React.JSX.Element | undefined
): ColDef[] => {
    return [
        {
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
        },
        {
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
        },
        {
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'computationStatus',
        },
        {
            headerName: intl.formatMessage({ id: 'LimitType' }),
            field: 'limitType',
        },
        {
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
        },
        {
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        },
        {
            headerName: intl.formatMessage({
                id: 'LimitAcceptableDuration',
            }),
            field: 'acceptableDuration',
        },
        {
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.limit?.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'Value' }),
            field: 'value',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.value?.toFixed(1),
        },
        {
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.loading?.toFixed(1),
        },
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        {
            field: 'linkedElementId',
            hide: true,
        },
    ];
};

// TODO This needs to be modified when the sort is done on backend.
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

export enum NMK_TYPE {
    CONSTRAINTS_FROM_CONTINGENCIES = 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS = 'contingencies-from-constraints',
}

export enum RESULT_TYPE {
    N = 'N',
    NMK_CONSTRAINTS = 'NMK_CONSTRAINTS',
    NMK_CONTINGENCIES = 'NMK_CONTINGENCIES',
}
