/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import { ArrowDownward, ArrowUpward, Menu } from '@mui/icons-material';

import {
    Popover,
    IconButton,
    Grid,
    Autocomplete,
    TextField,
    Badge,
} from '@mui/material';
import PropTypes from 'prop-types';

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

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [isHoveringHeader, setIsHoveringHeader] = useState(false);

    const handleShowFilter = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleCloseFilter = () => {
        setFilterAnchorEl(null);
        setIsHoveringHeader(false);
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

    const handleMouseEnter = () => {
        setIsHoveringHeader(true);
    };

    const handleMouseLeave = () => {
        setIsHoveringHeader(false);
    };

    const isFilterOpened = Boolean(filterAnchorEl);
    const popoverId = isFilterOpened ? `${field}-filter-popover` : undefined;
    const isFilterActive = !!filterOptions.length;
    const isFilterIconDisplayed =
        isHoveringHeader || !!filterSelectedOption || isFilterOpened;

    return (
        <Grid
            container
            alignItems="center"
            sx={{ height: '100%' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Grid
                container
                item
                direction={'row'}
                alignItems={'center'}
                sx={{ height: '100%' }}
                xs={10}
                onClick={handleSortChange}
            >
                <Grid item>{displayName}</Grid>
                {isSortActive && sortWay && (
                    <Grid item>
                        <IconButton size={'small'}>
                            {sortWay === 1 ? (
                                <ArrowUpward fontSize={'small'} />
                            ) : (
                                <ArrowDownward fontSize={'small'} />
                            )}
                        </IconButton>
                    </Grid>
                )}
            </Grid>
            {isFilterActive && isFilterIconDisplayed && (
                <Grid item xs={2}>
                    <IconButton size={'small'} onClick={handleShowFilter}>
                        <Badge
                            color="secondary"
                            variant="dot"
                            invisible={!filterSelectedOption}
                        >
                            <Menu fontSize={'small'} />
                        </Badge>
                    </IconButton>
                </Grid>
            )}
            <Popover
                id={popoverId}
                open={isFilterOpened}
                anchorEl={filterAnchorEl}
                onClose={handleCloseFilter}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
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
                    size="small"
                    sx={{ minWidth: FILTER_TEXT_FIELD_WIDTH }}
                    renderInput={(params) => (
                        <TextField {...params} fullWidth />
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
