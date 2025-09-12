/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type BaseTextFieldProps, type FilledTextFieldProps, type StandardTextFieldProps } from '@mui/material';
import {
    AMPERE,
    KILO_AMPERE,
    KILO_METER,
    KILO_VOLT,
    MEGA_VAR,
    MEGA_VOLT_AMPERE,
    MEGA_WATT,
    MICRO_SIEMENS,
    type MuiStyles,
    OHM,
    PERCENTAGE,
    SIEMENS,
    type TextInputProps,
} from '@gridsuite/commons-ui';

export const styles = {
    helperText: {
        margin: 0,
        marginTop: '4px',
    },
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
    },
    button: (theme) => ({
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    }),
    paddingButton: (theme) => ({
        paddingLeft: theme.spacing(2),
    }),
    formDirectoryElements1: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        flexDirection: 'row',
        border: '2px solid lightgray',
        padding: '4px',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    formDirectoryElementsError: (theme) => ({
        borderColor: theme.palette.error.main,
    }),
    formDirectoryElements2: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 0,
        padding: '4px',
        overflow: 'hidden',
    },
    labelDirectoryElements: {
        marginTop: '-10px',
    },
    addDirectoryElements: {
        marginTop: '-5px',
    },
} as const satisfies MuiStyles;

type Adornment = NonNullable<TextInputProps['adornment']>;
export const MicroSusceptanceAdornment = {
    position: 'end',
    text: MICRO_SIEMENS,
} as const satisfies Adornment;

export const SusceptanceAdornment = {
    position: 'end',
    text: SIEMENS,
} as const satisfies Adornment;
export const OhmAdornment = {
    position: 'end',
    text: OHM,
} as const satisfies Adornment;
export const AmpereAdornment = {
    position: 'end',
    text: AMPERE,
} as const satisfies Adornment;

export const KiloAmpereAdornment = {
    position: 'end',
    text: KILO_AMPERE,
} as const satisfies Adornment;

export const ActivePowerAdornment = {
    position: 'end',
    text: MEGA_WATT,
} as const satisfies Adornment;
export const ReactivePowerAdornment = {
    position: 'end',
    text: MEGA_VAR,
} as const satisfies Adornment;
export const MVAPowerAdornment = {
    position: 'end',
    text: MEGA_VOLT_AMPERE,
} as const satisfies Adornment;
export const VoltageAdornment = {
    position: 'end',
    text: KILO_VOLT,
} as const satisfies Adornment;
export const KilometerAdornment = {
    position: 'end',
    text: KILO_METER,
} as const satisfies Adornment;
export const filledTextField = {
    variant: 'filled',
} as const satisfies FilledTextFieldProps;

export const standardTextField = {
    variant: 'standard',
} as const satisfies StandardTextFieldProps;

export const italicFontTextField = {
    style: { fontStyle: 'italic' },
} as const satisfies BaseTextFieldProps;

export const percentageTextField = {
    position: 'end',
    text: PERCENTAGE,
} as const satisfies Adornment;

export function parseIntData(val: string, defaultValue: string) {
    const intValue = parseInt(val);
    return isNaN(intValue) ? defaultValue : intValue;
}

export function sanitizeString(val: string | null | undefined) {
    const trimedValue = val?.trim();
    return trimedValue === undefined || trimedValue === '' ? null : trimedValue;
}

export type IdOrSelf<T> = T extends { id: infer I } ? I : T;
export const getIdOrSelf = <T>(e: T): IdOrSelf<T> => ((e as any)?.id ?? e) as IdOrSelf<T>;
