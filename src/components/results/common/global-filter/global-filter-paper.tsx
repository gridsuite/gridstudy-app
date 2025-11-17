/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Chip, Grid, ListItem, ListItemButton, Paper, Typography } from '@mui/material';
import {
    getResultsGlobalFiltersChipStyle,
    GLOBAL_FILTERS_CELL_HEIGHT,
    IMPORT_FILTER_HEIGHT,
    resultsGlobalFilterStyles,
} from './global-filter-styles';
import { FormattedMessage, useIntl } from 'react-intl';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PropsWithChildren, RefObject, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { FilterType } from '../utils';
import { GlobalFilter } from './global-filter-types';
import { fetchSubstationPropertiesGlobalFilters, getOptionLabel, RECENT_FILTER } from './global-filter-utils';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {
    DirectoryItemSelector,
    ElementAttributes,
    ElementType,
    fetchElementsInfos,
    mergeSx,
    TreeViewFinderNodeProps,
    OverflowableChip,
} from '@gridsuite/commons-ui';
import { GlobalFilterContext } from './global-filter-context';

const XS_COLUMN1: number = 3.5;
const XS_COLUMN2: number = 4;
const XS_COLUMN3: number = 4.5;

type GlobalFilterPaperProps = PropsWithChildren<{
    autocompleteRef?: RefObject<HTMLElement>;
}>;

function GlobalFilterPaper({ children, autocompleteRef }: Readonly<GlobalFilterPaperProps>) {
    const {
        setOpenedDropdown,
        directoryItemSelectorOpen,
        setDirectoryItemSelectorOpen,
        filterGroupSelected,
        setFilterGroupSelected,
        selectedGlobalFilters,
        setSelectedGlobalFilters,
        onChange,
        filterCategories,
        genericFiltersStrictMode,
        equipmentTypes,
    } = useContext(GlobalFilterContext);
    const { translate } = useLocalizedCountries();
    const intl = useIntl();
    const [categories, setCategories] = useState<string[]>([]);

    const standardCategories: string[] = useMemo(() => {
        const allCategories = Object.values(FilterType) as string[];
        const filteredCategories = allCategories.filter(
            (category) =>
                filterCategories.includes(category as FilterType) && category !== FilterType.SUBSTATION_PROPERTY
        );
        return [RECENT_FILTER, ...filteredCategories];
    }, [filterCategories]);

    // fetches extra global filter subcategories if there are some in the local config
    useEffect(() => {
        fetchSubstationPropertiesGlobalFilters().then(({ substationPropertiesGlobalFilters }) => {
            const sortedCategories = [
                ...standardCategories,
                ...(substationPropertiesGlobalFilters ? Array.from(substationPropertiesGlobalFilters.keys()) : []),
            ];
            // generic filters always at the end of the menus
            const genericFilterCategory: string[] = sortedCategories.splice(
                sortedCategories.indexOf(FilterType.GENERIC_FILTER),
                1
            );
            if (genericFilterCategory.length > 0) {
                sortedCategories.push(genericFilterCategory[0]);
            }
            setCategories(sortedCategories);
        });
    }, [standardCategories]);

    const filtersMsg: string = useMemo(
        () =>
            intl.formatMessage(
                {
                    id:
                        selectedGlobalFilters.length < 2
                            ? 'results.globalFilter.activeFilter'
                            : 'results.globalFilter.activeFilters',
                },
                { filtersCount: selectedGlobalFilters.length }
            ),
        [intl, selectedGlobalFilters.length]
    );

    const addSelectedFilters = useCallback(
        async (values: TreeViewFinderNodeProps[] | undefined) => {
            if (!values) {
                return;
            }

            setOpenedDropdown(true);

            const elements: ElementAttributes[] = await fetchElementsInfos(values.map((value) => value.id));
            const newlySelectedFilters: GlobalFilter[] = [];
            elements.forEach((element: ElementAttributes) => {
                // ignore already selected filters and non-generic filters :
                if (!selectedGlobalFilters.find((filter) => filter.uuid && filter.uuid === element.elementUuid)) {
                    // add the others
                    newlySelectedFilters.push({
                        uuid: element.elementUuid,
                        equipmentType: element.specificMetadata?.equipmentType,
                        label: element.elementName,
                        filterType: FilterType.GENERIC_FILTER,
                        filterTypeFromMetadata: element.specificMetadata?.type,
                        recent: true,
                    });
                }
            });

            onChange([...selectedGlobalFilters, ...newlySelectedFilters]);
            setDirectoryItemSelectorOpen(false);
        },
        [onChange, selectedGlobalFilters, setDirectoryItemSelectorOpen, setOpenedDropdown]
    );

    const allowedEquipmentTypes = useMemo(
        () => (genericFiltersStrictMode ? equipmentTypes : undefined),
        [equipmentTypes, genericFiltersStrictMode]
    );

    return (
        <>
            <ClickAwayListener
                mouseEvent="onMouseDown"
                onClickAway={(event) => {
                    const target = event.target as HTMLElement;
                    // The autocomplete is considered "outside" of the dropdown
                    // so if the click is triggered on the autocomplete we don't close the dropdown
                    if (autocompleteRef?.current?.contains(target)) {
                        return;
                    }
                    if (!directoryItemSelectorOpen) {
                        setOpenedDropdown(false);
                    }
                }}
            >
                <Paper sx={resultsGlobalFilterStyles.dropdown}>
                    <Grid container>
                        <Grid item xs={XS_COLUMN1} sx={resultsGlobalFilterStyles.cellHeader}>
                            <FormattedMessage id={'results.globalFilter.categories'} />
                        </Grid>
                        <Grid item xs={XS_COLUMN2} sx={resultsGlobalFilterStyles.cellHeader} />
                        <Grid item xs={XS_COLUMN3} sx={resultsGlobalFilterStyles.cellHeader}>
                            <Typography variant="caption">{filtersMsg}</Typography>
                            <Button size="small" onClick={() => onChange([])} sx={resultsGlobalFilterStyles.miniButton}>
                                <Typography variant="caption">
                                    <FormattedMessage id="results.globalFilter.clearAll" />
                                </Typography>
                            </Button>
                        </Grid>
                        <Grid item xs={XS_COLUMN1} sx={resultsGlobalFilterStyles.cell}>
                            <List sx={resultsGlobalFilterStyles.list}>
                                {categories.map((category) => {
                                    return (
                                        <ListItemButton
                                            onClick={() => {
                                                setFilterGroupSelected(category);
                                            }}
                                            key={category}
                                            selected={category === filterGroupSelected}
                                        >
                                            <ListItemText
                                                primary={<FormattedMessage id={'results.globalFilter.' + category} />}
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Grid>
                        <Grid item xs={XS_COLUMN2} sx={resultsGlobalFilterStyles.cell}>
                            <Box
                                sx={mergeSx(resultsGlobalFilterStyles.list, {
                                    height:
                                        filterGroupSelected === FilterType.GENERIC_FILTER
                                            ? `${GLOBAL_FILTERS_CELL_HEIGHT - IMPORT_FILTER_HEIGHT}px`
                                            : `${GLOBAL_FILTERS_CELL_HEIGHT}px`,
                                })}
                            >
                                {children}
                            </Box>
                            {filterGroupSelected === FilterType.GENERIC_FILTER && (
                                <Button
                                    startIcon={<FileUploadIcon />}
                                    fullWidth={true}
                                    sx={resultsGlobalFilterStyles.importFilterButton}
                                    onMouseDown={() => {
                                        setDirectoryItemSelectorOpen(true);
                                    }}
                                >
                                    <FormattedMessage id={'results.globalFilter.loadFilter'} />
                                </Button>
                            )}
                        </Grid>
                        <Grid item xs={XS_COLUMN3} sx={resultsGlobalFilterStyles.cell}>
                            <List sx={mergeSx(resultsGlobalFilterStyles.list, { overflowY: 'auto' })}>
                                {selectedGlobalFilters.map((element: GlobalFilter) => (
                                    <ListItem key={element.label} sx={{ height: '1.8em' }}>
                                        <OverflowableChip
                                            label={getOptionLabel(element, translate)}
                                            sx={getResultsGlobalFiltersChipStyle(element.filterType)}
                                            onDelete={() => {
                                                const newSelectedGlobalFilters = selectedGlobalFilters.filter(
                                                    (filter) => filter !== element
                                                );
                                                setSelectedGlobalFilters(newSelectedGlobalFilters);
                                                onChange(newSelectedGlobalFilters);
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                    </Grid>
                </Paper>
            </ClickAwayListener>
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addSelectedFilters}
                types={[ElementType.FILTER]}
                equipmentTypes={allowedEquipmentTypes}
                title={intl.formatMessage({ id: 'Filters' })}
                multiSelect
            />
        </>
    );
}

export default GlobalFilterPaper;
