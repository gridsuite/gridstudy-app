/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { ArrowDownward, ArrowUpward, Menu } from '@mui/icons-material';

import {
    Popover,
    IconButton,
    Grid,
    Autocomplete,
    TextField,
    Badge,
    Select,
    MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
};

export const FILTER_UI_TYPES = {
    TEXT: 'text',
    AUTO_COMPLETE: 'autoComplete',
};

export const FILTER_TYPES = {
    EQUALS: 'equals',
    CONTAINS: 'contains',
    STARTS_WITH: 'startsWith',
};

const CustomHeaderComponent = ({
    field,
    displayName,
    filterOptions = [],
    sortConfig = {},
    onSortChanged,
    updateFilter,
    filterSelectedOptions = [],
    isSortable = true,
    isFilterable = true,
    filterParams,
}) => {
    const intl = useIntl();

    const {
        filterUIType = FILTER_UI_TYPES.AUTO_COMPLETE,
        filterComparators = [],
    } = filterParams || {};

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [isHoveringHeader, setIsHoveringHeader] = useState(false);
    const [selectedFilterComparator, setSelectedFilterComparator] = useState(
        filterComparators[0]
    );

    const { colKey, sortWay } = sortConfig;
    const isSortActive = colKey === field;
    const isFilterOpened = Boolean(filterAnchorEl);
    const popoverId = isFilterOpened ? `${field}-filter-popover` : undefined;
    const isFilterActive =
        filterUIType === FILTER_UI_TYPES.TEXT || !!filterOptions?.length;
    const isFilterIconDisplayed =
        isHoveringHeader || !!filterSelectedOptions.length || isFilterOpened;

    const handleShowFilter = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleCloseFilter = () => {
        setFilterAnchorEl(null);
        setIsHoveringHeader(false);
    };

    const handleFilterChange = (field, data) => {
        if (typeof updateFilter === 'function') {
            if (filterUIType === FILTER_UI_TYPES.TEXT) {
                updateFilter(field, [
                    {
                        text: data.target.value?.toUpperCase(),
                        type: selectedFilterComparator,
                    },
                ]);
            } else {
                updateFilter(field, data, FILTER_TYPES.EQUALS);
            }
        }
    };

    const handleChangeSelectedFilterType = (event, field) => {
        const newType = event.target.value;
        setSelectedFilterComparator(newType);
        updateFilter(field, [
            { text: filterSelectedOptions?.[0]?.text, type: newType },
        ]);
    };

    const handleSortChange = () => {
        let newSort = null;
        if (!isSortActive || !sortWay) {
            newSort = 1;
        } else if (sortWay > 0) {
            newSort = -1;
        }

        if (typeof onSortChanged === 'function') {
            onSortChanged(newSort);
        }
    };

    const handleMouseEnter = () => {
        setIsHoveringHeader(true);
    };

    const handleMouseLeave = () => {
        setIsHoveringHeader(false);
    };

    return (
        <Grid
            container
            alignItems="center"
            sx={{ height: '100%' }}
            justifyContent="space-between"
            {...(isFilterable && {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
            })}
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
                    sx={{
                        height: '100%',
                        cursor: isSortable ? 'pointer' : 'default',
                    }}
                    direction={'row'}
                    wrap={'nowrap'}
                >
                    <Grid
                        container
                        alignItems={'center'}
                        direction={'row'}
                        wrap={'nowrap'}
                        sx={{
                            height: '100%',
                            overflow: 'hidden',
                        }}
                        {...(isSortable && { onClick: handleSortChange })}
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
                                        <IconButton>
                                            {sortWay === 1 ? (
                                                <ArrowUpward
                                                    sx={styles.iconSize}
                                                />
                                            ) : (
                                                <ArrowDownward
                                                    sx={styles.iconSize}
                                                />
                                            )}
                                        </IconButton>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </Grid>
                    {isFilterable && (
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
                                            <Menu sx={styles.iconSize} />
                                        </Badge>
                                    </IconButton>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {isFilterable && (
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
                    PaperProps={{
                        sx: styles.input,
                    }}
                >
                    {filterUIType === FILTER_UI_TYPES.AUTO_COMPLETE ? (
                        <Autocomplete
                            multiple
                            value={filterSelectedOptions}
                            options={filterOptions}
                            getOptionLabel={(option) =>
                                intl.formatMessage({
                                    id: option,
                                    defaultMessage: option,
                                })
                            }
                            onChange={(_, data) => {
                                handleFilterChange(field, data);
                            }}
                            size="small"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={intl.formatMessage({
                                        id: 'grid.filterOoo',
                                    })}
                                />
                            )}
                            sx={{ width: '100%' }}
                        />
                    ) : (
                        <Grid
                            container
                            direction={'column'}
                            gap={0.8}
                            sx={{ padding: '8px' }}
                        >
                            <Select
                                value={selectedFilterComparator}
                                onChange={(event) =>
                                    handleChangeSelectedFilterType(event, field)
                                }
                                displayEmpty
                                size={'small'}
                                sx={styles.input}
                            >
                                {filterComparators.map((filterComparator) => (
                                    <MenuItem value={filterComparator}>
                                        {intl.formatMessage({
                                            id: `customAgGridFilter.${filterComparator}`,
                                        })}
                                    </MenuItem>
                                ))}
                            </Select>
                            <TextField
                                size={'small'}
                                fullWidth
                                value={filterSelectedOptions?.[0]?.text}
                                onChange={(event) => {
                                    handleFilterChange(field, event);
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'grid.filterOoo',
                                })}
                                sx={styles.input}
                            />
                        </Grid>
                    )}
                </Popover>
            )}
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
    filterSelectedOptions: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                type: PropTypes.string,
                value: PropTypes.string,
            }),
        ])
    ),
    isSortable: PropTypes.bool,
    isFilterable: PropTypes.bool,
};

export default CustomHeaderComponent;
