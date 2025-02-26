import { ColDef, GridApi, IFilterOptionDef } from 'ag-grid-community';
import React, { ComponentType } from 'react';
import { CustomColumnConfigProps, SortParams } from '../custom-aggrid.type';
import { FilterParams } from '../../../types/custom-aggrid-types';
import { COLUMN_TYPES, CustomCellType } from '../custom-aggrid-header.type';

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

export interface CustomAggridFilterParams {
    api: GridApi;
    colId: string;
    filterParams: FilterParams;
}

export interface ColumnContext<F extends CustomAggridFilterParams = CustomAggridFilterParams> {
    agGridFilterParams?: {
        filterOptions: IFilterOptionDef[];
    };
    columnType?: COLUMN_TYPES;
    columnWidth?: number;
    fractionDigits?: number;
    isDefaultSort?: boolean;
    numeric?: boolean;
    forceDisplayFilterIcon?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.FC<CustomColumnConfigProps>;
    filterComponent?: ComponentType<F>;
    //We omit colId and api here to avoid duplicating its declaration, we reinject it later inside CustomHeaderComponent
    filterComponentParams?: Omit<F, 'colId' | 'api'>;
    sortParams?: SortParams;
}

export interface CustomColDef<TData = any, F extends CustomAggridFilterParams = CustomAggridFilterParams>
    extends ColDef<TData, boolean | string | number | CustomCellType> {
    colId: string;
    context?: ColumnContext<F>;
}
