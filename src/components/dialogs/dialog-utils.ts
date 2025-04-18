/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FilledTextFieldProps, StandardTextFieldProps, Theme } from '@mui/material';
import {
    AMPERE,
    KILO_AMPERE,
    KILO_METER,
    KILO_VOLT,
    MEGA_VAR,
    MEGA_VOLT_AMPERE,
    MEGA_WATT,
    MICRO_SIEMENS,
    OHM,
    PERCENTAGE,
    SIEMENS,
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
    button: (theme: Theme) => ({
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    }),
    paddingButton: (theme: Theme) => ({
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
    formDirectoryElementsError: (theme: Theme) => ({
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
};

export const MicroSusceptanceAdornment = {
    position: 'end',
    text: MICRO_SIEMENS,
};

export const SusceptanceAdornment = {
    position: 'end',
    text: SIEMENS,
};
export const OhmAdornment = {
    position: 'end',
    text: OHM,
};
export const AmpereAdornment = {
    position: 'end',
    text: AMPERE,
};

export const KiloAmpereAdornment = {
    position: 'end',
    text: KILO_AMPERE,
};

export const ActivePowerAdornment = {
    position: 'end',
    text: MEGA_WATT,
};
export const ReactivePowerAdornment = {
    position: 'end',
    text: MEGA_VAR,
};
export const MVAPowerAdornment = {
    position: 'end',
    text: MEGA_VOLT_AMPERE,
};
export const VoltageAdornment = {
    position: 'end',
    text: KILO_VOLT,
};
export const KilometerAdornment = {
    position: 'end',
    text: KILO_METER,
};
export const filledTextField: FilledTextFieldProps = {
    variant: 'filled',
};

export const standardTextField: StandardTextFieldProps = {
    variant: 'standard',
};

export const italicFontTextField = {
    style: { fontStyle: 'italic' },
};

export const percentageTextField = {
    position: 'end',
    text: PERCENTAGE,
};

export function parseIntData(val: string, defaultValue: string) {
    const intValue = parseInt(val);
    return isNaN(intValue) ? defaultValue : intValue;
}

export function sanitizeString(val: string | null | undefined) {
    const trimedValue = val?.trim();
    return trimedValue === '' ? null : trimedValue;
}

export const getIdOrSelf = (e: any) => e?.id ?? e;
