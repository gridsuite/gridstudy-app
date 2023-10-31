/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
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
import { useDebounce } from '@gridsuite/commons-ui';
import Paper from '@mui/material/Paper';

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
    isSortable = true,
    isFilterable = true,
    filterParams = {},
    filterSelector,
}) => {
    const intl = useIntl();

    const {
        filterUIType = FILTER_UI_TYPES.AUTO_COMPLETE,
        filterComparators = [],
        debounceMs,
    } = filterParams;

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [isHoveringHeader, setIsHoveringHeader] = useState(false);
    const [selectedFilterComparator, setSelectedFilterComparator] = useState(
        filterComparators[0]
    );
    const [selectedFilterData, setSelectedFilterData] = useState();

    const { colKey, sortWay } = sortConfig;
    const isSortActive = colKey === field;
    const isFilterOpened = Boolean(filterAnchorEl);
    const popoverId = isFilterOpened ? `${field}-filter-popover` : undefined;
    const isFilterActive =
        filterUIType === FILTER_UI_TYPES.TEXT || !!filterOptions.length;
    const isFilterIconDisplayed =
        isHoveringHeader || !!selectedFilterData?.length || isFilterOpened;

    const handleShowFilter = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleCloseFilter = () => {
        setFilterAnchorEl(null);
        setIsHoveringHeader(false);
    };

    const debouncedUpdateFilter = useDebounce(updateFilter, debounceMs);

    const handleFilterDataChange = (field, data) => {
        if (filterUIType === FILTER_UI_TYPES.TEXT) {
            setSelectedFilterData(data.target.value?.toUpperCase());
            debouncedUpdateFilter(field, [
                {
                    text: data.target.value?.toUpperCase(),
                    type: selectedFilterComparator,
                },
            ]);
        } else {
            setSelectedFilterData(data);
            debouncedUpdateFilter(field, data, FILTER_TYPES.EQUALS);
        }
    };

    const handleFilterDataTypeChange = (event, field) => {
        const newType = event.target.value;
        setSelectedFilterComparator(newType);

        debouncedUpdateFilter(field, [
            { text: selectedFilterData, type: newType },
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

    useEffect(() => {
        if (!filterSelector) {
            setSelectedFilterData(undefined);
        }
    }, [filterSelector]);

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
                                                selectedFilterData?.length
                                                    ? 'dot'
                                                    : null
                                            }
                                            invisible={!selectedFilterData}
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
                            value={selectedFilterData}
                            options={filterOptions}
                            getOptionLabel={(option) =>
                                intl.formatMessage({
                                    id: option,
                                    defaultMessage: option,
                                })
                            }
                            onChange={(_, data) => {
                                handleFilterDataChange(field, data);
                            }}
                            size="small"
                            disableCloseOnSelect
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={intl.formatMessage({
                                        id: 'customAgGridFilter.filterOoo',
                                    })}
                                />
                            )}
                            PaperComponent={({ children }) => (
                                <Paper
                                    sx={{
                                        width: '100%',
                                    }}
                                >
                                    {children}
                                </Paper>
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
                                    handleFilterDataTypeChange(event, field)
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
                                value={selectedFilterData}
                                onChange={(event) => {
                                    handleFilterDataChange(field, event);
                                }}
                                placeholder={intl.formatMessage({
                                    id: 'customAgGridFilter.filterOoo',
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
    isSortable: PropTypes.bool,
    isFilterable: PropTypes.bool,
};

export default CustomHeaderComponent;
