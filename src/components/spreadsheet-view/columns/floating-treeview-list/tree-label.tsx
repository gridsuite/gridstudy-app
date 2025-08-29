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
import { Box } from '@mui/material';

type TreeLabelProps = {
    text: string;
    type?: string;
    highlight?: string;
    active?: boolean;
};

function highlightText(text: string, query?: string, active?: boolean) {
    if (!query) {
        return text;
    }
    return text.split(new RegExp(`(${query})`, 'gi')).map((part, idx) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <span key={idx} style={{ backgroundColor: active ? 'orange' : 'yellow' }}>
                {part}
            </span>
        ) : (
            part
        )
    );
}

export function TreeLabel({ text, type, highlight, active }: TreeLabelProps) {
    let icon: ReactNode;
    switch (type) {
        case 'string':
            icon = <FormatColorTextIcon fontSize="small" />;
            break;
        case 'number':
        case 'integer':
            icon = <NumbersIcon fontSize="small" />;
            break;
        case 'boolean':
            icon = <ToggleOnIcon fontSize="small" />;
            break;
        case 'object':
            icon = <DataObjectIcon fontSize="small" />;
            break;
        case 'array':
            icon = <DataArrayIcon fontSize="small" />;
            break;
        case 'enum':
            icon = <FormatListBulletedIcon fontSize="small" />;
            break;
        default:
            icon = null;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ px: 1 }}>{highlightText(text, highlight, active)}</Box>
            {icon && <span>{icon}</span>}
        </div>
    );
}
