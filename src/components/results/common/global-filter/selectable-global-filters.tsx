/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, ListItemButton, Paper } from '@mui/material';
import { resultsGlobalFilterStyles } from './global-filter-styles';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import React, { PropsWithChildren } from 'react';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';

const XS_COLUMN1: number = 3.5;
const XS_COLUMN2: number = 4;
const XS_COLUMN3: number = 4.5;

export interface SelectableGlobalFiltersProps extends PropsWithChildren {
    onClickGenericFilter: () => void;
    categories: string[];
    filterGroupSelected: string;
    setFilterGroupSelected: (value: ((prevState: string) => string) | string) => void;
}

// TODO ici se passe l'essentiel des changements
function SelectableGlobalFilters({
    children,
    onClickGenericFilter,
    categories,
    filterGroupSelected,
    setFilterGroupSelected,
}: Readonly<SelectableGlobalFiltersProps>) {
    return (
        <Paper sx={resultsGlobalFilterStyles.dropdown}>
            <Grid container>
                <Grid item xs={XS_COLUMN1} sx={resultsGlobalFilterStyles.cellTitle}>
                    <FormattedMessage id={'results.globalFilter.categories'} />
                </Grid>
                <Grid item xs={XS_COLUMN2} sx={resultsGlobalFilterStyles.cellTitle} />
                <Grid item xs={XS_COLUMN3} sx={resultsGlobalFilterStyles.cellTitle}>
                    TODO
                </Grid>
                <Grid item xs={XS_COLUMN1} sx={resultsGlobalFilterStyles.cell}>
                    <List sx={{ width: '100%' }}>
                        {categories.map((category) => {
                            return (
                                <ListItemButton onClick={() => setFilterGroupSelected(category)} key={category}>
                                    <ListItemText
                                        primary={<FormattedMessage id={'results.globalFilter.' + category} />}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Grid>
                <Grid item xs={XS_COLUMN2} sx={resultsGlobalFilterStyles.cell}>
                    <Box>{children}</Box>
                </Grid>
                <Grid item xs={XS_COLUMN3} sx={resultsGlobalFilterStyles.cell}>
                    <Box>
                        <Box
                            sx={{
                                paddingLeft: 2,
                                paddingTop: 1.5,
                            }}
                        >
                            <FormattedMessage id={'Filters'} />
                            <IconButton
                                color="primary"
                                sx={{
                                    align: 'right',
                                    marginLeft: 'auto',
                                }}
                                onMouseDown={onClickGenericFilter}
                            >
                                <FolderIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default SelectableGlobalFilters;
