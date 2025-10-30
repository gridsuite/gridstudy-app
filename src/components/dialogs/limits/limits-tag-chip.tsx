/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Avatar, Chip, ChipProps, Tooltip } from '@mui/material';
import { getPropertyAvatar } from './limits-constants';
import * as React from 'react';
import { LimitsProperty } from '../../../services/network-modification-types';

export interface LimitTagChipProps extends Omit<ChipProps, 'sx' | 'label' | 'avatar'> {
    limitsProperty: LimitsProperty;
    showTooltip?: boolean;
}

export function LimitsTagChip({ limitsProperty, showTooltip, onDelete, ...props }: Readonly<LimitTagChipProps>) {
    const chipContent = (
        <Chip
            avatar={<Avatar>{getPropertyAvatar(limitsProperty.name)}</Avatar>}
            label={limitsProperty.value}
            sx={{ maxWidth: onDelete ? '200px' : '180px', margin: 0.5, borderRadius: '4px' }}
            onDelete={onDelete}
            {...props}
        />
    );

    return showTooltip ? (
        <Tooltip title={limitsProperty.name + ' : ' + limitsProperty.value}>{chipContent}</Tooltip>
    ) : (
        chipContent
    );
}
