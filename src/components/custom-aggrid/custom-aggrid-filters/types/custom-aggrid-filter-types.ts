import { FilterType } from '../../../../hooks/use-filter-selector';
import { GridApi } from 'ag-grid-community';

export type FilterData = {
    dataType?: string;
    type?: string;
    value: unknown;
    tolerance?: number; // tolerance when comparing values. Only useful for the number type
};

export type FilterConfig = FilterData & {
    column: string;
};

export type FilterParams = {
    type: FilterType;
    tab: string;
    dataType?: string;
    comparators?: string[];
    debounceMs?: number;
    updateFilterCallback?: (api?: GridApi, filters?: FilterConfig[]) => void;
};
