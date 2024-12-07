/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownward, ArrowUpward, FilterAlt } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Box,
    Autocomplete,
    Badge,
    debounce,
    FormHelperText,
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
import { countDecimalPlaces } from '../../utils/rounding.js';
import { computeTolerance } from '../../hooks/use-aggrid-local-row-filter';
import { useSnackMessage } from '@gridsuite/commons-ui';

const styles = {
    exponent: {
        position: 'relative',
        bottom: '1ex',
        fontSize: '80%',
    },
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

/**
 * displays a rounding precision like this : 'Rounded to 10^decimalAfterDot' or as a decimal number if decimalAfterDot <= 4
 */
export function DisplayRounding({ decimalAfterDot }) {
    const intl = useIntl();
    const displayAsPower10 = decimalAfterDot > 4;
    const baseMessage =
        intl.formatMessage({
            id: 'filter.rounded',
        }) + ' ';

    const decimalAfterDotStr = -decimalAfterDot;
    return (
        <FormHelperText>
            {baseMessage}
            {displayAsPower10 ? (
                <>
                    10
                    <Box component="span" sx={styles.exponent}>
                        {decimalAfterDotStr}
                    </Box>
                </>
            ) : (
                1 / Math.pow(10, decimalAfterDot)
            )}
        </FormHelperText>
    );
}

const CustomHeaderComponent = ({
    field,
    displayName,
    isSortable = false,
    sortParams = {},
    isFilterable = false,
    filterParams = {},
    getEnumLabel, // Used for translation of enum values in the filter
    isCountry, // Used for translation of the countries options in the filter
    forceDisplayFilterIcon = false,
    tabIndex,
    isCustomColumn = false,
    Menu,
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
    const { snackWarning } = useSnackMessage();

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
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef(null);
    const [decimalAfterDot, setDecimalAfterDot] = useState(0);

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
            tolerance: undefined,
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
            tolerance: isNumberInput ? computeTolerance(value) : undefined,
        });
        if (isNumberInput) {
            let decimalAfterDot = countDecimalPlaces(value);
            if (decimalAfterDot >= 13) {
                snackWarning({
                    headerId: 'filter.warnRounding',
                });
            }
            setDecimalAfterDot(decimalAfterDot);
        }
    };

    const handleFilterDurationChange = (value) => {
        setSelectedFilterData(value);
        debouncedUpdateFilter(field, {
            value: value,
            type: selectedFilterComparator,
            dataType: FILTER_DATA_TYPES.NUMBER,
            tolerance: undefined,
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
            tolerance: isNumberInput ? computeTolerance(data) : undefined,
        });
    };

    const handleFilterComparatorChange = (event) => {
        const newType = event.target.value;
        setSelectedFilterComparator(newType);
        debouncedUpdateFilter(field, {
            value: selectedFilterData,
            type: newType,
            dataType: filterDataType,
            tolerance: isNumberInput ? computeTolerance(selectedFilterData) : undefined,
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

    const renderFilterIcon = (shouldDisplayFilterIcon, handleShowFilter, selectedFilterData) => (
        <Grid
            item
            sx={{
                overflow: 'visible',
            }}
        >
            {(forceDisplayFilterIcon || shouldDisplayFilterIcon) && (
                <Grid item>
                    <IconButton size={'small'} onClick={handleShowFilter}>
                        <Badge
                            color="secondary"
                            variant={selectedFilterData?.length ? 'dot' : null}
                            invisible={!selectedFilterData}
                        >
                            <FilterAlt sx={styles.iconSize} />
                        </Badge>
                    </IconButton>
                </Grid>
            )}
        </Grid>
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
                        {forceDisplayFilterIcon &&
                            shouldActivateFilter &&
                            renderFilterIcon(true, handleShowFilter, selectedFilterData)}
                    </Grid>

                    {!forceDisplayFilterIcon &&
                        shouldActivateFilter &&
                        renderFilterIcon(shouldDisplayFilterIcon, handleShowFilter, selectedFilterData)}
                </Grid>
                {isCustomColumn && (
                    <Grid item direction={'row'}>
                        <IconButton ref={menuButtonRef} size={'small'} onClick={() => setMenuOpen(true)}>
                            <Badge color="secondary">
                                <MoreVertIcon sx={styles.iconSize} />
                            </Badge>
                        </IconButton>
                    </Grid>
                )}
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
                                <Grid container item direction={'column'} gap={0.2}>
                                    <Grid item>
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
                                    </Grid>
                                    {isNumberInput && decimalAfterDot > 0 ? (
                                        <Grid item>
                                            <DisplayRounding decimalAfterDot={decimalAfterDot} />
                                        </Grid>
                                    ) : null}
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Popover>
            )}
            {Menu && (
                <Menu
                    open={menuOpen}
                    tabIndex={tabIndex}
                    customColumnName={field}
                    onClose={() => setMenuOpen(false)}
                    anchorEl={menuButtonRef.current}
                />
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
    tabIndex: PropTypes.number,
    isCustomColumn: PropTypes.bool,
    Menu: PropTypes.elementType,
};

export default CustomHeaderComponent;
