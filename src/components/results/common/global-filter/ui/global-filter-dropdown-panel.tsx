/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Grid2 as Grid, ListItemButton, Paper, Typography } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PropsWithChildren, RefObject, useCallback, useMemo, useState } from 'react';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { RECENT_FILTER } from '../utils/global-filter-utils';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {
    DirectoryItemSelector,
    ElementType,
    EquipmentType,
    mergeSx,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import SelectedGlobalFilters from './selected-global-filters';
import { LabelWithInfoTooltip } from './label-with-info-tooltip';
import { useGlobalFilterContext } from '../context/global-filter-context';
import { GLOBAL_FILTERS_CELL_HEIGHT, IMPORT_FILTER_HEIGHT, resultsGlobalFilterStyles } from '../global-filter.style';
import { FilterType, isCriteriaFilterType } from '../types/filter.type';
import type { GlobalFilterProps } from './global-filter';

const XS_COLUMN1: number = 3;
const XS_COLUMN2: number = 4;
const XS_COLUMN3: number = 5;

type GlobalFilterPaperProps = PropsWithChildren<
    GlobalFilterProps & {
        autocompleteRef?: RefObject<HTMLElement | null>;
        setOpenedDropdown: (open: boolean) => void;
        filterGroupSelected: string;
        setFilterGroupSelected: (selectedFilterGroup: string) => void;
    }
>;

function GlobalFilterDropdownPanel({
    children,
    autocompleteRef,
    setOpenedDropdown,
    filterGroupSelected,
    setFilterGroupSelected,
    substationPropertiesGlobalFilters,
    filterCategories,
    genericFiltersStrictMode,
    filterableEquipmentTypes,
    translateCountryCode,
}: Readonly<GlobalFilterPaperProps>) {
    const intl = useIntl();
    const [directoryItemSelectorOpen, setDirectoryItemSelectorOpen] = useState(false);
    const { selectedGlobalFilters, clearSelectedGlobalFilters, addFiltersToGlobalFiltersOptions } =
        useGlobalFilterContext();

    const filteringOnlySubstations = useMemo(() => {
        return filterableEquipmentTypes?.length === 1 && filterableEquipmentTypes[0] === EquipmentType.SUBSTATION;
    }, [filterableEquipmentTypes]);

    const standardCategories: string[] = useMemo(() => {
        const filteredCategories = filterCategories
            // removes the SUBSTATION_PROPERTY type because we want to display them by subtype
            .filter((category) => category !== FilterType.SUBSTATION_PROPERTY)
            .filter((category) => {
                // for the following EquipmentTypes the GENERIC_FILTER FilterType is hidden
                // because the SUBSTATION_OR_VL FilterType handles all the possible filters
                const onlyVoltageLevels = filterableEquipmentTypes?.every(
                    (equipment) =>
                        equipment === EquipmentType.VOLTAGE_LEVEL ||
                        equipment === EquipmentType.BUS ||
                        equipment === EquipmentType.BUSBAR_SECTION
                );
                return !(category === FilterType.GENERIC_FILTER && onlyVoltageLevels);
            })
            .filter((category) => {
                // when we are filtering substations the SUBSTATION_OR_VL makes no sense and is removed :
                return !(category === FilterType.SUBSTATION_OR_VL && filteringOnlySubstations);
            });
        return [RECENT_FILTER, ...filteredCategories];
    }, [filterCategories, filterableEquipmentTypes, filteringOnlySubstations]);

    // adds extra global filter subcategories if there are some in the local config
    const categories = useMemo(() => {
        const sortedCategories = [
            ...standardCategories,
            ...(substationPropertiesGlobalFilters ? Array.from(substationPropertiesGlobalFilters.keys()) : []),
        ];
        // criteria filters are always at the end of the menu
        const substationCategory: string[] = sortedCategories.splice(
            sortedCategories.indexOf(FilterType.SUBSTATION_OR_VL),
            1
        );
        if (substationCategory.length > 0) {
            sortedCategories.push(substationCategory[0]);
        }
        const genericFilterCategory: string[] = sortedCategories.splice(
            sortedCategories.indexOf(FilterType.GENERIC_FILTER),
            1
        );
        if (genericFilterCategory.length > 0) {
            sortedCategories.push(genericFilterCategory[0]);
        }
        return sortedCategories;
    }, [standardCategories, substationPropertiesGlobalFilters]);

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

    const addSelectedFiltersToGlobalFiltersOptions = useCallback(
        async (values: TreeViewFinderNodeProps[] | undefined) => {
            if (!values) {
                return;
            }

            setOpenedDropdown(true);
            await addFiltersToGlobalFiltersOptions(values.map((value) => value.id));
            setDirectoryItemSelectorOpen(false);
        },
        [addFiltersToGlobalFiltersOptions, setDirectoryItemSelectorOpen, setOpenedDropdown]
    );

    /**
     * substations and voltage levels filters are not part of the regular selectable elements filters.
     * They are selected through their specific filter category (FilterType.SUBSTATION_OR_VL)
     */
    const allowedEquipmentTypes = useMemo(() => {
        if (filterGroupSelected === FilterType.SUBSTATION_OR_VL) {
            return [EquipmentType.SUBSTATION, EquipmentType.VOLTAGE_LEVEL];
        }

        return genericFiltersStrictMode
            ? filterableEquipmentTypes
            : Object.values(EquipmentType).filter(
                  (equipmentType) =>
                      equipmentType !== EquipmentType.SUBSTATION && equipmentType !== EquipmentType.VOLTAGE_LEVEL
              );
    }, [filterableEquipmentTypes, genericFiltersStrictMode, filterGroupSelected]);

    return (
        <>
            <ClickAwayListener
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
                        <Grid size={XS_COLUMN1} sx={resultsGlobalFilterStyles.cellHeader}>
                            <LabelWithInfoTooltip
                                text="results.globalFilter.categories"
                                tooltipMessage="results.globalFilter.categoriesHelp"
                            />
                        </Grid>
                        <Grid size={XS_COLUMN2} sx={resultsGlobalFilterStyles.cellHeader} />
                        <Grid size={XS_COLUMN3} sx={resultsGlobalFilterStyles.cellHeader}>
                            <Typography variant="caption">{filtersMsg}</Typography>
                            <Button
                                size="small"
                                onClick={clearSelectedGlobalFilters}
                                sx={resultsGlobalFilterStyles.miniButton}
                                data-testid="GlobalFilterClearAllButton"
                            >
                                <Typography variant="caption">
                                    <FormattedMessage id="results.globalFilter.clearAll" />
                                </Typography>
                            </Button>
                        </Grid>
                        <Grid size={XS_COLUMN1} sx={resultsGlobalFilterStyles.cell}>
                            <List sx={resultsGlobalFilterStyles.list}>
                                {categories.map((category) => {
                                    return (
                                        <ListItemButton
                                            onClick={() => {
                                                setFilterGroupSelected(category);
                                            }}
                                            key={category}
                                            selected={category === filterGroupSelected}
                                            data-testid={`GlobalFilterCategory${category}`}
                                        >
                                            <ListItemText
                                                primary={
                                                    category === 'genericFilter' ? (
                                                        <LabelWithInfoTooltip
                                                            text={
                                                                filteringOnlySubstations
                                                                    ? 'results.globalFilter.substationFilter'
                                                                    : 'results.globalFilter.genericFilter'
                                                            }
                                                            tooltipMessage="results.globalFilter.elementsHelp"
                                                        />
                                                    ) : (
                                                        <FormattedMessage id={'results.globalFilter.' + category} />
                                                    )
                                                }
                                            />
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Grid>
                        <Grid size={XS_COLUMN2} sx={resultsGlobalFilterStyles.cell}>
                            <Box
                                sx={mergeSx(resultsGlobalFilterStyles.list, {
                                    height: isCriteriaFilterType(filterGroupSelected)
                                        ? `${GLOBAL_FILTERS_CELL_HEIGHT - IMPORT_FILTER_HEIGHT}px`
                                        : `${GLOBAL_FILTERS_CELL_HEIGHT}px`,
                                })}
                            >
                                {children}
                            </Box>
                            {isCriteriaFilterType(filterGroupSelected) && (
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
                        <Grid size={XS_COLUMN3} sx={resultsGlobalFilterStyles.cell}>
                            <SelectedGlobalFilters translateCountryCode={translateCountryCode} />
                        </Grid>
                    </Grid>
                </Paper>
            </ClickAwayListener>
            <DirectoryItemSelector
                open={directoryItemSelectorOpen}
                onClose={addSelectedFiltersToGlobalFiltersOptions}
                types={[ElementType.FILTER]}
                equipmentTypes={allowedEquipmentTypes}
                title={intl.formatMessage({ id: 'Filters' })}
                multiSelect
            />
        </>
    );
}

export default GlobalFilterDropdownPanel;
