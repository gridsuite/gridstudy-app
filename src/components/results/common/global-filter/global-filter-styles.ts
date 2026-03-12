/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { cyan, lime } from '@mui/material/colors';
import { FilterType } from '../utils';
import { mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import { Theme, SxProps } from '@mui/material';
import { GlobalFilter } from './global-filter-types';

export const getResultsGlobalFiltersChipStyle = (element: GlobalFilter): SxProps<Theme> => {
    return mergeSx(
        resultsGlobalFilterStyles.chip,
        element.deleted
            ? resultsGlobalFilterStyles.chipNotFound
            : FILTER_TYPE_STYLE_MAP[element.filterType as FilterType]
    );
};

const AUTOCOMPLETE_WIDTH: number = 520;
const POPPER_EXTRA_WIDTH: number = 300;
export const GLOBAL_FILTERS_CELL_HEIGHT: number = 400;
export const IMPORT_FILTER_HEIGHT: number = 40;

export const resultsGlobalFilterStyles = {
    autocomplete: (theme) => ({
        width: AUTOCOMPLETE_WIDTH + 'px',
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
            maxHeight: '40px',
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
        '.MuiInputBase-root': {
            position: 'relative',
        },
    }),
    // from the expanded part :
    dropdown: {
        position: 'relative',
        left: `0px`,
        width: `${AUTOCOMPLETE_WIDTH + POPPER_EXTRA_WIDTH}px`,
    },
    cellHeader: (theme) => ({
        color: theme.palette.text.secondary,
        fontSize: '1em',
        padding: 1,
        border: '1px solid',
        borderColor: theme.palette.divider,
    }),
    cellTooltip: (theme) => ({
        paddingLeft: theme.spacing(1),
    }),
    cell: (theme) => ({
        borderLeft: '1px solid',
        borderColor: theme.palette.divider,
    }),
    list: (theme) => ({
        display: 'flex',
        flexDirection: 'column',
        color: theme.palette.text.secondary,
        fontSize: '1em',
        width: '100%',
        maxHeight: `${GLOBAL_FILTERS_CELL_HEIGHT}px`,
    }),
    selectedFiltersPanel: () => ({
        overflowY: 'auto',
        padding: 0,
        maxHeight: `${GLOBAL_FILTERS_CELL_HEIGHT}px`,
    }),
    selectedFiltersSubGroup: (theme) => ({
        display: 'block',
        paddingTop: 1,
        paddingBottom: 0,
        color: theme.palette.text.secondary,
    }),
    selectedFiltersChips: (theme) => ({
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        color: theme.palette.text.secondary,
        fontSize: '1em',
    }),
    importFilterButton: (theme) => ({
        color: theme.palette.text.secondary,
        fontSize: '0.8em',
        borderTop: '1px solid',
        borderColor: theme.palette.divider,
        height: `${IMPORT_FILTER_HEIGHT}px`,
        justifyContent: 'flex-start',
        paddingLeft: '24px',
    }),
    miniButton: (theme) => ({
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
            margin: '1px 2px 1px 2px',
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
    chipCountry: (theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${theme.palette.info.main}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${theme.palette.info.dark}!important`,
        },
    }),
    chipVoltageLevel: (theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${theme.palette.secondary.main}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${theme.palette.secondary.dark}!important`,
        },
    }),
    chipGenericFilter: {
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${cyan['500']}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${cyan['700']}!important`,
        },
    },
    chipSubstationOrVoltageLevel: {
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${lime['800']}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${lime['900']}!important`,
        },
    },
    chipSubstationProperty: (theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${theme.palette.success.main}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${theme.palette.success.dark}!important`,
        },
    }),
    chipNotFound: (theme) => ({
        '&.MuiChip-root, &.MuiChip-root[aria-selected="true"]': {
            backgroundColor: `${theme.palette.error.main}!important`,
        },
        '&.MuiChip-root:hover, &.MuiChip-root:focus': {
            backgroundColor: `${theme.palette.error.dark}!important`,
        },
        color: theme.palette.error.contrastText,
    }),
} as const satisfies MuiStyles;

const FILTER_TYPE_STYLE_MAP: Partial<Record<FilterType, SxProps<Theme>>> = {
    [FilterType.COUNTRY]: resultsGlobalFilterStyles.chipCountry,
    [FilterType.VOLTAGE_LEVEL]: resultsGlobalFilterStyles.chipVoltageLevel,
    [FilterType.GENERIC_FILTER]: resultsGlobalFilterStyles.chipGenericFilter,
    [FilterType.SUBSTATION_OR_VL]: resultsGlobalFilterStyles.chipSubstationOrVoltageLevel,
    [FilterType.SUBSTATION_PROPERTY]: resultsGlobalFilterStyles.chipSubstationProperty,
};
