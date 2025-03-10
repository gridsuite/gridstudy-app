/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

export type TooltipIconButtonProps = {
    tooltip: string;
} & IconButtonProps;

function TooltipIconButton({ tooltip, ...otherProps }: Readonly<TooltipIconButtonProps>) {
    return (
        <Tooltip title={tooltip}>
            <span>
                <IconButton size={'medium'} {...otherProps} />
            </span>
        </Tooltip>
    );
}

export default TooltipIconButton;
