/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Dispatch, PropsWithChildren, SetStateAction } from 'react';
import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

export interface OverflowTooltipProps extends PropsWithChildren {
    label: string;
    maxLabelLength?: number;
}

/**
 * if the label is longer than maxLabelLength it is truncated and a tooltip is added to display the full text
 */
function OverflowTooltip({ label, maxLabelLength = 20 }: Readonly<OverflowTooltipProps>) {
    let truncatedLabel = '';
    const truncate = label.length > maxLabelLength;
    if (truncate) {
        truncatedLabel = label.substring(0, maxLabelLength - 1) + '...';
    }
    return (
        <Tooltip title={label} arrow disableHoverListener={!truncate}>
            <Box
                component="span"
                sx={{
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                {truncate ? truncatedLabel : label}
            </Box>
        </Tooltip>
    );
}

export default OverflowTooltip;
