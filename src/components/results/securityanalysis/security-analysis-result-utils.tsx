/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    LimitViolationFromBack,
    PostContingencyResult,
    ResultConstraint,
    ResultContingencie,
} from './security-analysis.type';
import { IntlShape } from 'react-intl';
import {
    ColDef,
    ICellRendererParams,
    IRowNode,
    ValueFormatterParams,
} from 'ag-grid-community';
import { ContingencyCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import { ValueGetterParams } from 'ag-grid-community';

export const computeLoading = (
    limitViolation: LimitViolationFromBack
): number | undefined => {
    return (limitViolation.loading =
        limitViolation.limitType === 'CURRENT'
            ? (100 * limitViolation.value) /
              (limitViolation.limit * limitViolation.limitReduction)
            : undefined);
};
export const securityAnalysisTableNColumnsDefinition = (
    intl: IntlShape
): ColDef[] => {
    return [
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
};

export const flattenNmKresultsContingencies = (
    intl: IntlShape,
    postContingencyResults?: PostContingencyResult[]
) => {
    const rows: ResultContingencie[] = [];
    postContingencyResults?.forEach((postContingencyResult, index) => {
        if (
            postContingencyResult?.limitViolationsResult?.limitViolations
                .length > 0 ||
            postContingencyResult.status !== 'CONVERGED'
        ) {
            rows.push({
                contingencyId: postContingencyResult.contingency.id,
                contingencyEquipmentsIds:
                    postContingencyResult.contingency.elements.map(
                        (element) => element.id
                    ),
                computationStatus: postContingencyResult.status,
                violationCount:
                    postContingencyResult.limitViolationsResult.limitViolations
                        .length,
            });
            postContingencyResult?.limitViolationsResult?.limitViolations?.forEach(
                (limitViolation) => {
                    rows.push({
                        subjectId: limitViolation.subjectId,
                        limitType: intl.formatMessage({
                            id: limitViolation.limitType,
                        }),
                        limit: limitViolation.limit,
                        value: limitViolation.value,
                        loading: computeLoading(limitViolation),
                        side: limitViolation.side,
                        linkedElementId: postContingencyResult.contingency.id,
                    });
                }
            );
        }
    });
    return rows;
};

const contingencyGetterValues = (params: ValueGetterParams) => {
    if (params.data?.contingencyId && params.data?.contingencyEquipmentsIds) {
        return {
            cellValue: params.data?.contingencyId,
            tooltipValue: params.data?.contingencyEquipmentsIds.join('\n'),
        };
    }
};

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

export const flattenNmKresultsConstraints = (
    intl: IntlShape,
    postContingencyResults?: PostContingencyResult[]
) => {
    const rows: ResultConstraint[] = [];
    let mapConstraints = new Map();

    postContingencyResults?.forEach((postContingencyResult, index) => {
        if (postContingencyResult.status !== 'CONVERGED') {
            rows.push({
                contingencyId: postContingencyResult.contingency.id,
                computationStatus: postContingencyResult.status,
            });
        }

        if (
            postContingencyResult.limitViolationsResult.limitViolations.length >
            0
        ) {
            postContingencyResult?.limitViolationsResult?.limitViolations?.forEach(
                (limitViolation) => {
                    let contingencies: ResultConstraint[];
                    if (!mapConstraints.has(limitViolation.subjectId)) {
                        contingencies = [];
                        mapConstraints.set(
                            limitViolation.subjectId,
                            contingencies
                        );
                    } else {
                        contingencies = mapConstraints.get(
                            limitViolation.subjectId
                        );
                    }

                    contingencies.push({
                        contingencyId: postContingencyResult.contingency.id,
                        contingencyEquipmentsIds:
                            postContingencyResult.contingency.elements.map(
                                (element) => element.id
                            ),
                        computationStatus: postContingencyResult.status,
                        constraintId: limitViolation.subjectId,
                        limitType: intl.formatMessage({
                            id: limitViolation.limitType,
                        }),
                        limit: limitViolation.limit,
                        value: limitViolation.value,
                        loading: limitViolation.loading,
                        side: limitViolation.side,
                        acceptableDuration: limitViolation.acceptableDuration,
                        limitName: limitViolation.limitName,
                    });
                }
            );
        }
    });

    mapConstraints.forEach((contingencies, subjectId) => {
        rows.push({
            subjectId: subjectId,
        });

        contingencies?.forEach((contingency: ResultConstraint) => {
            rows.push({
                contingencyId: contingency.contingencyId,
                contingencyEquipmentsIds: contingency.contingencyEquipmentsIds,
                computationStatus: contingency.computationStatus,
                constraintId: contingency.constraintId,
                limitType: contingency.limitType,
                limit: contingency.limit,
                value: contingency.value,
                loading: contingency.loading,
                side: contingency.side,
                acceptableDuration: contingency.acceptableDuration,
                limitName: contingency.limitName,
                linkedElementId: subjectId,
            });
        });
    });

    return rows;
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
export enum NMK_TYPE_RESULT {
    CONSTRAINTS_FROM_CONTINGENCIES = 'constraints-from-contingencies',
    CONTINGENCIES_FROM_CONSTRAINTS = 'contingencies-from-constraints',
}
