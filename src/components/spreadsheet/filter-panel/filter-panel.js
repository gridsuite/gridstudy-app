import { Autocomplete, Grid, TextField } from '@mui/material';

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
        <Grid container xs={12}>
            {filtersDef.map((filterDef) => (
                <Grid p={1} item xs={4} lg={2} key={filterDef.field}>
                    {filterDef.type === 'select' &&
                        createSelectFilter(filterDef.field, filterDef.options)}
                    {filterDef.type === 'text' &&
                        createTextFilter(filterDef.field)}
                </Grid>
            ))}
        </Grid>
    );
};
