/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Box } from '@mui/system';
import {Autocomplete, Chip, InputAdornment, TextField} from '@mui/material';
import { FilterAlt } from '@mui/icons-material';
import {FormattedMessage, useIntl} from 'react-intl';
import {mergeSx} from "../../utils/functions";

const styles = {
    filter: (theme) => ({
        height: '100%',
        width: 420,
        '& .Mui-expanded, & .Mui-focused, & .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            zIndex: 2,
            '&:not(:first-child)': { // Fixes the background of the input label when there is focus
                background: 'linear-gradient(to top, '+theme.palette.tabBackground+' 80%, transparent 80%)',
            }
        }
    }),
    chipBox: {
        width: '100%',
        display: "flex",
        flexWrap: 'wrap',
        padding: '0.5em',
    },
    recentBox: (theme) => ({
        borderBottom: '1px solid',
        borderColor: theme.palette.divider,
    }),
    recentLabel: (theme) => ({
        color: theme.palette.text.secondary,
        fontSize: 'small',
        width: '100%',
        paddingLeft: 1,
    }),
    chip: (theme) => ({
        margin: '4px 2px 4px 2px',
        padding:0,
        //color: theme.palette.getContrastText(theme.palette.text.primary),
    }),
};

const filters = [
    {
        label: "France",
        filterType: "country",
        recent: true,
    },
    {
        label: "380 kv",
        filterType: "voltageLevel",
    },
    {
        label: "220 kv",
        filterType: "voltageLevel",
        recent: true,
    },
    {
        label: "Belgium",
        filterType: "country",
        recent: true,
    },
    {
        label: "South Korea",
        filterType: "country",
    },
    {
        label: "Italy",
        filterType: "country",
        recent: true,
    },
    {
        label: "400 kv",
        filterType: "voltageLevel",
        recent: true,
    },
    {
        label: "150 kv",
        filterType: "voltageLevel",
    },
    {
        label: "Germany",
        filterType: "country",
        recent: true,
    },
    {
        label: "Spain",
        filterType: "country",
    },
];

const ResultsGlobalFilter = (props) => {
    const intl = useIntl();

    return (
        <Box
            //style={{ display: selected ? 'inherit' : 'none' }}
            sx={styles.filter}
            //{...other}
        >
            <Autocomplete
                multiple
                id="result-global-filter"
                size="small"
                limitTags={3}
                disableCloseOnSelect
                options={filters.sort((a, b) => !!b.recent - !!a.recent)}
                groupBy={(option) => !!option.recent}
                renderOption={(params, option) => (
                    <Chip
                        {...params}
                        label={option.label}
                        size='small'
                        color={option.filterType === 'country' ? 'primary' : 'secondary'}
                        sx={styles.chip}
                    />
                )}
                renderGroup={(item) => {
                    const { group, children } = item;
                    const itemRecentAvailable = !!group;
                    return (
                        <Box
                            sx={mergeSx(
                                styles.chipBox,
                                itemRecentAvailable && styles.recentBox
                            )}
                        >
                            {itemRecentAvailable && (
                                <Box sx={styles.recentLabel}>
                                    <FormattedMessage id="results.globalFilter.recent"/>
                                </Box>
                            )}
                            {children}
                        </Box>
                    );
                }}
                /*ListboxProps={{
                    sx: styles.openBoxList,
                }}*/
                renderInput={(params) => (
                        <TextField
                            {...params}
                            label={intl.formatMessage({
                                id: 'results.globalFilter.fillerText',
                            })}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <InputAdornment position="start">
                                            <FilterAlt/>
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                            }}

                        />
                    )
                }
                />
        </Box>
    );
};

export default ResultsGlobalFilter;
