/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useContext, useMemo, useRef } from 'react';
import {
    Autocomplete,
    AutocompleteCloseReason,
    AutocompleteRenderGetTagProps,
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams,
    Box,
    Checkbox,
    Chip,
    FilterOptionsState,
    InputAdornment,
    ListItemButton,
    TextField,
} from '@mui/material';
import { FilterAlt, WarningAmberRounded } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { FilterType } from '../utils';
import { OverflowableText } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { GlobalFilter } from './global-filter-types';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import GlobalFilterPaper from './global-filter-paper';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { getOptionLabel, RECENT_FILTER } from './global-filter-utils';
import { GlobalFilterContext } from './global-filter-context';

const TAG_LIMIT_NUMBER: number = 4;

const emptyArray: GlobalFilter[] = [];

// renderInput : the inputfield that contains the chips, adornments and label
function RenderInput({
    id,
    size,
    fullWidth,
    inputProps,
    disabled,
    InputProps: { startAdornment, ...otherInputProps },
}: Readonly<AutocompleteRenderInputParams>) {
    const intl = useIntl();
    return (
        <TextField
            id={id}
            size={size}
            fullWidth={fullWidth}
            inputProps={inputProps}
            disabled={disabled}
            label={intl.formatMessage({
                id: 'results.globalFilter.fillerText',
            })}
            InputProps={{
                ...otherInputProps,
                startAdornment: (
                    <>
                        <InputAdornment position="start">
                            <FilterAlt />
                        </InputAdornment>
                        {startAdornment}
                    </>
                ),
            }}
        />
    );
}

interface WarningTooltipProps {
    warningEquipmentTypeMessage: string;
}

function WarningTooltip({ warningEquipmentTypeMessage }: Readonly<WarningTooltipProps>) {
    return (
        <Tooltip
            title={warningEquipmentTypeMessage}
            placement="right"
            arrow
            PopperProps={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -15],
                        },
                    },
                ],
            }}
        >
            <IconButton size="small" sx={{ cursor: 'default' }}>
                <WarningAmberRounded color="warning" fontSize="medium" />
            </IconButton>
        </Tooltip>
    );
}

export type GlobalFilterAutocompleteProps = {
    filterableEquipmentTypes: EQUIPMENT_TYPES[];
    filters: GlobalFilter[];
};

function GlobalFilterAutocomplete({
    filterableEquipmentTypes,
    filters = emptyArray,
}: Readonly<GlobalFilterAutocompleteProps>) {
    const { openedDropdown, setOpenedDropdown, filterGroupSelected, selectedGlobalFilters, onChange } =
        useContext(GlobalFilterContext);
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const recentGlobalFilters: GlobalFilter[] = useSelector((state: AppState) => state.recentGlobalFilters);
    const autocompleteRef = useRef<HTMLDivElement>(null);

    // checks the generic filter to see if they are applicable to the current tab
    const warningEquipmentTypeMessage: string = useMemo(() => {
        const inappropriateFilters: string[] = selectedGlobalFilters
            .filter(
                (filter) =>
                    filter.equipmentType &&
                    (!filterableEquipmentTypes.find((eqptType) => eqptType.toString() === filter.equipmentType) ||
                        (filter.equipmentType === 'VOLTAGE_LEVEL' && filter.filterTypeFromMetadata === 'EXPERT')) // expert filter on voltage level non applicable
            )
            .map((filter) => filter.label);

        if (inappropriateFilters.length > 0) {
            if (inappropriateFilters.length > 1) {
                return intl.formatMessage(
                    {
                        id: 'results.globalFilter.nonApplicableExtra',
                    },
                    { filterName: inappropriateFilters[0], extraFiltersNum: inappropriateFilters.length - 1 }
                );
            }
            return intl.formatMessage(
                {
                    id: 'results.globalFilter.nonApplicable',
                },
                { filterName: inappropriateFilters[0] }
            );
        }
        return '';
    }, [intl, filterableEquipmentTypes, selectedGlobalFilters]);

    const filterOptions = useCallback(
        (options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) => {
            return (
                options
                    // Allows to find the translated countries (and not their countryCodes) when the user inputs a search value
                    .filter((option: GlobalFilter) => {
                        const labelToMatch: string =
                            option.filterType === FilterType.COUNTRY ? translate(option.label) : option.label;
                        return labelToMatch.toLowerCase().includes(state.inputValue.toLowerCase());
                    })
                    .filter((option: GlobalFilter) =>
                        // recent filters are a group in itself
                        option?.recent
                            ? filterGroupSelected === RECENT_FILTER
                            : option.filterType === filterGroupSelected
                    )
            );
        },
        [filterGroupSelected, translate]
    );

    const options = useMemo(
        () => [
            ...recentGlobalFilters.map((filter) => {
                return { ...filter, recent: true };
            }),
            // recent generic filters are displayed 2 times : once in the recent filters (see above) and also in the generic filters :
            ...recentGlobalFilters
                .filter((filter) => filter.filterType === FilterType.GENERIC_FILTER)
                .map((filter) => {
                    return { ...filter, recent: false };
                }),
            ...filters
                .map((filter) => {
                    return { ...filter, recent: false };
                })
                .sort((a: GlobalFilter, b: GlobalFilter) => {
                    // only the countries are sorted alphabetically
                    if (a.filterType === FilterType.COUNTRY && b.filterType === FilterType.COUNTRY) {
                        const bt: string = translate(b.label);
                        const at: string = translate(a.label);
                        return at.localeCompare(bt);
                    }
                    return 0;
                }),
        ],
        [filters, recentGlobalFilters, translate]
    );

    const inputFieldChip = useCallback(
        (element: GlobalFilter, index: number, getTagsProps: AutocompleteRenderGetTagProps, filtersNumber: number) => {
            const label = getOptionLabel(element, translate);
            const key: string = `inputFieldChip_${element.label}`;
            if (index < TAG_LIMIT_NUMBER) {
                return (
                    <Chip
                        size="small"
                        label={label}
                        {...getTagsProps({ index })}
                        key={key}
                        sx={getResultsGlobalFiltersChipStyle(element.filterType)}
                    />
                );
            }

            // the last chip displayed, with a +, the following are hidden
            if (index === TAG_LIMIT_NUMBER) {
                return <Chip size="small" label={`+${filtersNumber - TAG_LIMIT_NUMBER}`} key={key} />;
            }

            return undefined;
        },
        [translate]
    );

    return (
        <>
            <div ref={autocompleteRef}>
                <Autocomplete
                    value={selectedGlobalFilters}
                    open={openedDropdown}
                    onOpen={() => setOpenedDropdown(true)}
                    onClose={(_event, reason: AutocompleteCloseReason) => {
                        // the 'blur' (click away) closing of the dropdown is controlled by the PaperComponent (which is the dropdown itself)
                        if (reason !== 'selectOption' && reason !== 'blur') {
                            setOpenedDropdown(false);
                        }
                    }}
                    sx={resultsGlobalFilterStyles.autocomplete}
                    multiple
                    id="result-global-filter"
                    size="small"
                    openOnFocus
                    disableCloseOnSelect
                    options={options}
                    onChange={(_e, value) => onChange(value)}
                    groupBy={(option: GlobalFilter): string => (option.recent ? RECENT_FILTER : option.filterType)}
                    renderInput={RenderInput}
                    renderTags={(filters: GlobalFilter[], getTagsProps: AutocompleteRenderGetTagProps) => {
                        return (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    flexWrap: 'nowrap',
                                    maxWidth: '90%',
                                }}
                            >
                                {filters.map((element, index) => {
                                    return inputFieldChip(element, index, getTagsProps, filters.length);
                                })}
                            </Box>
                        );
                    }}
                    // an "empty" renderGroup is needed in order to avoid the default behavior
                    renderGroup={(item: AutocompleteRenderGroupParams) => {
                        const { group, children } = item;
                        return <Box key={'keyBoxGroup_' + group}>{children}</Box>;
                    }}
                    // renderOption : the checkboxes visible when we focus on the AutoComplete
                    renderOption={(props, option: GlobalFilter, { selected }) => {
                        const { key, children, color, ...otherProps } = props;
                        // recent selected options are not displayed in the recent tab :
                        const hideOption = selected && option.recent;
                        return (
                            !hideOption && (
                                <ListItemButton key={key} selected={selected} component="li" {...otherProps}>
                                    <Checkbox size="small" checked={selected} />
                                    <OverflowableText text={getOptionLabel(option, translate) ?? ''} />
                                </ListItemButton>
                            )
                        );
                    }}
                    // Allows to find the corresponding chips without taking into account the recent status
                    isOptionEqualToValue={(option: GlobalFilter, value: GlobalFilter) =>
                        option.label === value.label &&
                        option.filterType === value.filterType &&
                        option.uuid === value.uuid
                    }
                    filterOptions={(options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) =>
                        filterOptions(options, state)
                    }
                    // dropdown paper
                    PaperComponent={(props) => <GlobalFilterPaper {...props} autocompleteRef={autocompleteRef} />}
                    ListboxProps={{
                        sx: {
                            '& .MuiAutocomplete-option': {
                                paddingLeft: 0,
                            },
                            height: '100%',
                            maxHeight: '100%',
                            overflowY: 'auto',
                        },
                    }}
                    noOptionsText={''}
                />
            </div>
            {warningEquipmentTypeMessage && (
                <WarningTooltip warningEquipmentTypeMessage={warningEquipmentTypeMessage} />
            )}
        </>
    );
}

export default GlobalFilterAutocomplete;
