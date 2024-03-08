/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownward, ArrowUpward, FilterAlt } from '@mui/icons-material';
import {
    Autocomplete,
    Badge,
    debounce,
    Grid,
    IconButton,
    MenuItem,
    Popover,
    Select,
    TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
    getPrimarySort,
    getSecondarySort,
    SORT_WAYS as SORT_WAY,
} from '../../hooks/use-aggrid-sort';
import {
    FILTER_TEXT_COMPARATORS,
    FILTER_DATA_TYPES,
} from './custom-aggrid-header.type';
import { mergeSx } from '../utils/functions';

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
    noArrows: {
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
            {
                display: 'none',
            },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
    },
};

const CustomHeaderComponent = ({
    field,
    displayName,
    isSortable = false,
    sortParams = {},
    isFilterable = false,
    filterParams = {},
}) => {
    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        customFilterOptions = [], // used for autoComplete filter as a UI type (list of possible filters)
        debounceMs = 1000, // used to debounce the api call to not fetch the back end too fast
        filterSelector, // used to detect a tab change on the agGrid table
        updateFilter = () => {}, // used to update the filter and fetch the new data corresponding to the filter
        parser, // Used to convert the value displayed in the table into its actual value
    } = filterParams;

    const {
        sortConfig, // used to get sort data
        onSortWayChanged = () => {}, // used to handle sort change
    } = sortParams;

    const isAutoCompleteFilter =
        filterDataType === FILTER_DATA_TYPES.TEXT &&
        !!customFilterOptions?.length;
    const isNumberFilter = filterDataType === FILTER_DATA_TYPES.NUMBER;
    const primarySortConfig =
        sortConfig !== undefined ? getPrimarySort(sortConfig) : undefined;
    const secondarySortConfig =
        sortConfig !== undefined ? getSecondarySort(sortConfig) : undefined;
    const isColumnSorted = primarySortConfig?.colKey === field;
    const isColumnSecSorted = secondarySortConfig?.colKey === field;

    /* Filter should be activated for current column and
    Filter dataType should be defined and
     filter is an autocomplete (have options) or filter have comparators */
    const shouldActivateFilter =
        isFilterable &&
        filterDataType &&
        (isAutoCompleteFilter || !!filterComparators.length);

    const intl = useIntl();

    const [filterAnchorElement, setFilterAnchorElement] = useState(null);
    const [isHoveringColumnHeader, setIsHoveringColumnHeader] = useState(false);
    const [selectedFilterComparator, setSelectedFilterComparator] =
        useState('');
    const [selectedFilterData, setSelectedFilterData] = useState(undefined);

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
        debounce((field, data) => updateFilter(field, data), debounceMs),
        [field, debounceMs, updateFilter]
    );

    const handleFilterTextChange = (event) => {
        const value = event.target.value.toUpperCase();
        setSelectedFilterData(value);

        debouncedUpdateFilter(field, {
            value: parser ? parser(value) : value,
            type: selectedFilterComparator,
            dataType: filterDataType,
        });
    };

    const handleFilterAutoCompleteChange = (_, data) => {
        setSelectedFilterData(data);
        debouncedUpdateFilter(field, {
            value: data,
            type: FILTER_TEXT_COMPARATORS.EQUALS,
            dataType: filterDataType,
        });
    };

    const handleFilterComparatorChange = (event) => {
        const newType = event.target.value;
        setSelectedFilterComparator(newType);
        debouncedUpdateFilter(field, {
            value: selectedFilterData,
            type: newType,
            dataType: filterDataType,
        });
    };

    const handleSortWayChange = useCallback(() => {
        let newSortWay;
        if (isColumnSorted) {
            // primary sort changed
            if (primarySortConfig.sortWay < 0) {
                newSortWay = SORT_WAY.asc;
            } else {
                newSortWay = SORT_WAY.desc;
            }
        } else if (secondarySortConfig && isColumnSecSorted) {
            // secondary sort changed
            if (secondarySortConfig.sortWay < 0) {
                newSortWay = SORT_WAY.asc;
            } else {
                newSortWay = SORT_WAY.desc;
            }
        } else {
            newSortWay = SORT_WAY.asc;
        }

        if (typeof onSortWayChanged === 'function') {
            onSortWayChanged(newSortWay);
        }
    }, [
        isColumnSorted,
        isColumnSecSorted,
        onSortWayChanged,
        primarySortConfig,
        secondarySortConfig,
    ]);

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
                        {...(isSortable && { onClick: handleSortWayChange })}
                    >
                        <Grid item sx={styles.displayName}>
                            {displayName}
                        </Grid>
                        {isSortable && (
                            <Grid item>
                                {isColumnSorted && (
                                    <Grid item>
                                        <IconButton>
                                            {primarySortConfig.sortWay ===
                                            SORT_WAY.asc ? (
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
                                {isColumnSecSorted && (
                                    <Grid item>
                                        <IconButton>
                                            {secondarySortConfig?.sortWay ===
                                            SORT_WAY.asc ? (
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
                            options={customFilterOptions}
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
                                                  id: 'filter.filterOoo',
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
                                            id: `filter.${filterComparator}`,
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
                                    id: 'filter.filterOoo',
                                })}
                                inputProps={{
                                    type: isNumberFilter
                                        ? FILTER_DATA_TYPES.NUMBER
                                        : FILTER_DATA_TYPES.TEXT,
                                }}
                                sx={mergeSx(
                                    styles.input,
                                    isNumberFilter && styles.noArrows
                                )}
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
    isSortable: PropTypes.bool,
    sortParams: PropTypes.shape({
        sortConfig: PropTypes.shape({
            colKey: PropTypes.string,
            sortWay: PropTypes.number,
            selector: PropTypes.shape({
                sortKeysWithWeightAndDirection: PropTypes.object,
            }),
        }),
        onSortChanged: PropTypes.func,
    }),
    isFilterable: PropTypes.bool,
    filterParams: PropTypes.shape({
        filterDataType: PropTypes.oneOf([
            FILTER_DATA_TYPES.TEXT,
            FILTER_DATA_TYPES.NUMBER,
        ]),
        filterComparators: PropTypes.arrayOf(PropTypes.string),
        debounceMs: PropTypes.number,
        updateFilter: PropTypes.func,
        customFilterOptions: PropTypes.arrayOf(PropTypes.string),
        filterSelector: PropTypes.array,
        parser: PropTypes.func,
    }),
};

export default CustomHeaderComponent;
