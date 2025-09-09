/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton, type IconButtonProps, Tooltip, type TooltipProps } from '@mui/material';
import type { PropsWithoutChildren } from '../../types/PropsWithoutChildren';

export type TooltipIconButtonProps = IconButtonProps & {
    tooltip: TooltipProps['title'];
    tooltipProps?: PropsWithoutChildren<Omit<TooltipProps, 'title'>>;
};

/**
 * Wrapper to manage disabled buttons.
 * @see https://mui.com/material-ui/react-tooltip/#disabled-elements
 */
export default function TooltipIconButton({
    tooltip,
    tooltipProps,
    children,
    ...otherProps
}: Readonly<TooltipIconButtonProps>) {
    return (
        <Tooltip title={tooltip} {...tooltipProps}>
            <span>
                <IconButton {...otherProps}>{children}</IconButton>
            </span>
        </Tooltip>
    );
}
