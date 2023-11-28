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
    CustomColDef,
    FilterEnums,
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
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
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
import { FilterPropsType } from '../../../hooks/use-aggrid-row-filter';

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
                        limitName: limitViolation.limitName,
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

const makeColumn = ({
    headerName, // headerName: The name to display in the column header
    field = '', // field: The data object field corresponding to this column (default is empty)
    valueGetter, // valueGetter: A function to get the cell value if it's not directly in the field
    cellRenderer, // cellRenderer: A component or function to customize the rendering of cells in the column
    isHidden = false, // isHidden: A boolean to determine if the column should be hidden
    valueFormatter, // valueFormatter: A function to format the value displayed in the cell
    sortProps, // sortProps: contains useAgGridSort params
    filterProps, // filterProps: contains useAggridRowFilter params
    filterParams, // filterParams: Parameters for the column's filtering functionality
}: CustomColDef) => {
    const { onSortChanged = () => {}, sortConfig } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};
    const { filterDataType, filterEnums = {} } = filterParams || {};

    const filterOptions =
        filterDataType === FILTER_DATA_TYPES.TEXT
            ? filterEnums[fieldToEnumName[field]]
            : [];

    return {
        headerName,
        field,
        valueGetter,
        cellRenderer,
        valueFormatter,
        hide: isHidden,
        headerTooltip: headerName,
        headerComponent: CustomHeaderComponent,
        headerComponentParams: {
            field,
            displayName: headerName,
            isSortable: !!sortProps,
            sortParams: {
                sortConfig,
                onSortChanged: (newSortValue: number = 0) => {
                    onSortChanged(field, newSortValue);
                },
            },
            isFilterable: !!filterProps,
            filterParams: {
                ...filterParams,
                filterSelector,
                filterOptions,
                updateFilter,
            },
        },
    };
};
export const securityAnalysisTableNColumnsDefinition = (
    intl: IntlShape,
    sortProps: SortPropsType,
    filterProps: FilterPropsType,
    filterEnums: FilterEnums
): ColDef[] => [
    makeColumn({
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

    makeColumn({
        headerName: intl.formatMessage({ id: 'ViolationType' }),
        field: 'limitType',
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterEnums,
        },
    }),

    makeColumn({
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

    makeColumn({
        headerName: intl.formatMessage({ id: 'Limit' }),
        field: 'limit',
        numeric: true,
        valueFormatter: (params: ValueFormatterParams) =>
            params.data?.limit?.toFixed(1),
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    }),

    makeColumn({
        headerName: intl.formatMessage({ id: 'CalculatedValue' }),
        field: 'value',
        valueFormatter: (params: ValueFormatterParams) =>
            params.data?.value?.toFixed(1),
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    }),

    makeColumn({
        headerName: intl.formatMessage({ id: 'Loading' }),
        field: 'loading',
        valueFormatter: (params: ValueFormatterParams) =>
            params.data?.loading?.toFixed(1),
        sortProps,
        filterProps,
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    }),

    makeColumn({
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
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
            parser: parseDuration,
        },
    }),

    makeColumn({
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
    filterEnums: FilterEnums
): ColDef[] => {
    return [
        makeColumn({
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
        makeColumn({
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'status',
            sortProps,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) =>
              formatNAValue(params.value, intl),
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            valueFormatter: (params: ValueFormatterParams) =>
              params.data?.limit?.toFixed(1),
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            field: 'value',
            valueFormatter: (params: ValueFormatterParams) =>
              params.data?.value?.toFixed(1),
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            valueFormatter: (params: ValueFormatterParams) =>
                params.data?.loading?.toFixed(1),
        }),
        makeColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) =>
              convertDuration(value.data.acceptableDuration),
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
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
    subjectIdRenderer: SubjectIdRendererType,
    filterProps: FilterPropsType,
    sortProps: SortPropsType,
    filterEnums: FilterEnums
): ColDef[] => {
    return [
        makeColumn({
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
        makeColumn({
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            field: 'status',
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            field: 'limitType',
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) =>
              formatNAValue(params.value, intl),
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterComparators: [
                    FILTER_TEXT_COMPARATORS.STARTS_WITH,
                    FILTER_TEXT_COMPARATORS.CONTAINS,
                ],
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            field: 'limit',
            valueFormatter: (params: ValueFormatterParams) =>
              params.data?.limit?.toFixed(1),
            filterProps,
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums,
            },
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            field: 'value',
            valueFormatter: (params: ValueFormatterParams) =>
              params.data?.value?.toFixed(1),
               }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            field: 'loading',
            valueFormatter: (params: ValueFormatterParams) =>
              params.data?.loading?.toFixed(1),
        }),
        makeColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) =>
              convertDuration(value.data.acceptableDuration),
        }),
        makeColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            field: 'side',
        }),
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeColumn({
            field: 'linkedElementId',
            isHidden: true,
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
    hasResult: boolean = false,
    setFilter: (value: boolean) => void
): { error: boolean; loading: boolean; result: FilterEnums } => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [result, setResult] = useState<FilterEnums>({
        computationsStatus: null,
        limitTypes: null,
        branchSides: null,
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
                            computationsStatus: computationsStatusResult,
                            limitTypes: limitTypesResult,
                            branchSides: branchSidesResult,
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

const fieldToEnumName: Record<string, string> = {
    status: 'computationsStatus',
    limitType: 'limitTypes',
    side: 'branchSides',
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

export const getIdType = (index: number, nmkType: NMK_TYPE): string => {
    return index === 0 ||
        (index === 1 && nmkType === NMK_TYPE.CONTINGENCIES_FROM_CONSTRAINTS)
        ? 'subjectId'
        : 'contingencyId';
};

export const MAX_INT32: number = 2147483647;
