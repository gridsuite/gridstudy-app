/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { Divider, Theme, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { JSX } from 'react/jsx-runtime';

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
    text: 'µS',
};

export const SusceptanceAdornment = {
    position: 'end',
    text: 'S',
};
export const OhmAdornment = {
    position: 'end',
    text: 'Ω',
};
export const AmpereAdornment = {
    position: 'end',
    text: 'A',
};

export const KiloAmpereAdornment = {
    position: 'end',
    text: 'kA',
};

export const ActivePowerAdornment = {
    position: 'end',
    text: 'MW',
};
export const ReactivePowerAdornment = {
    position: 'end',
    text: 'MVar',
};
export const MVAPowerAdornment = {
    position: 'end',
    text: 'MVA',
};
export const VoltageAdornment = {
    position: 'end',
    text: 'kV',
};
export const KilometerAdornment = {
    position: 'end',
    text: 'km',
};
export const filledTextField = {
    variant: 'filled' as 'filled',
};

export const standardTextField = {
    variant: 'standard',
};

export const italicFontTextField = {
    style: { fontStyle: 'italic' },
};

export const percentageTextField = {
    position: 'end',
    text: '%',
};

export function parseIntData(val: string, defaultValue: string) {
    const intValue = parseInt(val);
    return isNaN(intValue) ? defaultValue : intValue;
}

export function sanitizeString(val: string | undefined) {
    const trimedValue = val?.trim();
    return trimedValue === '' ? null : trimedValue;
}

interface GridSectionProps {
    title: string;
    heading?: string;
    size?: number;
    customStyle?: React.CSSProperties;
}

const createCustomTag = (heading: string, customStyle: React.CSSProperties) => {
    const StyledComponent = styled('div')(() => ({
        ...customStyle,
    }));

    return (props: React.ComponentProps<'div'>) =>
        React.createElement(`h${heading}`, { ...props, className: StyledComponent });
};

export const GridSection: React.FC<GridSectionProps> = ({ title, heading = '3', size = 12, customStyle = {} }) => {
    const CustomTag = createCustomTag(heading, customStyle);

    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <CustomTag>
                    <FormattedMessage id={title} />
                </CustomTag>
            </Grid>
        </Grid>
    );
};

interface GridItemProps {
    field: JSX.Element | undefined;
    size?: number;
}

export const GridItem: React.FC<GridItemProps> = ({ field, size = 6 }) => {
    return (
        <Grid item xs={size} alignItems="flex-start">
            {field}
        </Grid>
    );
};

interface GridItemWithTooltipProps {
    field: JSX.Element;
    tooltip: string;
    size?: number;
}
export const gridItemWithTooltip: React.FC<GridItemWithTooltipProps> = ({ field, tooltip = '', size = 6 }) => {
    return (
        <Grid item xs={size} alignItems="flex-start">
            <Tooltip title={tooltip}>{field}</Tooltip>
        </Grid>
    );
};

export const getIdOrSelf = (e: any) => e?.id ?? e;

export function LineSeparator() {
    return (
        <Grid item xs={12}>
            <Divider />
        </Grid>
    );
}
