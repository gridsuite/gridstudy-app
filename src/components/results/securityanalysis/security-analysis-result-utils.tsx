import {
    LimitViolationFromBack,
    PostContingencyResult,
} from './security-analysis.type';
import { IntlShape } from 'react-intl';
import {
    ICellRendererParams,
    IRowNode,
    ValueFormatterParams,
} from 'ag-grid-community';
import { DEFAULT_SORT_ORDER } from '../../spreadsheet/utils/config-tables';
import { ReactComponent } from 'ag-grid-react/lib/shared/reactComponent';
import { ReactElement } from 'react';

export const computeLoading = (
    limitViolation: LimitViolationFromBack
): number | undefined => {
    return (limitViolation.loading =
        limitViolation.limitType === 'CURRENT'
            ? (100 * limitViolation.value) /
              (limitViolation.limit * limitViolation.limitReduction)
            : undefined);
};
export const securityAnalysisTableNColumnsDefinition = (intl: IntlShape) => {
    return [
        {
            headerName: intl.formatMessage({ id: 'Equipment' }),
            field: 'subjectId',
            //todo:check why isnt not working
            //     sort: DEFAULT_SORT_ORDER,
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
    postContingencyResults: PostContingencyResult[],
    intl: IntlShape
) => {
    const rows: {
        contingencyId?: string;
        computationStatus?: string;
        violationCount?: number;
        subjectId?: string;
        limitType?: any;
        limit?: number;
        value?: number;
        loading?: number | undefined;
        side?: string | undefined;
        linkedElementId?: string;
    }[] = [];
    postContingencyResults?.forEach((postContingencyResult, index) => {
        if (
            postContingencyResult?.limitViolationsResult?.limitViolations
                .length > 0 ||
            postContingencyResult.status !== 'CONVERGED'
        ) {
            rows.push({
                contingencyId: postContingencyResult.contingency.id,
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

export const securityAnalysisTableNmKContingenciesColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: (
        cellData: ICellRendererParams
    ) => React.JSX.Element | undefined
) => {
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

export const groupPostSort = (
    sortedRows: IRowNode[],
    idField: string,
    linkedElementId: string,
    isContingency: boolean
) => {
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
