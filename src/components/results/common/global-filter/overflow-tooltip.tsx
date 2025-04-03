/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

export interface OverflowTooltipProps extends PropsWithChildren {
    label: string;
}

/**
 * if the label is too long (reaches overflow) a tooltip is added to display the full text
 */
function OverflowTooltip({ label }: Readonly<OverflowTooltipProps>) {
    const [displayTooltip, setDisplayTooltip] = useState(false);
    const textElementRef = useRef<HTMLInputElement | null>(null);

    const compareSize = () => {
        if (textElementRef.current) {
            const compare = textElementRef.current.scrollWidth <= textElementRef.current.clientWidth;
            setDisplayTooltip(compare);
        }
    };

    useEffect(() => {
        compareSize();
        window.addEventListener('resize', compareSize);
    }, []);

    useEffect(
        () => () => {
            window.removeEventListener('resize', compareSize);
        },
        []
    );

    return (
        <Tooltip title={label} arrow disableHoverListener={displayTooltip}>
            <Box
                ref={textElementRef}
                component="span"
                sx={{
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </Box>
        </Tooltip>
    );
}

export default OverflowTooltip;
