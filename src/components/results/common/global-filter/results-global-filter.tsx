/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useState } from 'react';
import {
    Autocomplete,
    AutocompleteRenderInputParams,
    AutocompleteValue,
    Box,
    Chip,
    FilterOptionsState,
    InputAdornment,
    TextField,
} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentGlobalFilters } from '../../../../redux/actions';
import { AppState } from '../../../../redux/reducer';
import { AppDispatch } from '../../../../redux/store';
import { FilterType } from '../utils';
import { ElementType, TreeViewFinderNodeProps, mergeSx, DirectoryItemSelector } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { UUID } from 'crypto';
import { GlobalFilter } from './global-filter-types';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import SelectableGlobalFilters from './selectable-global-filters';

const recentFilter: string = 'recent';

export interface ResultsGlobalFilterProps {
    onChange: (filters: GlobalFilter[]) => void;
    filtrableEquipmentTypes: EQUIPMENT_TYPES[];
    filters: GlobalFilter[];
}

const emptyArray: GlobalFilter[] = [];
const DEFAULT_NB_OPTIONS_DISPLAYED: number = 10;

const ResultsGlobalFilter: FunctionComponent<ResultsGlobalFilterProps> = ({
    onChange,
    filtrableEquipmentTypes,
    filters = emptyArray,
}) => {
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const dispatch = useDispatch<AppDispatch>();
    const recentGlobalFilters: GlobalFilter[] = useSelector((state: AppState) => state.recentGlobalFilters);
    // Map <FilterType, number of options of this type>
    // -1 number of options means that the user required everything to be displayed no matter the number of options
    const [numberOfOptions, setNumberOfOptions] = useState<Map<string, number>>(
        new Map([
            [FilterType.COUNTRY, 0],
            [FilterType.VOLTAGE_LEVEL, 0],
            [FilterType.FILTER, 0],
        ])
    );
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] = useState(false);
    const [selectedFiltersElements, setSelectedFiltersElements] = useState<UUID[]>([]);
    const [selectedGlobalFilters, setSelectedGlobalFilters] = useState<GlobalFilter[]>([]);

    const getOptionLabel = useCallback(
        (option: GlobalFilter) => {
            switch (option.filterType) {
                case FilterType.COUNTRY:
                    return translate(option.label);
                case FilterType.VOLTAGE_LEVEL:
                    return option.label + ' kV';
                case FilterType.FILTER:
                    return option.label;
            }
        },
        [translate]
    );

    const handleChange = useCallback(
        (value: GlobalFilter[]): void => {
            setSelectedGlobalFilters(value);
            // Updates the "recent" filters
            dispatch(addToRecentGlobalFilters(value));
            onChange(value);
        },
        [dispatch, onChange]
    );

    const addSelectedFilters = useCallback(
        (values: TreeViewFinderNodeProps[] | undefined) => {
            if (!values) {
                return;
            }
            // if we select a chip and return a new values, we remove it to be replaced TODO ??
            /*if (selected?.length > 0 && values?.length > 0) {
                selected.forEach((chip) => {
                    remove(getValues(name).findIndex((item: FieldValues) => item.id === chip));
                });
            }*/

            const filters: GlobalFilter[] = [];

            values.forEach((value) => {
                filters.push({
                    uuid: value.id,
                    label: value.name,
                    filterType: FilterType.FILTER,
                    recent: true,
                });

                // Check if the element is already present  ==> TODO, attention doublons d'uuid
                /*if (getValues(name).find((v: FieldValues) => v?.id === otherElementAttributes.id) !== undefined) {
                snackError({
                    messageTxt: '',
                    headerId: 'directory_items_input/ElementAlreadyUsed',
                });*/
            });
            handleChange([...selectedGlobalFilters, ...filters]);

            setDirectoryItemSelectorOpen(false);
            setSelectedFiltersElements([]);
        },
        [handleChange, selectedGlobalFilters]
    );

    return (
        <>
            <Autocomplete
                value={selectedGlobalFilters as AutocompleteValue<GlobalFilter, true, false, false>}
                sx={resultsGlobalFilterStyles.autocomplete}
                multiple
                id="result-global-filter"
                size="small"
                limitTags={2}
                disableCloseOnSelect
                options={[
                    ...recentGlobalFilters.map((filter) => {
                        return { ...filter, recent: true };
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
                ]}
                onChange={(_e, value) => handleChange(value as GlobalFilter[])}
                groupBy={(option: GlobalFilter): string => (option.recent ? recentFilter : option.filterType)}
                // renderInput : the inputfield that contains the chips, adornments and label
                renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField
                        id={params.id}
                        size={params.size}
                        fullWidth={params.fullWidth}
                        inputProps={params.inputProps}
                        disabled={params.disabled}
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
                renderTags={(filters: GlobalFilter[], getTagsProps) =>
                    filters.map((element: GlobalFilter, index: number) => (
                        <Chip
                            size="small"
                            label={getOptionLabel(element)}
                            {...getTagsProps({ index })}
                            sx={getResultsGlobalFiltersChipStyle(element.filterType)}
                        />
                    ))
                }
                // renderGroup : the boxes below that are visible when we focus on the AutoComplete
                renderGroup={(item) => {
                    const { group, children } = item;
                    const recent: boolean = group === recentFilter;
                    const numOfGroupOptions: number = numberOfOptions.get(group) ?? 0;
                    return (
                        <Box
                            key={'keyBoxGroup_' + group}
                            sx={mergeSx(
                                resultsGlobalFilterStyles.chipBox,
                                !recent ? resultsGlobalFilterStyles.filterTypeBox : undefined
                            )}
                        >
                            <Box sx={resultsGlobalFilterStyles.groupLabel}>
                                <FormattedMessage id={'results.globalFilter.' + group} />
                            </Box>
                            {children}
                            {!recent && numOfGroupOptions - DEFAULT_NB_OPTIONS_DISPLAYED > 0 && (
                                <Chip
                                    component="li"
                                    label={'+ ' + (numOfGroupOptions - DEFAULT_NB_OPTIONS_DISPLAYED)}
                                    size="small"
                                    sx={getResultsGlobalFiltersChipStyle(group)}
                                    onClick={() => setNumberOfOptions(new Map([...numberOfOptions, [group, -1]]))}
                                />
                            )}
                        </Box>
                    );
                }}
                // renderOption : the chips that are in the boxes that is visible when we focus on the AutoComplete
                renderOption={(props, option: GlobalFilter) => {
                    const { children, color, ...otherProps } = props;
                    return (
                        <Chip
                            {...otherProps}
                            component="li"
                            label={getOptionLabel(option)}
                            size="small"
                            sx={getResultsGlobalFiltersChipStyle(option.filterType)}
                        />
                    );
                }}
                // Allows to find the corresponding chips without taking into account the recent status
                isOptionEqualToValue={(option: GlobalFilter, value: GlobalFilter) =>
                    option.label === value.label && option.filterType === value.filterType && option.uuid === value.uuid
                }
                filterOptions={(options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) => {
                    const numByGroup: Map<string, number> = new Map();
                    const filteredOptions: GlobalFilter[] = options
                        // Allows to find the translated countries (and not their countryCodes) when the user inputs a search value
                        .filter((option: GlobalFilter) => {
                            const labelToMatch: string =
                                option.filterType === FilterType.COUNTRY ? translate(option.label) : option.label;
                            return labelToMatch.toLowerCase().includes(state.inputValue.toLowerCase());
                        })
                        // display only a part of the options if there are too many (unless required by the user)
                        .filter((option: GlobalFilter) => {
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
                PaperComponent={({ children }) => (
                    <SelectableGlobalFilters
                        children={children}
                        onClickGenericFilter={() => setDirectoryItemSelectorOpen(true)}
                    />
                )}
            />
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addSelectedFilters}
                types={[ElementType.FILTER]}
                equipmentTypes={filtrableEquipmentTypes}
                title={intl.formatMessage({ id: 'Filters' })}
                selected={selectedFiltersElements}
                multiSelect
            />
        </>
    );
};

export default ResultsGlobalFilter;
