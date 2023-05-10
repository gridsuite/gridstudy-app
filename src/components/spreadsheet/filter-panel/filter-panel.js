import { Autocomplete, Grid, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { FILTER_TYPE } from './use-group-filter';

const TEXT_FILTER_DELAY = 200;

const TextFilter = ({ field, label, updateFilter }) => {
    const [textFilter, setTextFilter] = useState();

    // to avoid input lag when filtering large arrays of data, we use a timeout to start searching when user stops typing for {TEXT_FILTER_DELAY} milliseconds
    useEffect(() => {
        const timer = setTimeout(
            () => updateFilter(field, textFilter),
            TEXT_FILTER_DELAY
        );

        return () => {
            clearTimeout(timer);
        };
    }, [textFilter, field, updateFilter]);

    return (
        <TextField
            fullWidth
            label={label}
            onChange={(e) => setTextFilter(e.target.value)}
        />
    );
};

export const FilterPanel = (props) => {
    const { filtersDef, updateFilter } = props;

    const createSelectFilter = useCallback(
        (field, options, label) => {
            return (
                <Autocomplete
                    options={options}
                    onChange={(_, data) => updateFilter(field, data)}
                    renderInput={({ inputProps, ...rest }) => (
                        <TextField
                            fullWidth
                            label={label}
                            inputProps={{ ...inputProps }}
                            {...rest}
                        />
                    )}
                />
            );
        },
        [updateFilter]
    );

    const createTextFilter = useCallback(
        (field, label) => {
            return (
                <TextFilter
                    label={label}
                    field={field}
                    updateFilter={updateFilter}
                />
            );
        },
        [updateFilter]
    );

    return (
        <Grid container>
            {filtersDef.map((filterDef) => (
                <Grid p={1} item xs={4} lg={2} key={filterDef.field}>
                    {filterDef.type === FILTER_TYPE.SELECT &&
                        createSelectFilter(
                            filterDef.field,
                            filterDef.options,
                            filterDef.label
                        )}
                    {filterDef.type === FILTER_TYPE.TEXT &&
                        createTextFilter(filterDef.field, filterDef.label)}
                </Grid>
            ))}
        </Grid>
    );
};
