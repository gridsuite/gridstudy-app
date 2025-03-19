/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, ReactNode, useCallback, useMemo, useState } from 'react';
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
import { FilterAlt, WarningAmberRounded } from '@mui/icons-material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentGlobalFilters, removeFromRecentGlobalFilters } from '../../../../redux/actions';
import { AppState } from '../../../../redux/reducer';
import { AppDispatch } from '../../../../redux/store';
import { FilterType } from '../utils';
import {
    ElementType,
    TreeViewFinderNodeProps,
    mergeSx,
    DirectoryItemSelector,
    fetchElementsInfos,
    ElementAttributes,
    fetchDirectoryElementPath,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { UUID } from 'crypto';
import { GlobalFilter } from './global-filter-types';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import SelectableGlobalFilters from './selectable-global-filters';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { computeFullPath } from '../../../../utils/compute-title';

const recentFilter: string = 'recent';

export interface ResultsGlobalFilterProps {
    onChange: (filters: GlobalFilter[]) => void;
    filterableEquipmentTypes: EQUIPMENT_TYPES[];
    filters: GlobalFilter[];
}

const emptyArray: GlobalFilter[] = [];
const DEFAULT_NB_OPTIONS_DISPLAYED: number = 10;

const ResultsGlobalFilter: FunctionComponent<ResultsGlobalFilterProps> = ({
    onChange,
    filterableEquipmentTypes,
    filters = emptyArray,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
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
        async (globalFilters: GlobalFilter[]): Promise<void> => {
            let globalFiltersToAddToRecents: GlobalFilter[] = [...globalFilters];
            const fetchFiltersPromises = globalFilters
                // checks if the generic filters still exist, and sets their path value
                .filter((globalFilter: GlobalFilter) => globalFilter.filterType === FilterType.FILTER)
                .map(async (fetchedGlobalFilter: GlobalFilter) => {
                    if (fetchedGlobalFilter.uuid) {
                        try {
                            const response: ElementAttributes[] = await fetchDirectoryElementPath(
                                fetchedGlobalFilter.uuid
                            );
                            const parentDirectoriesNames = response.map((parent) => parent.elementName);
                            const path = computeFullPath(parentDirectoriesNames);
                            const fetchedFilter: GlobalFilter | undefined = globalFilters.find(
                                (globalFilter) => globalFilter.uuid === fetchedGlobalFilter.uuid
                            );
                            if (fetchedFilter && !fetchedFilter.path) {
                                fetchedFilter.path = path;
                            }
                        } catch (error) {
                            // remove those missing filters from recent global filters
                            dispatch(removeFromRecentGlobalFilters(fetchedGlobalFilter.uuid));
                            globalFiltersToAddToRecents = globalFiltersToAddToRecents.filter(
                                (globalFilter) => globalFilter.uuid !== fetchedGlobalFilter.uuid
                            );
                            snackError({
                                messageTxt: fetchedGlobalFilter.path,
                                headerId: 'ComputationFilterResultsError',
                            });
                        }
                    }
                });
            await Promise.all(fetchFiltersPromises);
            setSelectedGlobalFilters(globalFilters);
            // Updates the "recent" filters unless they have not been found
            dispatch(addToRecentGlobalFilters(globalFiltersToAddToRecents));
            onChange(globalFilters);
        },
        [dispatch, onChange, snackError]
    );

    const addSelectedFilters = useCallback(
        (values: TreeViewFinderNodeProps[] | undefined) => {
            if (!values) {
                return;
            }

            fetchElementsInfos(values.map((value) => value.id as UUID)).then((elements: ElementAttributes[]) => {
                const newlySelectedFilters: GlobalFilter[] = [];

                elements.forEach((element: ElementAttributes) => {
                    // ignore already selected filters and non generic filters :
                    if (!selectedGlobalFilters.find((filter) => filter.uuid && filter.uuid === element.elementUuid)) {
                        // add the others
                        newlySelectedFilters.push({
                            uuid: element.elementUuid,
                            equipmentType: element.specificMetadata?.equipmentType,
                            label: element.elementName,
                            filterType: FilterType.FILTER,
                            recent: true,
                        });
                    }
                });
                handleChange([...selectedGlobalFilters, ...newlySelectedFilters]);

                setDirectoryItemSelectorOpen(false);
            });
        },
        [handleChange, selectedGlobalFilters]
    );

    // checks the generic filter to see if they are applicable to the current tab
    const warningEquipmentTypeMessage: string = useMemo(() => {
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
        return '';
    }, [intl, filterableEquipmentTypes, selectedGlobalFilters]);

    const getCustomPaper = useCallback((children: ReactNode) => {
        return (
            <SelectableGlobalFilters
                children={children}
                onClickGenericFilter={() => setDirectoryItemSelectorOpen(true)}
            />
        );
    }, []);

    // renderInput : the inputfield that contains the chips, adornments and label
    const getRenderInput = useCallback(
        (params: AutocompleteRenderInputParams) => {
            return (
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
            );
        },
        [intl]
    );

    const filterOptions = useCallback(
        (options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) => {
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
        },
        [numberOfOptions, translate]
    );

    const warningTooltip = useCallback(() => {
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
    }, [warningEquipmentTypeMessage]);

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
                renderInput={(params: AutocompleteRenderInputParams) => getRenderInput(params)}
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
                filterOptions={(options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) =>
                    filterOptions(options, state)
                }
                PaperComponent={({ children }) => getCustomPaper(children)}
            />
            {warningEquipmentTypeMessage && warningTooltip()}
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addSelectedFilters}
                types={[ElementType.FILTER]}
                title={intl.formatMessage({ id: 'Filters' })}
                multiSelect
            />
        </>
    );
};

export default ResultsGlobalFilter;
