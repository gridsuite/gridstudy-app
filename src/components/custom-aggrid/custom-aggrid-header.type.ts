import { ColDef } from 'ag-grid-community';

export enum FILTER_UI_TYPES {
    TEXT = 'text',
    AUTO_COMPLETE = 'autoComplete',
}

export enum FILTER_TEXT_COMPARATORS {
    EQUALS = 'equals',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
}

export type FilterSelectorType =
    | {
          dataType?: string;
          field?: string;
          type?: string;
          value?: string[] | { text: string; type: string }[];
      }[]
    | null;

export type SortConfigType = {
    colKey: string;
    sortWay: number;
};

type FilterParams = {
    filterUIType?: string;
    filterComparators?: string[];
    debounceMs?: number;
    filterMaxNumConditions?: number;
};

export interface CustomColDef extends ColDef {
    isSortable?: boolean;
    isHidden?: boolean;
    isFilterable?: boolean;
    filterParams?: FilterParams;
    isNumeric?: boolean;
    fractionDigits?: number;
}
