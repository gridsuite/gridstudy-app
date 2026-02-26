/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useContext, useMemo, useRef } from 'react';
import {
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteCloseReason,
    AutocompleteRenderGetTagProps,
    AutocompleteRenderInputParams,
    Box,
    Checkbox,
    Chip,
    FilterOptionsState,
    InputAdornment,
    ListItemButton,
    PaperProps,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { Delete as DeleteIcon, FilterAlt, WarningAmberRounded } from '@mui/icons-material';
import { useIntl } from 'react-intl';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useDispatch } from 'react-redux';
import { FilterType } from '../utils';
import { OverflowableChip, OverflowableText } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { GlobalFilter } from './global-filter-types';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import GlobalFilterPaper from './global-filter-paper';
import IconButton from '@mui/material/IconButton';
import { getOptionLabel, RECENT_FILTER } from './global-filter-utils';
import { GlobalFilterContext } from './global-filter-context';
import {
    addToSelectedGlobalFilters,
    clearSelectedGlobalFilters,
    removeFromGlobalFilterOptions,
    removeFromSelectedGlobalFilters,
} from '../../../../redux/actions';
import { AppDispatch } from '../../../../redux/store';

const TAG_LIMIT_NUMBER: number = 4;

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

function formatVoltageRange(option: GlobalFilter): string {
    if (option.minValue != null && option.maxValue != null) {
        return `[${option.minValue} kV, ${option.maxValue} kV]`;
    }
    return '';
}

function RenderOption({
    props,
    option,
    state,
}: {
    props: Omit<React.HTMLAttributes<HTMLLIElement>, 'key'>;
    option: GlobalFilter;
    state: { selected: boolean };
}) {
    const { children, ...otherProps } = props;
    const intl = useIntl();
    const dispatch = useDispatch<AppDispatch>();
    const { translate } = useLocalizedCountries();

    // recent selected options are not displayed in the recent tab :
    const hideOption = state.selected && option.recent;
    const label = getOptionLabel(option, translate, intl) ?? '';

    let content: React.ReactNode;
    switch (option.filterType) {
        case FilterType.VOLTAGE_LEVEL:
            content = (
                <Tooltip title={formatVoltageRange(option)} placement="right" arrow>
                    <Typography>{label}</Typography>
                </Tooltip>
            );
            break;
        case FilterType.SUBSTATION_OR_VL:
        case FilterType.GENERIC_FILTER:
            content = (
                <>
                    <OverflowableText text={label} width="100%" />
                    <IconButton
                        sx={{
                            display: 'none',
                            '.MuiListItemButton-root:hover &': {
                                display: 'inline-flex',
                            },
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeFromGlobalFilterOptions(option.id));
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </>
            );
            break;
        default:
            content = <OverflowableText text={label} />;
    }

    return (
        !hideOption && (
            <ListItemButton selected={state.selected} component="li" {...otherProps}>
                <Checkbox size="small" checked={state.selected} />
                {content}
            </ListItemButton>
        )
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

function GlobalFilterAutocomplete() {
    const {
        openedDropdown,
        setOpenedDropdown,
        filterGroupSelected,
        genericFiltersStrictMode,
        tableType,
        tableUuid,
        globalFilterOptions,
        selectedGlobalFilters,
        filterCategories,
        filterableEquipmentTypes,
    } = useContext(GlobalFilterContext);
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const dispatch = useDispatch();
    const autocompleteRef = useRef<HTMLDivElement | null>(null);

    // checks the generic filter to see if they are applicable to the current tab
    const warningEquipmentTypeMessage: string = useMemo(() => {
        if (!genericFiltersStrictMode) {
            const inappropriateFilters: string[] = selectedGlobalFilters
                .filter(
                    (filter) =>
                        filter.equipmentType &&
                        !filterableEquipmentTypes.find((eqptType) => eqptType.toString() === filter.equipmentType)
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
        }
        return '';
    }, [genericFiltersStrictMode, selectedGlobalFilters, filterableEquipmentTypes, intl]);

    // Filters the 3options 'on the fly' based on the user's search input value and the category he selected (country, voltage level, recent...)
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
                    .filter((option: GlobalFilter) => {
                        // recent filters are a group in itself
                        if (filterGroupSelected === RECENT_FILTER) {
                            return option.recent === true;
                        } else if (option.filterSubtype) {
                            // if the filter has a subtype it should be filtered through it instead of filterType
                            return option.filterSubtype === filterGroupSelected;
                        } else {
                            return option.filterType === filterGroupSelected;
                        }
                    })
            );
        },
        [filterGroupSelected, translate]
    );

    const options = useMemo(
        () =>
            globalFilterOptions
                .filter(
                    (filter) =>
                        filterCategories.includes(filter.filterType) &&
                        (genericFiltersStrictMode && filter.filterType === FilterType.GENERIC_FILTER
                            ? filterableEquipmentTypes.includes(filter.equipmentType as EQUIPMENT_TYPES)
                            : true)
                )
                .sort((a: GlobalFilter, b: GlobalFilter) => {
                    // only the countries are sorted alphabetically
                    if (a.filterType === FilterType.COUNTRY && b.filterType === FilterType.COUNTRY) {
                        const bt: string = translate(b.label);
                        const at: string = translate(a.label);
                        return at.localeCompare(bt);
                    }
                    return 0;
                }),
        [globalFilterOptions, translate, filterCategories, genericFiltersStrictMode, filterableEquipmentTypes]
    );

    const inputFieldChip = useCallback(
        (element: GlobalFilter, index: number, getTagsProps: AutocompleteRenderGetTagProps, filtersNumber: number) => {
            const label = getOptionLabel(element, translate, intl);
            const key: string = `inputFieldChip_${element.label}`;
            if (index < TAG_LIMIT_NUMBER) {
                return (
                    <OverflowableChip
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
        [translate, intl]
    );

    const isOptionEqualToValue = useCallback((option: GlobalFilter, value: GlobalFilter) => option.id === value.id, []);

    const PaperComponentMemo = useCallback(
        (props: PaperProps) => <GlobalFilterPaper {...props} autocompleteRef={autocompleteRef} />,
        [autocompleteRef]
    );

    const handleOnChange = useCallback(
        (
            _event: React.SyntheticEvent,
            _value: GlobalFilter[],
            reason: AutocompleteChangeReason,
            details?: AutocompleteChangeDetails<GlobalFilter>
        ) => {
            switch (reason) {
                case 'selectOption':
                    dispatch(addToSelectedGlobalFilters(tableType, tableUuid, [details!.option.id]));
                    break;
                case 'removeOption':
                    dispatch(removeFromSelectedGlobalFilters(tableType, tableUuid, [details!.option.id]));
                    break;
                case 'clear':
                    dispatch(clearSelectedGlobalFilters(tableType, tableUuid));
                    break;
                default:
                    break;
            }
        },
        [dispatch, tableType, tableUuid]
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
                    onChange={handleOnChange}
                    renderInput={RenderInput}
                    renderTags={(filters: GlobalFilter[], getTagsProps: AutocompleteRenderGetTagProps) => {
                        return (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflowX: 'hidden',
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
                    // renderOption : the checkboxes visible when we focus on the AutoComplete
                    renderOption={(props, option, state) => {
                        const { key, ...otherProps } = props;
                        return <RenderOption key={key} props={otherProps} option={option} state={state} />;
                    }}
                    // Allows to find the corresponding chips without taking into account the recent status
                    isOptionEqualToValue={isOptionEqualToValue}
                    filterOptions={(options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) =>
                        filterOptions(options, state)
                    }
                    // dropdown paper
                    PaperComponent={PaperComponentMemo}
                    ListboxProps={{
                        sx: {
                            '& .MuiAutocomplete-option': {
                                paddingLeft: 0,
                                paddingRight: 0,
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
