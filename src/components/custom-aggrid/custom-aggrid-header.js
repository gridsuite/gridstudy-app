/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import {
    ArrowDownward,
    ArrowUpward,
    FilterList,
    SwapVert,
} from '@mui/icons-material';

import {
    Popover,
    IconButton,
    Grid,
    Autocomplete,
    TextField,
} from '@mui/material';
import PropTypes from 'prop-types';

const FONT_SIZE = '0.75rem';
const FILTER_TEXT_FIELD_WIDTH = '250px';

const CustomHeaderComponent = ({
    field,
    displayName,
    filterOptions,
    sortConfig,
    onSortChanged,
    updateFilter,
    filterSelectedOption,
}) => {
    const { colKey, sortWay } = sortConfig || {};
    const isSortActive = colKey === field;

    const [anchorEl, setAnchorEl] = useState(null);

    const handleShowFilter = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseFilter = () => {
        setAnchorEl(null);
    };

    const handleFilterChange = (field, data) => {
        updateFilter(field, data);
    };

    const handleSortChange = () => {
        let newSort = null;
        if (!isSortActive || !sortWay) {
            newSort = 1;
        } else if (sortWay > 0) {
            newSort = -1;
        }

        onSortChanged(newSort);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? `${field}-filter-popover` : undefined;
    const isFilterActive = !!filterOptions.length;

    return (
        <Grid container alignItems="center">
            <Grid item>{displayName}</Grid>
            <Grid item>
                <IconButton fontSize="small" onClick={handleSortChange}>
                    {isSortActive && sortWay ? (
                        sortWay === 1 ? (
                            <ArrowUpward sx={{ fontSize: FONT_SIZE }} />
                        ) : (
                            <ArrowDownward sx={{ fontSize: FONT_SIZE }} />
                        )
                    ) : (
                        <SwapVert sx={{ fontSize: FONT_SIZE }} />
                    )}
                </IconButton>
            </Grid>
            {isFilterActive && (
                <Grid item>
                    <IconButton onClick={handleShowFilter}>
                        <FilterList sx={{ fontSize: FONT_SIZE }} />
                    </IconButton>
                </Grid>
            )}
            <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handleCloseFilter}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Autocomplete
                    value={filterSelectedOption || ''}
                    isOptionEqualToValue={(option, value) =>
                        value === '' || option === value
                    }
                    options={filterOptions}
                    onChange={(_, data) => {
                        handleFilterChange(field, data);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            size="small"
                            style={{ width: FILTER_TEXT_FIELD_WIDTH }}
                        />
                    )}
                />
            </Popover>
        </Grid>
    );
};

CustomHeaderComponent.propTypes = {
    field: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    filterOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    sortConfig: PropTypes.shape({
        colKey: PropTypes.string,
        selector: PropTypes.shape({
            sortKeysWithWeightAndDirection: PropTypes.object,
        }),
        sortWay: PropTypes.number,
    }).isRequired,
    onSortChanged: PropTypes.func.isRequired,
    updateFilter: PropTypes.func.isRequired,
    filterSelectedOption: PropTypes.string,
};

export default CustomHeaderComponent;
