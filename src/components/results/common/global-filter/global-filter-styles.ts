/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Theme } from '@mui/material';
import { cyan } from '@mui/material/colors';
import { FilterType } from '../utils';
import { mergeSx } from '@gridsuite/commons-ui';

export const getResultsGlobalFiltersChipStyle = (filterType: string) => {
    let chipStyle;
    switch (filterType) {
        case FilterType.COUNTRY:
            chipStyle = resultsGlobalFilterStyles.chipCountry;
            break;
        case FilterType.VOLTAGE_LEVEL:
            chipStyle = resultsGlobalFilterStyles.chipVoltageLevel;
            break;
        case FilterType.GENERIC_FILTER:
            chipStyle = resultsGlobalFilterStyles.chipGenericFilter;
            break;
    }
    return mergeSx(resultsGlobalFilterStyles.chip, chipStyle);
};

const AUTOCOMPLETE_WIDTH: number = 500;
const POPPER_EXTRA_WIDTH: number = 250;
export const GLOBAL_FILTERS_CELL_HEIGHT: number = 400;
export const IMPORT_FILTER_HEIGHT: number = 40;

export const resultsGlobalFilterStyles = {
    autocomplete: (theme: Theme) => ({
        width: AUTOCOMPLETE_WIDTH + 'px',
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            zIndex: 20,
            background: theme.palette.tabBackground,
        },
        '.MuiInputLabel-root': {
            zIndex: 30,
            width: 'auto',
        },
    }),
    // from the expanded part :
    dropdown: () => ({
        position: 'relative',
        left: `0px`,
        width: `${AUTOCOMPLETE_WIDTH + POPPER_EXTRA_WIDTH}px`,
    }),
    cellHeader: (theme: Theme) => ({
        color: theme.palette.text.secondary,
        fontSize: '1em',
        padding: 1,
        border: '1px solid',
        borderColor: theme.palette.divider,
    }),
    cell: (theme: Theme) => ({
        display: 'flex',
        flexDirection: 'column',
        color: theme.palette.text.secondary,
        fontSize: '1em',
        width: '100%',
        borderLeft: '1px solid',
        borderColor: theme.palette.divider,
        height: `${GLOBAL_FILTERS_CELL_HEIGHT}px`,
        overflow: 'auto',
    }),
    importFilterButton: (theme: Theme) => ({
        color: theme.palette.text.secondary,
        fontSize: '0.8em',
        borderTop: '1px solid',
        borderColor: theme.palette.divider,
        height: `${IMPORT_FILTER_HEIGHT}px`,
        justifyContent: 'flex-start',
        paddingLeft: '24px',
    }),
    miniButton: (theme: Theme) => ({
        color: theme.palette.text.primary,
        border: '1px solid',
        borderColor: theme.palette.text.primary,
        padding: 0,
        paddingLeft: 0.5,
        paddingRight: 0.5,
        position: 'absolute',
        top: 12,
        right: 8,
    }),
    chip: {
        '&.MuiChip-root': {
            borderRadius: '100px solid',
            margin: '4px 2px 4px 2px',
            padding: '0',
            color: 'white',
        },
        '.MuiChip-deleteIcon': {
            color: 'white',
            opacity: 0.6,
        },
        '.MuiChip-deleteIcon:hover': {
            color: 'white',
            opacity: 1,
        },
        '&.Mui-focusVisible': {
            width: 'unset', // prevents the chip from changing size when selected with the keyboard
            height: 'unset', // prevents the chip from changing size when selected with the keyboard
            position: 'relative',
        },
    },
    chipCountry: (theme: Theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${theme.palette.info.main}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${theme.palette.info.dark}!important`,
        },
    }),
    chipVoltageLevel: (theme: Theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${theme.palette.secondary.main}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${theme.palette.secondary.dark}!important`,
        },
    }),
    chipGenericFilter: () => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${cyan['500']}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${cyan['700']}!important`,
        },
    }),
};
