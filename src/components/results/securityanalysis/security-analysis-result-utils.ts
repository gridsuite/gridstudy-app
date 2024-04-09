/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import {
    Constraint,
    ConstraintsFromContingencyItem,
    ContingenciesFromConstraintItem,
    LimitViolation,
    SecurityAnalysisNmkTableRow,
    SubjectIdRendererType,
} from './security-analysis.type';
import { IntlShape } from 'react-intl';
import {
    ColDef,
    PostSortRowsParams,
    ValueFormatterParams,
    ValueGetterParams,
} from 'ag-grid-community';
import {
    ContingencyCellRenderer,
    convertDuration,
    formatNAValue,
    parseDuration,
} from 'components/spreadsheet/utils/cell-renderers';
import {
    fetchSecurityAnalysisAvailableBranchSides,
    fetchSecurityAnalysisAvailableComputationStatus,
    fetchSecurityAnalysisAvailableLimitTypes,
} from '../../../services/security-analysis';
import {
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FILTER_DATA_TYPES,
} from '../../custom-aggrid/custom-aggrid-header.type';
import { SortPropsType } from '../../../hooks/use-aggrid-sort';
import {
    FilterEnumsType,
    FilterPropsType,
} from '../../../hooks/use-aggrid-row-filter';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import { translateLimitName } from '../common/utils';
import {
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
} from 'utils/store-filter-fields';
import { UUID } from 'crypto';

const contingencyGetterValues = (params: ValueGetterParams) => {
    if (params.data?.contingencyId && params.data?.contingencyEquipmentsIds) {
        return {
            cellValue: params.data?.contingencyId,
            tooltipValue: params.data?.contingencyEquipmentsIds.join('\n'),
        };
    }
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
                status: status
                    ? intl.formatMessage({
                          id: status,
                      })
                    : '',
                violationCount: subjectLimitViolations.length,
            });
            subjectLimitViolations?.forEach((constraint: Constraint) => {
                const { limitViolation = {} as LimitViolation, subjectId } =
                    constraint || {};

                rows.push({
                    subjectId,
                    limitType: limitViolation.limitType
                        ? intl.formatMessage({
                              id: limitViolation.limitType,
                          })
                        : '',
                    limit: limitViolation.limit,
                    value: limitViolation.value,
                    loading: limitViolation.loading,
                    limitName: translateLimitName(
                        limitViolation.limitName,
                        intl
                    ),
                    side: limitViolation.side
                        ? intl.formatMessage({ id: limitViolation.side })
                        : '',
                    linkedElementId: contingencyId,
                    // TODO: Remove this check after fixing the acceptableDuration issue on the Powsybl side
                    acceptableDuration:
                        limitViolation?.acceptableDuration === MAX_INT32
                            ? null
                            : limitViolation?.acceptableDuration,
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
                        status: contingency.status
                            ? intl.formatMessage({
                                  id: contingency.status,
                              })
                            : '',
                        limitType: limitViolation.limitType
                            ? intl.formatMessage({
                                  id: limitViolation.limitType,
                              })
                            : '',
                        limitName: translateLimitName(
                            limitViolation.limitName,
                            intl
                        ),
                        side: limitViolation.side
                            ? intl.formatMessage({ id: limitViolation.side })
                            : '',
                        // TODO: Remove this check after fixing the acceptableDuration issue on the Powsybl side
                        acceptableDuration:
                            limitViolation?.acceptableDuration === MAX_INT32
                                ? null
                                : limitViolation?.acceptableDuration,
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
    intl: IntlShape,
    sortProps: SortPropsType,
    filterProps: FilterPropsType,
    filterEnums: FilterEnumsType
): ColDef[] => [
    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Equipment' }),
        field: 'subjectId',
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
        headerName: intl.formatMessage({ id: 'ViolationType' }),
        field: 'limitType',
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterEnums,
        },
    }),

    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'LimitName' }),
        field: 'limitName',
        valueFormatter: (params: ValueFormatterParams) =>
            formatNAValue(params.value, intl),
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
        headerName: intl.formatMessage({ id: 'Limit' }),
        field: 'limit',
        numeric: true,
        fractionDigits: 2,
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    }),

    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'CalculatedValue' }),
        field: 'value',
        numeric: true,
        fractionDigits: 2,
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    }),

    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({ id: 'Loading' }),
        field: 'loading',
        numeric: true,
        fractionDigits: 2,
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    }),

    makeAgGridCustomHeaderColumn({
        headerName: intl.formatMessage({
            id: 'Overload',
        }),
        field: 'acceptableDuration',
        valueFormatter: (value: any) =>
            convertDuration(value.data.acceptableDuration),
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            isDuration: true,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            parser: parseDuration,
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

export const securityAnalysisTableNmKContingenciesColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: SubjectIdRendererType,
    filterProps: FilterPropsType,
    sortProps: SortPropsType,
    filterEnums: FilterEnumsType
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
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
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'status',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            sortProps: { ...sortProps, children: true },
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
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) =>
                formatNAValue(params.value, intl),
            sortProps: { ...sortProps, children: true },
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
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            numeric: true,
            fractionDigits: 2,
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) =>
                convertDuration(value.data.acceptableDuration),
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                isDuration: true,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
                parser: parseDuration,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeAgGridCustomHeaderColumn({
            field: 'linkedElementId',
            hide: true,
        }),
    ];
};

export const securityAnalysisTableNmKConstraintsColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: SubjectIdRendererType,
    filterProps: FilterPropsType,
    sortProps: SortPropsType,
    filterEnums: FilterEnumsType
): ColDef[] => {
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
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
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
            sortProps: { ...sortProps, children: true },
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
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'status',
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) =>
                formatNAValue(params.value, intl),
            sortProps: { ...sortProps, children: true },
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
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            numeric: true,
            fractionDigits: 2,
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            field: 'value',
            numeric: true,
            fractionDigits: 2,
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            numeric: true,
            fractionDigits: 2,
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) =>
                convertDuration(value.data.acceptableDuration),
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.NUMBER,
                isDuration: true,
                filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
                parser: parseDuration,
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
            sortProps: { ...sortProps, children: true },
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeAgGridCustomHeaderColumn({
            field: 'linkedElementId',
            hide: true,
        }),
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
export const useFetchFiltersEnums = (
    studyUuid: UUID,
    nodeUuid: UUID,
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
                fetchSecurityAnalysisAvailableComputationStatus(
                    studyUuid,
                    nodeUuid
                ),
                fetchSecurityAnalysisAvailableLimitTypes(studyUuid, nodeUuid),
                fetchSecurityAnalysisAvailableBranchSides(studyUuid, nodeUuid),
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
    }, [hasResult, setFilter, studyUuid, nodeUuid]);

    return { loading, result, error };
};

export const SECURITY_ANALYSIS_RESULT_INVALIDATIONS = [
    'securityAnalysisResult',
];

export const FROM_COLUMN_TO_FIELD_N: Record<string, string> = {
    subjectId: 'subjectLimitViolation.subjectId',
    status: 'result.status',
    limitType: 'limitType',
    limitName: 'limitName',
    side: 'side',
    acceptableDuration: 'acceptableDuration',
    limit: 'limit',
    value: 'value',
    loading: 'loading',
};

export const FROM_COLUMN_TO_FIELD_NMK_CONTINGENCIES: Record<string, string> = {
    subjectId: 'contingencyLimitViolations.subjectLimitViolation.subjectId',
    contingencyId: 'contingencyId',
    status: 'status',
    limitType: 'contingencyLimitViolations.limitType',
    limitName: 'contingencyLimitViolations.limitName',
    side: 'contingencyLimitViolations.side',
    acceptableDuration: 'contingencyLimitViolations.acceptableDuration',
    limit: 'contingencyLimitViolations.limit',
    value: 'contingencyLimitViolations.value',
    loading: 'contingencyLimitViolations.loading',
};

export const FROM_COLUMN_TO_FIELD_NMK_LIMIT_VIOLATIONS: Record<string, string> =
    {
        subjectId: 'subjectId',
        contingencyId: 'contingencyLimitViolations.contingency.contingencyId',
        status: 'contingencyLimitViolations.contingency.status',
        limitType: 'contingencyLimitViolations.limitType',
        limitName: 'contingencyLimitViolations.limitName',
        side: 'contingencyLimitViolations.side',
        acceptableDuration: 'contingencyLimitViolations.acceptableDuration',
        limit: 'contingencyLimitViolations.limit',
        value: 'contingencyLimitViolations.value',
        loading: 'contingencyLimitViolations.loading',
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

export const mappingColumnToField = (resultType: RESULT_TYPE) => {
    switch (resultType) {
        case RESULT_TYPE.N:
            return FROM_COLUMN_TO_FIELD_N;
        case RESULT_TYPE.NMK_CONTINGENCIES:
            return FROM_COLUMN_TO_FIELD_NMK_CONTINGENCIES;
        case RESULT_TYPE.NMK_LIMIT_VIOLATIONS:
            return FROM_COLUMN_TO_FIELD_NMK_LIMIT_VIOLATIONS;
    }
};

export const PAGE_OPTIONS = [25, 100, 500, 1000];

export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[0];

export const getIdType = (index: number, nmkType: NMK_TYPE): string => {
    return index === 0 ||
        (index === 1 && nmkType === NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS)
        ? 'subjectId'
        : 'contingencyId';
};

export const MAX_INT32: number = 2147483647;

export const getStoreFields = (index: number): string => {
    switch (index) {
        case 0:
            return SECURITY_ANALYSIS_RESULT_N;
        case 1:
            return SECURITY_ANALYSIS_RESULT_N_K;
        default:
            return '';
    }
};
