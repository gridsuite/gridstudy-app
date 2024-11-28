/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColDef, IFilterOptionDef } from 'ag-grid-community';
import { SortPropsType } from '../../hooks/use-aggrid-sort';
import { AnyAction } from 'redux';
import { CrossValidationOptions } from '../spreadsheet/utils/equipment-table-utils';
import { CustomColumnConfigProps } from 'components/spreadsheet/custom-columns/custom-column-menu';

export enum FILTER_DATA_TYPES {
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
}

export enum FILTER_TEXT_COMPARATORS {
    EQUALS = 'equals',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
}
export enum FILTER_NUMBER_COMPARATORS {
    NOT_EQUAL = 'notEqual',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
}

// not visible in the base interface :
export enum UNDISPLAYED_FILTER_NUMBER_COMPARATORS {
    GREATER_THAN = 'greaterThan',
    LESS_THAN = 'lessThan',
}

export type FilterEnumsType = Record<string, string[] | null>;

export type FilterPropsType = {
    updateFilter: (field: string, value: FilterDataType) => void;
    filterSelector: FilterSelectorType[] | null;
};

export type FilterParams = {
    filterDataType?: string;
    isDuration?: boolean;
    filterComparators?: string[];
    debounceMs?: number;
    filterEnums?: FilterEnumsType;
    filterOptions?: any;
};

export type FilterDataType = {
    dataType: string;
    type: string;
    value: undefined | null | number | string | string[];
    tolerance?: number; // tolerance when comparing values. Only useful for the number type
};

export type FilterSelectorType = FilterDataType & {
    column: string;
};

export type FilterStorePropsType = {
    filterType: string;
    filterTab: string;
    filterStoreAction: (filterTab: string, filter: FilterSelectorType[]) => AnyAction;
};

export interface CustomColDef<TData = any, TValue = any> extends ColDef<TData, TValue> {
    agGridFilterParams?: {
        filterOptions: IFilterOptionDef[];
    };
    boolean?: boolean;
    canBeInvalidated?: boolean;
    changeCmd?: string;
    columnWidth?: number;
    crossValidation?: CrossValidationOptions;
    customFilterParams?: {
        filterDataType: string;
        filterComparators?: string[];
    };
    filterParams?: FilterParams;
    filterProps?: FilterPropsType;
    filterTab?: string[];
    fractionDigits?: number;
    getEnumLabel?: (value: string) => string | undefined;
    id: string;
    isCountry?: boolean;
    isDefaultSort?: boolean;
    isEnum?: boolean;
    numeric?: boolean;
    shouldDisplayFilterBadge?: boolean;
    sortProps?: SortPropsType;
    withFluxConvention?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.FC<CustomColumnConfigProps>;
}
