/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Autocomplete, Grid, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const FilterPanel = ({ filtersDef = [], updateFilter, rowFilters }) => {
    const handleFilterChange = (field, data) => {
        updateFilter(field, data);
    };

    return (
        <Grid container>
            {filtersDef.map(({ field, options, label }) => (
                <Grid key={field} item p={1} xs={6} sm={4} md={3} lg={2}>
                    {!!options?.length && (
                        <Autocomplete
                            value={rowFilters?.find((rowFilter) => rowFilter.field === field)?.value || ''}
                            isOptionEqualToValue={(option, value) => value === '' || option === value}
                            options={options}
                            onChange={(_, data) => handleFilterChange(field, data)}
                            renderInput={(params) => <TextField {...params} fullWidth label={label} size="small" />}
                        />
                    )}
                </Grid>
            ))}
        </Grid>
    );
};

FilterPanel.propTypes = {
    filtersDef: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string.isRequired,
            options: PropTypes.array.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    rowFilters: PropTypes.arrayOf(
        PropTypes.shape({
            field: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
        })
    ).isRequired,
    updateFilter: PropTypes.func.isRequired,
};

export default FilterPanel;
