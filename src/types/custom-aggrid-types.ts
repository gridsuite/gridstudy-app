import { GridApi } from 'ag-grid-community';

export type SortConfig = {
    colId: string;
    sort: SortWay;
    children?: boolean;
};

export enum SortWay {
    ASC = 'asc',
    DESC = 'desc',
}

export enum FilterType {
    Loadflow = 'Loadflow',
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    ShortcircuitAnalysis = 'ShortcircuitAnalysis',
    DynamicSimulation = 'DynamicSimulation',
    Spreadsheet = 'Spreadsheet',
    Logs = 'Logs',
    StateEstimation = 'StateEstimation',
}

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
