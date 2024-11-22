/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { ArrowDownward, ArrowUpward, FilterAlt } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import {
    Autocomplete,
    Badge,
    debounce,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Popover,
    Select,
    TextField,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { SortWay } from '../../hooks/use-aggrid-sort';
import { FILTER_TEXT_COMPARATORS, FILTER_DATA_TYPES } from './custom-aggrid-header.type';
import { mergeSx } from '../utils/functions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import CustomAggridBooleanFilter from './custom-aggrid-filters/custom-aggrid-boolean-filter';
import CustomAggridDurationFilter from './custom-aggrid-filters/custom-aggrid-duration-filter';

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
        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
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
    getEnumLabel, // Used for translation of enum values in the filter
    isCountry, // Used for translation of the countries options in the filter
    shouldDisplayFilterBadge,
}) => {
    const {
        filterDataType = FILTER_DATA_TYPES.TEXT,
        filterComparators = [], // used for text filter as a UI type (examples: contains, startsWith..)
        customFilterOptions = [], // used for autoComplete filter as a UI type (list of possible filters)
        debounceMs = 1000, // used to debounce the api call to not fetch the back end too fast
        filterSelector, // used to detect a tab change on the agGrid table
        updateFilter = () => {}, // used to update the filter and fetch the new data corresponding to the filter
        isDuration, // if the value is a duration, we need to handle that special case, because it's a number filter but with text input
    } = filterParams;
    const {
        sortConfig, // used to get sort data
        onSortChanged = () => {}, // used to handle sort change
    } = sortParams;

    const { translate } = useLocalizedCountries();

    const isBooleanFilter = filterDataType === FILTER_DATA_TYPES.BOOLEAN;
    const isAutoCompleteFilter = filterDataType === FILTER_DATA_TYPES.TEXT && !!customFilterOptions?.length;
    const isNumberInput = filterDataType === FILTER_DATA_TYPES.NUMBER && !isDuration;
    const columnSort = sortConfig?.find((value) => value.colId === field);
    const isColumnSorted = !!columnSort;

    /* Filter should be activated for current column and
    Filter dataType should be defined and
     filter is an autocomplete (have options) or filter have comparators */
    const shouldActivateFilter =
        isFilterable && filterDataType && (isAutoCompleteFilter || !!filterComparators.length || isBooleanFilter);

    const intl = useIntl();

    const [filterAnchorElement, setFilterAnchorElement] = useState(null);
    const [isHoveringColumnHeader, setIsHoveringColumnHeader] = useState(false);
    const [selectedFilterComparator, setSelectedFilterComparator] = useState('');
    const [selectedFilterData, setSelectedFilterData] = useState();

    const shouldDisplayFilterIcon =
        isHoveringColumnHeader || // user is hovering column header
        !!selectedFilterData?.length || // user filtered data on current column
        !!filterAnchorElement; // filter popped-over but user is not hovering current column header

    const handleClearFilter = () => {
        setSelectedFilterData(undefined);
        updateFilter(field, {
            value: undefined,
            type: selectedFilterComparator,
            dataType: filterDataType,
        });
    };

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
            value: value,
            type: selectedFilterComparator,
            dataType: filterDataType,
        });
    };

    const handleFilterDurationChange = (value) => {
        setSelectedFilterData(value);
        debouncedUpdateFilter(field, {
            value: value,
            type: selectedFilterComparator,
            dataType: FILTER_DATA_TYPES.NUMBER,
        });
    };

    const handleFilterAutoCompleteChange = (_, data) => {
        handleSelectedFilterDataChange(data);
    };

    const handleSelectedFilterDataChange = (data) => {
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

    const handleSortChange = useCallback(() => {
        let newSort;
        if (!isColumnSorted) {
            newSort = SortWay.ASC;
        } else {
            if (columnSort.sort === SortWay.DESC) {
                newSort = SortWay.ASC;
            } else {
                newSort = SortWay.DESC;
            }
        }

        if (typeof onSortChanged === 'function') {
            onSortChanged(newSort);
        }
    }, [isColumnSorted, onSortChanged, columnSort?.sort]);

    const handleMouseEnter = useCallback(() => {
        setIsHoveringColumnHeader(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHoveringColumnHeader(false);
    }, []);

    useEffect(() => {
        if (!selectedFilterComparator) {
            setSelectedFilterComparator(filterComparators[0]);
        }
    }, [selectedFilterComparator, filterComparators]);

    useEffect(() => {
        if (!filterSelector?.length) {
            setSelectedFilterData(undefined);
        } else {
            const filterObject = filterSelector?.find((filter) => filter.column === field);
            if (filterObject) {
                setSelectedFilterData(filterObject.value);
                setSelectedFilterComparator(filterObject.type);
            } else {
                setSelectedFilterData(undefined);
            }
        }
    }, [filterSelector, field]);
    const getOptionLabel = useCallback(
        (option) =>
            isCountry
                ? translate(option)
                : intl.formatMessage({
                      id: getEnumLabel?.(option) || option,
                      defaultMessage: option,
                  }),
        [isCountry, intl, translate, getEnumLabel]
    );

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
                                {isColumnSorted && (
                                    <Grid item>
                                        <IconButton>
                                            {columnSort.sort === SortWay.ASC ? (
                                                <ArrowUpward sx={styles.iconSize} />
                                            ) : (
                                                <ArrowDownward sx={styles.iconSize} />
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
                            {(shouldDisplayFilterIcon || shouldDisplayFilterBadge) && (
                                <Grid item>
                                    <IconButton size={'small'} onClick={handleShowFilter}>
                                        {shouldDisplayFilterBadge ?? true ? (
                                            <Badge
                                                color="secondary"
                                                variant={
                                                    selectedFilterData?.length || shouldDisplayFilterBadge
                                                        ? 'dot'
                                                        : null
                                                }
                                                invisible={!selectedFilterData}
                                            >
                                                <FilterAlt sx={styles.iconSize} />
                                            </Badge>
                                        ) : (
                                            <FilterAlt sx={styles.iconSize} />
                                        )}
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
                        sx: styles[isAutoCompleteFilter ? 'autoCompleteInput' : 'input'],
                    }}
                >
                    {isAutoCompleteFilter ? (
                        <Autocomplete
                            multiple
                            value={selectedFilterData || []}
                            options={customFilterOptions}
                            getOptionLabel={getOptionLabel}
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
                    ) : isBooleanFilter ? (
                        <CustomAggridBooleanFilter
                            value={selectedFilterData}
                            onChange={handleSelectedFilterDataChange}
                        />
                    ) : (
                        <Grid container direction={'column'} gap={0.8} sx={{ padding: '8px' }}>
                            <Select
                                value={selectedFilterComparator}
                                onChange={handleFilterComparatorChange}
                                displayEmpty
                                size={'small'}
                                sx={styles.input}
                            >
                                {filterComparators.map((filterComparator) => (
                                    <MenuItem key={filterComparator} value={filterComparator}>
                                        {intl.formatMessage({
                                            id: `filter.${filterComparator}`,
                                        })}
                                    </MenuItem>
                                ))}
                            </Select>
                            {isDuration ? (
                                <CustomAggridDurationFilter
                                    value={selectedFilterData}
                                    onChange={handleFilterDurationChange}
                                />
                            ) : (
                                <TextField
                                    size={'small'}
                                    fullWidth
                                    value={selectedFilterData || ''}
                                    onChange={handleFilterTextChange}
                                    placeholder={intl.formatMessage({
                                        id: 'filter.filterOoo',
                                    })}
                                    inputProps={{
                                        type: isNumberInput ? FILTER_DATA_TYPES.NUMBER : FILTER_DATA_TYPES.TEXT,
                                    }}
                                    sx={mergeSx(styles.input, isNumberInput && styles.noArrows)}
                                    InputProps={{
                                        endAdornment: selectedFilterData ? (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="clear filter"
                                                    onClick={handleClearFilter}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                    }}
                                />
                            )}
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
        sortConfig: PropTypes.arrayOf(
            PropTypes.shape({
                colId: PropTypes.string,
                sort: PropTypes.string,
                children: PropTypes.bool,
            })
        ),
        onSortChanged: PropTypes.func,
    }),
    isFilterable: PropTypes.bool,
    filterParams: PropTypes.shape({
        filterDataType: PropTypes.oneOf([FILTER_DATA_TYPES.TEXT, FILTER_DATA_TYPES.NUMBER, FILTER_DATA_TYPES.BOOLEAN]),
        filterComparators: PropTypes.arrayOf(PropTypes.string),
        debounceMs: PropTypes.number,
        updateFilter: PropTypes.func,
        customFilterOptions: PropTypes.arrayOf(PropTypes.string),
        filterSelector: PropTypes.array,
    }),
};

export default CustomHeaderComponent;
