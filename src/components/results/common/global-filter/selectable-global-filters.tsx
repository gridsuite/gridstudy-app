/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Button, Chip, Grid, ListItem, ListItemButton, Paper, Typography } from '@mui/material';
import {
    GLOBAL_FILTERS_CELL_HEIGHT,
    getResultsGlobalFiltersChipStyle,
    IMPORT_FILTER_HEIGHT,
    resultsGlobalFilterStyles,
} from './global-filter-styles';
import { FormattedMessage, useIntl } from 'react-intl';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import React, { PropsWithChildren, useMemo } from 'react';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import { FilterType } from '../utils';
import { GlobalFilter } from './global-filter-types';
import { getOptionLabel } from './global-filter-utils';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const XS_COLUMN1: number = 3.5;
const XS_COLUMN2: number = 4;
const XS_COLUMN3: number = 4.5;

export interface SelectableGlobalFiltersProps extends PropsWithChildren {
    onClickGenericFilterButton: () => void;
    categories: string[];
    filterGroupSelected: string;
    setFilterGroupSelected: (value: ((prevState: string) => string) | string) => void;
    selectedGlobalFilters: GlobalFilter[];
    updateFilters: (globalFilters: GlobalFilter[]) => Promise<void>;
    lockClosing: boolean; // prevent this component from being closed
    setOpenedDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

function SelectableGlobalFilters({
    children,
    onClickGenericFilterButton,
    categories,
    filterGroupSelected,
    setFilterGroupSelected,
    selectedGlobalFilters,
    updateFilters,
    lockClosing,
    setOpenedDropdown,
}: Readonly<SelectableGlobalFiltersProps>) {
    const { translate } = useLocalizedCountries();
    const intl = useIntl();

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

    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            onClickAway={() => {
                if (!lockClosing) {
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
                        <Button
                            size="small"
                            onClick={() => updateFilters([])}
                            sx={resultsGlobalFilterStyles.miniButton}
                        >
                            <Typography variant="caption">
                                <FormattedMessage id="results.globalFilter.clearAll" />
                            </Typography>
                        </Button>
                    </Grid>
                    <Grid item xs={XS_COLUMN1} sx={resultsGlobalFilterStyles.cell}>
                        <List>
                            {categories.map((category) => {
                                return (
                                    <ListItemButton
                                        onClick={() => setFilterGroupSelected(category)}
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
                    <Grid item xs={XS_COLUMN2}>
                        <Box sx={resultsGlobalFilterStyles.cell}>
                            <Box
                                sx={
                                    filterGroupSelected === FilterType.GENERIC_FILTER
                                        ? {
                                              height: `${GLOBAL_FILTERS_CELL_HEIGHT - IMPORT_FILTER_HEIGHT}px`,
                                              overflow: 'auto',
                                          }
                                        : undefined
                                }
                            >
                                {children}
                            </Box>
                            {filterGroupSelected === FilterType.GENERIC_FILTER && (
                                <Button
                                    startIcon={<FileUploadIcon />}
                                    fullWidth={true}
                                    sx={resultsGlobalFilterStyles.importFilterButton}
                                    onMouseDown={onClickGenericFilterButton}
                                >
                                    <FormattedMessage id={'results.globalFilter.loadFilter'} />
                                </Button>
                            )}
                        </Box>
                    </Grid>
                    <Grid item xs={XS_COLUMN3}>
                        <List sx={resultsGlobalFilterStyles.cell}>
                            {selectedGlobalFilters.map((element: GlobalFilter) => (
                                <ListItem key={element.label} sx={{ height: '1.8em' }}>
                                    <Chip
                                        size="small"
                                        label={getOptionLabel(element, translate)}
                                        sx={getResultsGlobalFiltersChipStyle(element.filterType)}
                                        onDelete={() => {
                                            updateFilters([
                                                ...selectedGlobalFilters.filter((filter) => filter !== element),
                                            ]).then();
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                </Grid>
            </Paper>
        </ClickAwayListener>
    );
}

export default SelectableGlobalFilters;
