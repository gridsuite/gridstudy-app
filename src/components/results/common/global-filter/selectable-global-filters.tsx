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
import { FilterType } from '../utils';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';

export interface SelectableGlobalFiltersProps extends PropsWithChildren {
    onClickGenericFilter: () => void;
    categories: FilterType[]; // TODO ? may be turned into string to keep this more reusable ? => vérifier avec ceux qui bossent sur les tableurs
}

// TODO ici se passe l'essentiel des changements
function SelectableGlobalFilters({
    children,
    onClickGenericFilter,
    categories,
}: Readonly<SelectableGlobalFiltersProps>) {
    return (
        <Paper sx={resultsGlobalFilterStyles.dropdown}>
            <Grid container>
                <Grid item xs={4} sx={resultsGlobalFilterStyles.cell}>
                    <FormattedMessage id={'results.globalFilter.categories'} />
                </Grid>
                <Grid item xs={4} sx={resultsGlobalFilterStyles.cell} />
                <Grid item xs={4} sx={resultsGlobalFilterStyles.cell}>
                    TODO
                </Grid>

                <Grid item xs={4} sx={resultsGlobalFilterStyles.cell}>
                    <List>
                        {categories.map((category) => {
                            return (
                                <ListItemButton component="a" href="#simple-list">
                                    <ListItemText
                                        primary={<FormattedMessage id={'results.globalFilter.' + category} />}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Grid>
                <Grid item xs={4} sx={resultsGlobalFilterStyles.cell}>
                    <Box>{children}</Box>
                </Grid>
                <Grid item xs={4} sx={resultsGlobalFilterStyles.cell}>
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
