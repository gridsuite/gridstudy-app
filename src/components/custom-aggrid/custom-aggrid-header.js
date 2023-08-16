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
    filterOptions = [],
    sortConfig = {},
    onSortChanged,
    updateFilter,
    filterSelectedOptions = [],
    isSortable = true,
}) => {
    const { colKey, sortWay } = sortConfig;
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
        if (typeof updateFilter === 'function') {
            updateFilter(field, data);
        }
    };

    const handleSortChange = () => {
        if (isSortable) {
            let newSort = null;
            if (!isSortActive || !sortWay) {
                newSort = 1;
            } else if (sortWay > 0) {
                newSort = -1;
            }

            if (typeof onSortChanged === 'function') {
                onSortChanged(newSort);
            }
        }
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
        isHoveringHeader || !!filterSelectedOptions.length || isFilterOpened;

    return (
        <Grid
            container
            alignItems="center"
            sx={{ height: '100%' }}
            justifyContent="space-between"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Grid
                container
                item
                direction={'row'}
                alignItems={'center'}
                wrap={'nowrap'}
                sx={{
                    height: '100%',
                }}
            >
                <Grid
                    container
                    alignItems={'center'}
                    sx={{ height: '100%' }}
                    direction={'row'}
                    wrap={'nowrap'}
                >
                    <Grid
                        container
                        alignItems={'center'}
                        direction={'row'}
                        wrap={'nowrap'}
                        onClick={handleSortChange}
                        sx={{
                            height: '100%',
                            overflow: 'hidden',
                        }}
                    >
                        <Grid
                            item
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {displayName}
                        </Grid>
                        {isSortable && (
                            <Grid item>
                                {isSortActive && sortWay && (
                                    <Grid item>
                                        <IconButton size={'small'}>
                                            {sortWay === 1 ? (
                                                <ArrowUpward
                                                    fontSize={'small'}
                                                />
                                            ) : (
                                                <ArrowDownward
                                                    fontSize={'small'}
                                                />
                                            )}
                                        </IconButton>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </Grid>
                    <Grid
                        item
                        sx={{
                            overflow: 'visible',
                        }}
                    >
                        {isFilterActive && isFilterIconDisplayed && (
                            <Grid item>
                                <IconButton
                                    size={'small'}
                                    onClick={handleShowFilter}
                                >
                                    <Badge
                                        color="secondary"
                                        variant={
                                            filterSelectedOptions?.length
                                                ? 'dot'
                                                : null
                                        }
                                        invisible={!filterSelectedOptions}
                                    >
                                        <Menu fontSize={'small'} />
                                    </Badge>
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>

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
                    multiple
                    value={filterSelectedOptions}
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
    filterOptions: PropTypes.arrayOf(PropTypes.string),
    sortConfig: PropTypes.shape({
        colKey: PropTypes.string,
        selector: PropTypes.shape({
            sortKeysWithWeightAndDirection: PropTypes.object,
        }),
        sortWay: PropTypes.number,
    }),
    onSortChanged: PropTypes.func,
    updateFilter: PropTypes.func,
    filterSelectedOptions: PropTypes.arrayOf(PropTypes.string),
    isSortable: PropTypes.bool,
};

export default CustomHeaderComponent;
