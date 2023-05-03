import { Autocomplete, Grid, TextField } from '@mui/material';
import { FILTER_TYPE } from './use-group-filter';

export const FilterPanel = (props) => {
    const { filtersDef, updateFilter } = props;

    const createSelectFilter = (field, options) => {
        return (
            <Autocomplete
                options={options}
                onChange={(_, data) => updateFilter(field, data)}
                renderInput={({ inputProps, ...rest }) => (
                    <TextField
                        fullWidth
                        label={field}
                        inputProps={{ ...inputProps }}
                        {...rest}
                    />
                )}
            />
        );
    };

    const createTextFilter = (field) => {
        return (
            <TextField
                fullWidth
                label={field}
                onChange={(e) => updateFilter(field, e.target.value)}
            />
        );
    };

    return (
        <Grid container>
            {filtersDef.map((filterDef) => (
                <Grid p={1} item xs={4} lg={2} key={filterDef.field}>
                    {filterDef.type === FILTER_TYPE.SELECT &&
                        createSelectFilter(filterDef.field, filterDef.options)}
                    {filterDef.type === FILTER_TYPE.TEXT &&
                        createTextFilter(filterDef.field)}
                </Grid>
            ))}
        </Grid>
    );
};
