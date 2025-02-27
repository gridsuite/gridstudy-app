/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, SyntheticEvent, useCallback, useState } from 'react';
import { Autocomplete, Box, Chip, FilterOptionsState, InputAdornment, TextField, Theme } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../utils/functions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentGlobalFilters } from '../../../redux/actions';
import { AppState } from '../../../redux/reducer';
import { AppDispatch } from '../../../redux/store';
import { FilterType } from './utils';

const styles = {
    autocomplete: (theme: Theme) => ({
        width: '420px',
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
            backgroundColor: 'unset', // prevents the field from changing size when selected with the keyboard
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            zIndex: 20,
            background: theme.palette.tabBackground,
        },
        '.MuiInputLabel-root': {
            zIndex: 30,
            width: 'auto',
        },
    }),
    chipBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        padding: '0.5em',
    },
    filterTypeBox: (theme: Theme) => ({
        borderTop: '1px solid',
        borderColor: theme.palette.divider,
    }),
    groupLabel: (theme: Theme) => ({
        color: theme.palette.text.secondary,
        fontSize: '0.9em',
        width: '100%',
        paddingLeft: 1,
    }),
    chip: {
        '&.MuiChip-root': {
            borderRadius: '100px solid',
            margin: '4px 2px 4px 2px',
            padding: '0',
            color: 'white',
        },
        '.MuiChip-deleteIcon': {
            color: 'white',
            opacity: 0.6,
        },
        '.MuiChip-deleteIcon:hover': {
            color: 'white',
            opacity: 1,
        },
        '&.Mui-focusVisible': {
            width: 'unset', // prevents the chip from changing size when selected with the keyboard
            height: 'unset', // prevents the chip from changing size when selected with the keyboard
            position: 'relative',
        },
    },
    chipCountry: (theme: Theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: theme.palette.info.main + `!important`,
        },
        '&.MuiChip-root:hover': {
            backgroundColor: theme.palette.info.dark + `!important`,
        },
        '&.MuiChip-root:focus': {
            backgroundColor: theme.palette.info.dark + `!important`,
        },
    }),
    chipVoltageLevel: (theme: Theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: theme.palette.secondary.main + `!important`,
        },
        '&.MuiChip-root:hover': {
            backgroundColor: theme.palette.secondary.dark + `!important`,
        },
        '&.MuiChip-root:focus': {
            backgroundColor: theme.palette.secondary.dark + `!important`,
        },
    }),
};

const recentFilter: string = 'recent';

export interface Filter {
    label: string;
    filterType: string;
    recent?: boolean;
}

export interface ResultsGlobalFilterProps {
    onChange: (value: Filter[]) => void;
    filters: Filter[];
}

const emptyArray: Filter[] = [];
const DEFAULT_NB_OPTIONS_DISPLAYED: number = 10;

const ResultsGlobalFilter: FunctionComponent<ResultsGlobalFilterProps> = ({ onChange, filters = emptyArray }) => {
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const dispatch = useDispatch<AppDispatch>();
    const recentGlobalFilters: Filter[] = useSelector((state: AppState) => state.recentGlobalFilters);
    // -1 number of options means that the user required everything to be displayed no matter the number of options
    const [numberOfOptions, setNumberOfOptions] = useState<Map<string, number>>(
        new Map([
            [FilterType.COUNTRY, 0],
            [FilterType.VOLTAGE_LEVEL, 0],
        ])
    );

    const getOptionLabel = useCallback(
        (option: Filter) => (option.filterType === FilterType.COUNTRY ? translate(option.label) : option.label + ' kV'),
        [translate]
    );

    const getChipStyle = useCallback(
        (filterType: string) =>
            mergeSx(styles.chip, filterType === FilterType.COUNTRY ? styles.chipCountry : styles.chipVoltageLevel),
        []
    );

    const handleChange = useCallback(
        (_event: SyntheticEvent<Element, Event>, value: Filter[]) => {
            // Updates the "recent" filters
            dispatch(addToRecentGlobalFilters(value));
            onChange(value);
        },
        [dispatch, onChange]
    );

    return (
        <Box>
            <Autocomplete
                sx={styles.autocomplete}
                multiple
                id="result-global-filter"
                size="small"
                limitTags={3}
                disableCloseOnSelect
                options={[
                    ...recentGlobalFilters.map((filter) => {
                        return { ...filter, recent: true };
                    }),
                    ...filters
                        .map((filter) => {
                            return { ...filter, recent: false };
                        })
                        .sort((a: Filter, b: Filter) => {
                            // only the countries are sorted alphabetically
                            if (a.filterType === FilterType.COUNTRY && b.filterType === FilterType.COUNTRY) {
                                return translate(a.label).localeCompare(translate(b.label));
                            }
                            return 0;
                        }),
                ]}
                onChange={handleChange}
                groupBy={(option: Filter): string => (option.recent ? recentFilter : option.filterType)}
                // renderInput : the inputfield that contains the chips, adornments and label
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={intl.formatMessage({
                            id: 'results.globalFilter.fillerText',
                        })}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        <FilterAlt />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                // renderTags : the chips in the inputField
                renderTags={(filters: Filter[], getTagsProps) =>
                    filters.map((element: Filter, index: number) => (
                        <Chip
                            size={'small'}
                            label={getOptionLabel(element)}
                            {...getTagsProps({ index })}
                            sx={getChipStyle(element.filterType)}
                        />
                    ))
                }
                // renderGroup : the boxes below that are visible when we focus on the AutoComplete
                renderGroup={(item) => {
                    const { group, children } = item;
                    const recent: boolean = group === recentFilter;
                    const numOfGroupOptions: number = numberOfOptions.get(group) ?? 0;
                    return (
                        <Box key={'keyBoxGroup_' + group} sx={mergeSx(styles.chipBox, !recent && styles.filterTypeBox)}>
                            <Box sx={styles.groupLabel}>
                                <FormattedMessage id={'results.globalFilter.' + group} />
                            </Box>
                            {children}
                            {!recent && numOfGroupOptions - DEFAULT_NB_OPTIONS_DISPLAYED > 0 && (
                                <Chip
                                    component="li"
                                    label={'+ ' + (numOfGroupOptions - DEFAULT_NB_OPTIONS_DISPLAYED)}
                                    size="small"
                                    sx={getChipStyle(group)}
                                    onClick={() => setNumberOfOptions(new Map([...numberOfOptions, [group, -1]]))}
                                />
                            )}
                        </Box>
                    );
                }}
                // renderOption : the chips that are in the boxes that is visible when we focus on the AutoComplete
                renderOption={(props, option: Filter) => {
                    const { children, color, ...otherProps } = props;
                    return (
                        <Chip
                            {...otherProps}
                            component="li"
                            label={getOptionLabel(option)}
                            size="small"
                            sx={getChipStyle(option.filterType)}
                        />
                    );
                }}
                // Allows to find the corresponding chips without taking into account the recent status
                isOptionEqualToValue={(option: Filter, value: Filter) =>
                    option.label === value.label && option.filterType === value.filterType
                }
                filterOptions={(options: Filter[], state: FilterOptionsState<Filter>) => {
                    const numByGroup: Map<string, number> = new Map();
                    const filteredOptions: Filter[] = options
                        // Allows to find the translated countries (and not their countryCodes) when the user inputs a search value
                        .filter((option) => {
                            const labelToMatch =
                                option.filterType === FilterType.COUNTRY ? translate(option.label) : option.label;
                            return labelToMatch.toLowerCase().includes(state.inputValue.toLowerCase());
                        })
                        // display only a part of the options if there are too many (unless required by the user)
                        .filter((option: Filter) => {
                            if (option.recent || numberOfOptions.get(option.filterType) === -1) {
                                return true;
                            }
                            const num = numByGroup.get(option.filterType) ?? 0;
                            numByGroup.set(option.filterType, num + 1);
                            return num < DEFAULT_NB_OPTIONS_DISPLAYED;
                        });

                    // if the numberOfOptions has not been set yet :
                    if (Array.from(numberOfOptions.values()).find((number) => number !== 0) === undefined) {
                        setNumberOfOptions(numByGroup);
                    }

                    return filteredOptions;
                }}
            />
        </Box>
    );
};

export default ResultsGlobalFilter;
