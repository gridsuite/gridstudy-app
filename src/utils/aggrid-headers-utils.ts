import { FilterConfig } from '../types/custom-aggrid-types';

export const mapFieldsToColumnsFilter = (
    filterSelector: FilterConfig[],
    columnToFieldMapping: Record<string, string>
) => {
    return filterSelector.map((filter) => ({
        ...filter,
        column: columnToFieldMapping[filter.column],
    }));
};
