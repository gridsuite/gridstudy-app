import { IntlShape } from 'react-intl';
import {
    ColumnContext,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
    FilterEnumsType,
} from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { ColDef, ValueFormatterParams, ValueGetterParams } from 'ag-grid-community';
import {
    SECURITY_ANALYSIS_RESULT_N,
    SECURITY_ANALYSIS_RESULT_N_K,
    SECURITY_ANALYSIS_RESULT_SORT_STORE,
} from '../../../utils/store-sort-filter-fields';
import { FilterType as AgGridFilterType } from '../../../types/custom-aggrid-types';
import { makeAgGridCustomHeaderColumn } from '../../custom-aggrid/custom-aggrid-header-utils';
import { CustomAggridComparatorFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { ContingencyCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { CustomAggridAutocompleteFilter } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { convertDuration, formatNAValue } from '../../spreadsheet/utils/equipment-table-utils';
import CustomAggridDurationFilter from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-duration-filter';
import { SubjectIdRendererType } from './security-analysis.type';

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
    subjectIdRenderer: SubjectIdRendererType,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    onFilter: () => void
): ColDef[] => {
    const sortParams: ColumnContext['sortParams'] = {
        table: SECURITY_ANALYSIS_RESULT_SORT_STORE,
        tab: getStoreFields(tabIndex),
    };
    const filterParams = {
        type: AgGridFilterType.SecurityAnalysis,
        tab: getStoreFields(tabIndex),
        updateFilterCallback: onFilter,
    };
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            colId: 'contingencyId',
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
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
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            colId: 'subjectId',
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            context: {
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            colId: 'limitType',
            field: 'limitType',
            context: {
                sortParams: { ...sortParams, isChildren: true },
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
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            colId: 'limitName',
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
            context: {
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.EQUALS],
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            colId: 'limit',
            field: 'limit',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            colId: 'loading',
            field: 'loading',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            colId: 'acceptableDuration',
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) => convertDuration(value.data.acceptableDuration),
            context: {
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridDurationFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            colId: 'side',
            field: 'side',
            context: {
                sortParams: { ...sortParams, isChildren: true },
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
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeAgGridCustomHeaderColumn({
            colId: 'linkedElementId',
            field: 'linkedElementId',
            hide: true,
        }),
    ];
};
export const securityAnalysisTableNmKConstraintsColumnsDefinition = (
    intl: IntlShape,
    subjectIdRenderer: SubjectIdRendererType,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    onFilter: () => void
): ColDef[] => {
    const sortParams: ColumnContext['sortParams'] = {
        table: SECURITY_ANALYSIS_RESULT_SORT_STORE,
        tab: getStoreFields(tabIndex),
    };
    const filterParams = {
        type: AgGridFilterType.SecurityAnalysis,
        tab: getStoreFields(tabIndex),
        updateFilterCallback: onFilter,
    };
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Constraint' }),
            colId: 'subjectId',
            field: 'subjectId',
            cellRenderer: subjectIdRenderer,
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ContingencyId' }),
            colId: 'contingencyId',
            field: 'contingencyId',
            valueGetter: contingencyGetterValues,
            cellRenderer: ContingencyCellRenderer,
            context: {
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ComputationStatus' }),
            colId: 'status',
            field: 'status',
            context: {
                sortParams: { ...sortParams, isChildren: true },
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
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'ViolationType' }),
            colId: 'limitType',
            field: 'limitType',
            context: {
                sortParams: { ...sortParams, isChildren: true },
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
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            colId: 'limitName',
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
            context: {
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.EQUALS],
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            colId: 'limit',
            field: 'limit',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            colId: 'loading',
            field: 'loading',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            colId: 'acceptableDuration',
            field: 'acceptableDuration',
            valueFormatter: (value: ValueFormatterParams) => convertDuration(value.data.acceptableDuration),
            context: {
                sortParams: { ...sortParams, isChildren: true },
                filterComponent: CustomAggridDurationFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitSide' }),
            colId: 'side',
            field: 'side',
            context: {
                sortParams: { ...sortParams, isChildren: true },
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
        //the following column is used purely to determine which rows are a group 'parent' and which are its 'children'
        //it is used for sorting actions
        makeAgGridCustomHeaderColumn({
            colId: 'linkedElementId',
            field: 'linkedElementId',
            hide: true,
        }),
    ];
};

export enum RESULT_TYPE {
    N = 'N',
    NMK_LIMIT_VIOLATIONS = 'NMK_LIMIT_VIOLATIONS',
    NMK_CONTINGENCIES = 'NMK_CONTINGENCIES',
}

export const securityAnalysisTableNColumnsDefinition = (
    intl: IntlShape,
    filterEnums: FilterEnumsType,
    getEnumLabel: (value: string) => string, // Used for translation of enum values in the filter
    tabIndex: number,
    onFilter: () => void
): ColDef[] => {
    const sortParams: ColumnContext['sortParams'] = {
        table: SECURITY_ANALYSIS_RESULT_SORT_STORE,
        tab: getStoreFields(tabIndex),
    };
    const filterParams = {
        type: AgGridFilterType.SecurityAnalysis,
        tab: getStoreFields(tabIndex),
        updateFilterCallback: onFilter,
    };
    return [
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Equipment' }),
            colId: 'subjectId',
            field: 'subjectId',
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
                        ...filterParams,
                    },
                },
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
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'LimitName' }),
            colId: 'limitName',
            field: 'limitName',
            valueFormatter: (params: ValueFormatterParams) => formatNAValue(params.value, intl),
            context: {
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.TEXT,
                        comparators: [FILTER_TEXT_COMPARATORS.EQUALS],
                        ...filterParams,
                    },
                },
            },
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Limit' }),
            colId: 'limit',
            field: 'limit',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'CalculatedValue' }),
            colId: 'value',
            field: 'value',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'Loading' }),
            colId: 'loading',
            field: 'loading',
            context: {
                numeric: true,
                fractionDigits: 2,
                sortParams,
                filterComponent: CustomAggridComparatorFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
            },
        }),

        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({
                id: 'Overload',
            }),
            colId: 'acceptableDuration',
            field: 'acceptableDuration',
            valueFormatter: (value: any) => convertDuration(value.data.acceptableDuration),
            context: {
                sortParams,
                filterComponent: CustomAggridDurationFilter,
                filterComponentParams: {
                    filterParams: {
                        dataType: FILTER_DATA_TYPES.NUMBER,
                        comparators: Object.values(FILTER_NUMBER_COMPARATORS),
                        ...filterParams,
                    },
                },
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
