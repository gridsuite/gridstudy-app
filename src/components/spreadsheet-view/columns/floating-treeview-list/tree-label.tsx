/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import NumbersIcon from '@mui/icons-material/Numbers';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DataArrayIcon from '@mui/icons-material/DataArray';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Box, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';

type TreeLabelProps = {
    text: string;
    type?: string;
    highlight?: string;
    active?: boolean;
};

//Escapes regex special characters to avoid misinterpreting user prompts
export function escapeRegExp(string: string): string {
    return string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query?: string, active?: boolean) {
    if (!query) {
        return text;
    }
    const safeInput = escapeRegExp(query);
    return text.split(new RegExp(`(${safeInput})`, 'gi')).map((part, index) =>
        part.toLowerCase() === safeInput.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: active ? 'orange' : 'yellow' }}>
                {part}
            </span>
        ) : (
            part
        )
    );
}

export function TreeLabel({ text, type, highlight, active }: Readonly<TreeLabelProps>) {
    const intl = useIntl();
    let icon: ReactNode;
    switch (type) {
        case 'string':
            icon = (
                <Tooltip title={intl.formatMessage({ id: 'String' })}>
                    <FormatColorTextIcon fontSize="small" />
                </Tooltip>
            );
            break;
        case 'number':
        case 'integer':
            icon = (
                <Tooltip title={intl.formatMessage({ id: 'Number' })}>
                    <NumbersIcon fontSize="small" />
                </Tooltip>
            );
            break;
        case 'boolean':
            icon = (
                <Tooltip title={intl.formatMessage({ id: 'Boolean' })}>
                    <ToggleOnIcon fontSize="small" />
                </Tooltip>
            );
            break;
        case 'object':
            icon = (
                <Tooltip title={intl.formatMessage({ id: 'Object' })}>
                    <DataObjectIcon fontSize="small" />
                </Tooltip>
            );
            break;
        case 'array':
            icon = (
                <Tooltip title={intl.formatMessage({ id: 'Array' })}>
                    <DataArrayIcon fontSize="small" />
                </Tooltip>
            );
            break;
        case 'enum':
            icon = (
                <Tooltip title={intl.formatMessage({ id: 'Enum' })}>
                    <FormatListBulletedIcon fontSize="small" />
                </Tooltip>
            );
            break;
        default:
            icon = null;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ px: 1 }}>{highlightText(text, highlight, active)}</Box>
            {icon && <span>{icon}</span>}
        </Box>
    );
}
