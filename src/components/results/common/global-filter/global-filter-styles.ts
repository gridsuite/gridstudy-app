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

const AUTOCOMPLETE_WIDTH: number = 420;
const POPPER_EXTRA_WIDTH: number = 250;

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
    chipBox: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        padding: '0.5em',
    },
    // from the expanded part :
    dropdown: (theme: Theme) => ({
        position: 'absolute',
        left: `-${POPPER_EXTRA_WIDTH / 2}px`,
        width: `${AUTOCOMPLETE_WIDTH + POPPER_EXTRA_WIDTH}px`,
    }),
    cell: (theme: Theme) => ({
        display: 'flex',
        color: theme.palette.text.secondary,
        fontSize: '1em',
        width: '100%',
        padding: 1,
        border: '1px solid',
        borderColor: theme.palette.divider,
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
