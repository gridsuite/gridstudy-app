import { CustomAggridComparatorSelecter } from './custom-aggrid-comparator-selecter';
import CustomAggridDurationFilter from './custom-aggrid-duration-filter';
import CustomAggridTextFilter from './custom-aggrid-text-filter';
import { Grid } from '@mui/material';
import { FilterParams, FilterPropsType } from '../custom-aggrid-header.type';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';

interface CustomAggridComparatorFilterProps {
    field: string;
    filterParams: FilterParams & FilterPropsType;
}

export const CustomAggridComparatorFilter = ({ field, filterParams }: CustomAggridComparatorFilterProps) => {
    const { selectedFilterData, comparatorFilterParams } = useCustomAggridFilter(field, filterParams);
    const {
        selectedFilterComparator,
        filterComparators,
        decimalAfterDot,
        isNumberInput,
        handleFilterComparatorChange,
        handleFilterDurationChange,
        handleFilterTextChange,
        handleClearFilter,
    } = comparatorFilterParams;

    const { isDuration } = filterParams;

    return (
        <Grid container direction={'column'} gap={0.8} sx={{ padding: '8px' }}>
            <CustomAggridComparatorSelecter
                value={selectedFilterComparator}
                onChange={handleFilterComparatorChange}
                options={filterComparators}
            />

            {isDuration ? (
                <CustomAggridDurationFilter value={selectedFilterData} onChange={handleFilterDurationChange} />
            ) : (
                <CustomAggridTextFilter
                    value={selectedFilterData}
                    onChange={handleFilterTextChange}
                    onClear={handleClearFilter}
                    isNumberInput={isNumberInput}
                    decimalAfterDot={decimalAfterDot}
                />
            )}
        </Grid>
    );
};
