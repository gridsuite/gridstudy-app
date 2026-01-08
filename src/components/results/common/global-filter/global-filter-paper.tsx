/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Grid, ListItemButton, Paper, Typography } from '@mui/material';
import { GLOBAL_FILTERS_CELL_HEIGHT, IMPORT_FILTER_HEIGHT, resultsGlobalFilterStyles } from './global-filter-styles';
import { FormattedMessage, useIntl } from 'react-intl';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { PropsWithChildren, RefObject, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { FilterType, isCriteriaFilterType } from '../utils';
import { GlobalFilter } from './global-filter-types';
import { fetchSubstationPropertiesGlobalFilters, RECENT_FILTER } from './global-filter-utils';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {
    DirectoryItemSelector,
    ElementAttributes,
    ElementType,
    fetchElementsInfos,
    mergeSx,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { GlobalFilterContext } from './global-filter-context';
import SelectedGlobalFilters from './selected-global-filters';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { TextWithInfoIcon } from './text-with-info-icon';

const XS_COLUMN1: number = 3;
const XS_COLUMN2: number = 4;
const XS_COLUMN3: number = 5;

type GlobalFilterPaperProps = PropsWithChildren<{
    autocompleteRef?: RefObject<HTMLElement | null>;
}>;

function GlobalFilterPaper({ children, autocompleteRef }: Readonly<GlobalFilterPaperProps>) {
    const {
        setOpenedDropdown,
        directoryItemSelectorOpen,
        setDirectoryItemSelectorOpen,
        filterGroupSelected,
        setFilterGroupSelected,
        selectedGlobalFilters,
        onChange,
        filterCategories,
        genericFiltersStrictMode,
        equipmentTypes,
    } = useContext(GlobalFilterContext);
    const intl = useIntl();
    const [categories, setCategories] = useState<string[]>([]);

    const standardCategories: string[] = useMemo(() => {
        const allCategories = Object.values(FilterType) as string[];
        const filteredCategories = allCategories
            .filter(
                (category) =>
                    filterCategories.includes(category as FilterType) && category !== FilterType.SUBSTATION_PROPERTY
            )
            .filter((category) => {
                // for the following EQUIPMENT_TYPES the GENERIC_FILTER FilterType is hidden
                // because the SUBSTATION_OR_VL FilterType handles all the possible filters
                const onlyVoltageLevels = equipmentTypes?.every(
                    (equipment) =>
                        equipment === EQUIPMENT_TYPES.VOLTAGE_LEVEL ||
                        equipment === EQUIPMENT_TYPES.BUS ||
                        equipment === EQUIPMENT_TYPES.BUSBAR_SECTION
                );
                return !(category === FilterType.GENERIC_FILTER && onlyVoltageLevels);
            })
            .filter((category) => {
                // when we are filtering substations the SUBSTATION_OR_VL makes no sense and is removed :
                const onlySubstations =
                    equipmentTypes?.length === 1 && equipmentTypes[0] === EQUIPMENT_TYPES.SUBSTATION;
                return !(category === FilterType.SUBSTATION_OR_VL && onlySubstations);
            });
        return [RECENT_FILTER, ...filteredCategories];
    }, [filterCategories, equipmentTypes]);

    // fetches extra global filter subcategories if there are some in the local config
    useEffect(() => {
        fetchSubstationPropertiesGlobalFilters().then(({ substationPropertiesGlobalFilters }) => {
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
                    const substationOrVoltageLevel =
                        element.specificMetadata?.equipmentType === EQUIPMENT_TYPES.SUBSTATION ||
                        element.specificMetadata?.equipmentType === EQUIPMENT_TYPES.VOLTAGE_LEVEL;
                    newlySelectedFilters.push({
                        uuid: element.elementUuid,
                        equipmentType: element.specificMetadata?.equipmentType,
                        label: element.elementName,
                        filterType: substationOrVoltageLevel ? FilterType.SUBSTATION_OR_VL : FilterType.GENERIC_FILTER,
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

    /**
     * substations and voltage levels filters are not part of the regular selectable elements filters.
     * They are selected through their specific filter category (FilterType.SUBSTATION_OR_VL)
     */
    const allowedEquipmentTypes = useMemo(() => {
        if (filterGroupSelected === FilterType.SUBSTATION_OR_VL) {
            return [EQUIPMENT_TYPES.SUBSTATION, EQUIPMENT_TYPES.VOLTAGE_LEVEL];
        }

        return genericFiltersStrictMode
            ? equipmentTypes
            : Object.values(EQUIPMENT_TYPES).filter(
                  (equipmentType) =>
                      equipmentType !== EQUIPMENT_TYPES.SUBSTATION && equipmentType !== EQUIPMENT_TYPES.VOLTAGE_LEVEL
              );
    }, [equipmentTypes, genericFiltersStrictMode, filterGroupSelected]);

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
                            <TextWithInfoIcon
                                text="results.globalFilter.categories"
                                tooltipMessage="results.globalFilter.categoriesHelp"
                            />
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
                                                primary={
                                                    category === 'genericFilter' ? (
                                                        <TextWithInfoIcon
                                                            text="results.globalFilter.genericFilter"
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
                        <Grid item xs={XS_COLUMN2} sx={resultsGlobalFilterStyles.cell}>
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
                        <Grid item xs={XS_COLUMN3} sx={resultsGlobalFilterStyles.cell}>
                            <SelectedGlobalFilters />
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
