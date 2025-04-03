/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import {
    Autocomplete,
    AutocompleteCloseReason,
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
import { useDispatch, useSelector } from 'react-redux';
import { addToRecentGlobalFilters, removeFromRecentGlobalFilters } from '../../../../redux/actions';
import { AppState } from '../../../../redux/reducer';
import { AppDispatch } from '../../../../redux/store';
import { FilterType } from '../utils';
import {
    DirectoryItemSelector,
    ElementAttributes,
    ElementType,
    fetchDirectoryElementPath,
    fetchElementsInfos,
    TreeViewFinderNodeProps,
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
import { getOptionLabel } from './global-filter-utils';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import List from '@mui/material/List';
import OverflowTooltip from './overflow-tooltip';

const RECENT_FILTER: string = 'recent';

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

export interface ResultsGlobalFilterProps {
    onChange: (filters: GlobalFilter[]) => void;
    filterableEquipmentTypes: EQUIPMENT_TYPES[];
    filters: GlobalFilter[];
}

function ResultsGlobalFilter({
    onChange,
    filterableEquipmentTypes,
    filters = emptyArray,
}: Readonly<ResultsGlobalFilterProps>) {
    const intl = useIntl();
    const [openedDropdown, setOpenedDropdown] = useState(false);
    const { snackError } = useSnackMessage();
    const { translate } = useLocalizedCountries();
    const dispatch = useDispatch<AppDispatch>();
    const recentGlobalFilters: GlobalFilter[] = useSelector((state: AppState) => state.recentGlobalFilters);
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] = useState(false);
    // may be a filter type or a recent filter or whatever category
    const [filterGroupSelected, setFilterGroupSelected] = useState<string>(FilterType.VOLTAGE_LEVEL);
    const [selectedGlobalFilters, setSelectedGlobalFilters] = useState<GlobalFilter[]>([]);

    const handleChange = useCallback(
        async (globalFilters: GlobalFilter[]): Promise<void> => {
            let globalFiltersToAddToRecents: GlobalFilter[] = [...globalFilters];
            const fetchFiltersPromises: Promise<UUID | null>[] = globalFilters
                // checks if the generic filters still exist, and sets their path value
                .filter((globalFilter: GlobalFilter) => globalFilter.filterType === FilterType.GENERIC_FILTER)
                .map(async (fetchedGlobalFilter: GlobalFilter): Promise<UUID | null> => {
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
                            return fetchedGlobalFilter.uuid;
                        }
                    }
                    return null;
                });
            const missingFiltersUuids = await Promise.all(fetchFiltersPromises);
            // remove those missing filters from recent global filters
            missingFiltersUuids
                .filter((uuid: UUID | null) => uuid != null)
                .forEach((missingFiltersuuid) => {
                    if (missingFiltersuuid != null) {
                        dispatch(removeFromRecentGlobalFilters(missingFiltersuuid));
                    }
                    globalFiltersToAddToRecents = globalFiltersToAddToRecents.filter(
                        (globalFilter) => globalFilter.uuid !== missingFiltersuuid
                    );
                    snackError({
                        messageTxt: globalFilters.find((filter) => filter.uuid === missingFiltersuuid)?.path,
                        headerId: 'ComputationFilterResultsError',
                    });
                });
            setSelectedGlobalFilters(globalFilters);
            // Updates the "recent" filters unless they have not been found
            dispatch(addToRecentGlobalFilters(globalFiltersToAddToRecents));
            // notify "father component" of the change
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
                            filterType: FilterType.GENERIC_FILTER,
                            recent: true,
                        });
                    }
                });
                handleChange([...selectedGlobalFilters, ...newlySelectedFilters]).then(() => {
                    return setDirectoryItemSelectorOpen(false);
                });
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
    return (
        <>
            <Autocomplete
                value={selectedGlobalFilters}
                open={openedDropdown}
                onOpen={() => setOpenedDropdown(true)}
                onClose={(_event, reason: AutocompleteCloseReason) => {
                    // the user has to click on the arrow in order to close the dropdown
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
                onChange={(_e, value) => handleChange(value)}
                groupBy={(option: GlobalFilter): string => (option.recent ? RECENT_FILTER : option.filterType)}
                renderInput={RenderInput}
                // renderTags : the chips in the inputField
                renderTags={(filters: GlobalFilter[], getTagsProps) =>
                    filters.map((element: GlobalFilter, index: number) => (
                        <Chip
                            size="small"
                            label={getOptionLabel(element, translate)}
                            {...getTagsProps({ index })}
                            sx={getResultsGlobalFiltersChipStyle(element.filterType)}
                        />
                    ))
                }
                // an "empty" renderGroup is needed in order to avoid the default behavior
                renderGroup={(item: AutocompleteRenderGroupParams) => {
                    const { group, children } = item;
                    return <Box key={'keyBoxGroup_' + group}>{children}</Box>;
                }}
                // renderOption : the checkboxes visible when we focus on the AutoComplete
                renderOption={(props, option: GlobalFilter, { selected }) => {
                    const { key, children, color, ...otherProps } = props;
                    return (
                        <Box component="li" key={key} {...otherProps}>
                            <ListItemButton selected={selected}>
                                <Checkbox
                                    size="small"
                                    icon={<CheckBoxOutlineBlankIcon />}
                                    checkedIcon={<CheckBoxIcon />}
                                    checked={selected}
                                    sx={{ paddingLeft: '0px' }}
                                />
                                <OverflowTooltip label={getOptionLabel(option, translate) ?? ''} />
                            </ListItemButton>
                        </Box>
                    );
                }}
                // Allows to find the corresponding chips without taking into account the recent status
                isOptionEqualToValue={(option: GlobalFilter, value: GlobalFilter) =>
                    option.label === value.label && option.filterType === value.filterType && option.uuid === value.uuid
                }
                filterOptions={(options: GlobalFilter[], state: FilterOptionsState<GlobalFilter>) =>
                    filterOptions(options, state)
                }
                PaperComponent={(props: PropsWithChildren) => (
                    <SelectableGlobalFilters
                        categories={[RECENT_FILTER, ...Object.values(FilterType)]}
                        children={props.children}
                        onClickGenericFilterButton={() => setDirectoryItemSelectorOpen(true)}
                        filterGroupSelected={filterGroupSelected}
                        setFilterGroupSelected={setFilterGroupSelected}
                        selectedGlobalFilters={selectedGlobalFilters}
                        updateFilters={handleChange}
                    />
                )}
                // removes all the default styles :
                ListboxComponent={(props) => <List role="datalist">{props.children}</List>}
                noOptionsText={''}
            />
            {warningEquipmentTypeMessage && (
                <WarningTooltip warningEquipmentTypeMessage={warningEquipmentTypeMessage} />
            )}
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addSelectedFilters}
                types={[ElementType.FILTER]}
                title={intl.formatMessage({ id: 'Filters' })}
                multiSelect
            />
        </>
    );
}

export default ResultsGlobalFilter;
