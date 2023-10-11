/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Constraint,
    ConstraintsFromContingencyItem,
    Contingency,
    LimitViolation,
    SecurityAnalysisNmkTableRow,
} from './security-analysis-types';
import { IntlShape } from 'react-intl';
import { CONVERGED_STATUS } from './security-analysis-content';
import {
    ColDef,
    ICellRendererParams,
    IRowNode,
    ValueFormatterParams,
} from 'ag-grid-community';

export const computeLoading = (
    limitViolation: LimitViolation | Constraint | Contingency
): number | undefined => {
    return (limitViolation.loading =
        limitViolation.limitType === 'CURRENT'
            ? (100 * limitViolation?.value) /
              (limitViolation?.limit *
                  (limitViolation as LimitViolation)?.limitReduction)
            : undefined);
};

export const flattenNmKResultsContingencies = (
    intl: IntlShape,
    result: ConstraintsFromContingencyItem[] = []
) => {
    const rows: SecurityAnalysisNmkTableRow[] = [];
    result?.forEach(
        ({
            constraints = [],
            elements = [],
            id,
            status,
        }: ConstraintsFromContingencyItem) => {
            if (!!constraints.length || status !== CONVERGED_STATUS) {
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
                    violationCount: constraints.length,
                });
                constraints?.forEach((constraint: Constraint) => {
                    rows.push({
                        subjectId: constraint.subjectId,
                        limitType: intl.formatMessage({
                            id: constraint.limitType,
                        }),
                        limit: constraint.limit,
                        value: constraint.value,
                        loading: computeLoading(constraint),
                        side: constraint.side,
                        linkedElementId: id,
                    });
                });
            }
        }
    );
    return rows;
};

// export const flattenNmKResultsConstraints = (
//     intl: IntlShape,
//     result?: PostContingencyResult[]
// ) => {
//     const rows: any[] = [];
//     let mapConstraints = new Map();
//
//     return rows;
// };

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

export const groupPostSort = (
    sortedRows: IRowNode[],
    idField: string,
    linkedElementId: string,
    isContingency: boolean
): IRowNode[] => {
    // Because Map remembers the original insertion order of the keys.
    const rowsMap = new Map();
    if (isContingency) {
        rowsMap.set('contingencies', []);
    }
    // first index by main resource idField
    sortedRows.forEach((row) => {
        if (row.data[idField] != null) {
            rowsMap.set(row.data[idField], [row]);
        }
    });

    // then index by linked resource linkedElementId
    let currentRows;
    sortedRows.forEach((row) => {
        if (isContingency && !row.data[linkedElementId] && !row.data[idField]) {
            currentRows = rowsMap.get('contingencies');
            if (currentRows) {
                currentRows.push(row);
                rowsMap.set('contingencies', currentRows);
            }
        } else if (row.data[idField] == null) {
            currentRows = rowsMap.get(row.data[linkedElementId]);
            if (currentRows) {
                currentRows.push(row);
                rowsMap.set(row.data[linkedElementId], currentRows);
            }
        }
    });
    return [...rowsMap.values()].flat();
};
