/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownward, ArrowUpward, FilterAlt } from '@mui/icons-material';
import {
    Popover,
    IconButton,
    Grid,
    Autocomplete,
    TextField,
    Badge,
    Select,
    MenuItem,
    debounce,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { FILTER_UI_TYPES } from './custom-aggrid-header.type';

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
    autoCompleteInput: {
        width: '30%',
    },
    displayName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};

const CustomHeaderComponent = ({
    field,
    displayName,
    sortConfig = {},
    onSortChanged = () => {},
    isSortable = true,
    isFilterable = true,
    filterParams = {},
}) => {
    const {
        filterUIType = FILTER_UI_TYPES.AUTO_COMPLETE,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        filterOptions = [], // used for autoComplete filter as a UI type (list of possible filters)
        debounceMs = 1000, // used to debounce the api call to not fetch the back end too fast
        filterSelector, // used to detect a tab change on the agGrid table
        updateFilter = () => {}, // used to update the filter and fetch the new data corresponding to the filter
    } = filterParams;
    const { colKey: sortColKey, sortWay } = sortConfig;
    const isAutoCompleteFilter = filterUIType === FILTER_UI_TYPES.AUTO_COMPLETE;

    const intl = useIntl();

    const [filterAnchorElement, setFilterAnchorElement] = useState(null);
    const [isHoveringColumnHeader, setIsHoveringColumnHeader] = useState(false);
    const [selectedFilterComparator, setSelectedFilterComparator] =
        useState('');
    const [selectedFilterData, setSelectedFilterData] = useState(undefined);

    const isColumnSorted = sortColKey === field;

    const shouldActivateFilter =
        // Filter should be activated for current column
        isFilterable &&
        // Filter should be a text type, or we should have options for filter if it is an autocomplete
        (filterUIType === FILTER_UI_TYPES.TEXT || !!filterOptions?.length);

    const shouldDisplayFilterIcon =
        isHoveringColumnHeader || // user is hovering column header
        !!selectedFilterData?.length || // user filtered data on current column
        !!filterAnchorElement; // filter popped-over but user is not hovering current column header

    const handleShowFilter = (event) => {
        setFilterAnchorElement(event.currentTarget);
    };

    const handleCloseFilter = () => {
        setFilterAnchorElement(null);
        setIsHoveringColumnHeader(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedUpdateFilter = useCallback(
        debounce((data) => updateFilter(field, data), debounceMs),
        [field, debounceMs, updateFilter]
    );

    const handleFilterTextChange = (event) => {
        const value = event.target.value.toUpperCase();
        setSelectedFilterData(value);

        debouncedUpdateFilter([
            {
                text: value,
                type: selectedFilterComparator,
            },
        ]);
    };

    const handleFilterAutoCompleteChange = (_, data) => {
        setSelectedFilterData(data);
        debouncedUpdateFilter(data);
    };

    const handleFilterComparatorChange = (event) => {
        const newType = event.target.value;
        setSelectedFilterComparator(newType);
        debouncedUpdateFilter([{ text: selectedFilterData, type: newType }]);
    };

    const handleSortChange = useCallback(() => {
        let newSort = null;
        if (!isColumnSorted || !sortWay) {
            newSort = 1;
        } else if (sortWay > 0) {
            newSort = -1;
        }

        if (typeof onSortChanged === 'function') {
            onSortChanged(newSort);
        }
    }, [isColumnSorted, onSortChanged, sortWay]);

    const handleMouseEnter = useCallback(() => {
        setIsHoveringColumnHeader(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHoveringColumnHeader(false);
    }, []);

    useEffect(() => {
        if (!filterSelector) {
            setSelectedFilterData(undefined);
        }
    }, [filterSelector]);

    useEffect(() => {
        if (!selectedFilterComparator) {
            setSelectedFilterComparator(filterComparators[0]);
        }
    }, [selectedFilterComparator, filterComparators]);

    return (
        <Grid
            container
            alignItems="center"
            sx={{ height: '100%' }}
            justifyContent="space-between"
            // if column is filterable, we should activate hovering behavior for the filter icon
            {...(shouldActivateFilter && {
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
                        <Grid item sx={styles.displayName}>
                            {displayName}
                        </Grid>
                        {isSortable && (
                            <Grid item>
                                {isColumnSorted && sortWay && (
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
                    {shouldActivateFilter && (
                        <Grid
                            item
                            sx={{
                                overflow: 'visible',
                            }}
                        >
                            {shouldDisplayFilterIcon && (
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
                                            <FilterAlt sx={styles.iconSize} />
                                        </Badge>
                                    </IconButton>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Grid>
            {shouldActivateFilter && (
                <Popover
                    id={`${field}-filter-popover`}
                    open={!!filterAnchorElement}
                    anchorEl={filterAnchorElement}
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
                        sx: styles[
                            isAutoCompleteFilter ? 'autoCompleteInput' : 'input'
                        ],
                    }}
                >
                    {isAutoCompleteFilter ? (
                        <Autocomplete
                            multiple
                            value={selectedFilterData || []}
                            options={filterOptions || []}
                            getOptionLabel={(option) =>
                                intl.formatMessage({
                                    id: option,
                                    defaultMessage: option,
                                })
                            }
                            onChange={handleFilterAutoCompleteChange}
                            size="small"
                            disableCloseOnSelect
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={
                                        !selectedFilterData?.length
                                            ? intl.formatMessage({
                                                  id: 'customAgGridFilter.filterOoo',
                                              })
                                            : ''
                                    }
                                />
                            )}
                            fullWidth
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
                                onChange={handleFilterComparatorChange}
                                displayEmpty
                                size={'small'}
                                sx={styles.input}
                            >
                                {filterComparators.map((filterComparator) => (
                                    <MenuItem
                                        key={filterComparator}
                                        value={filterComparator}
                                    >
                                        {intl.formatMessage({
                                            id: `customAgGridFilter.${filterComparator}`,
                                        })}
                                    </MenuItem>
                                ))}
                            </Select>
                            <TextField
                                size={'small'}
                                fullWidth
                                value={selectedFilterData || ''}
                                onChange={handleFilterTextChange}
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
    filterParams: PropTypes.shape({
        filterUIType: PropTypes.oneOf([
            // FILTER_UI_TYPES.TEXT,
            // FILTER_UI_TYPES.AUTO_COMPLETE,
        ]),
        filterComparators: PropTypes.arrayOf(PropTypes.string),
        debounceMs: PropTypes.number,
    }),
};

export default CustomHeaderComponent;
