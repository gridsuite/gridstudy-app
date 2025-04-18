/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, BoxProps } from '@mui/material';

const getStyle = (hidden: boolean) => {
    if (hidden) {
        return {
            display: 'none',
        };
    }
    return {
        display: 'flex',
        height: '100%',
        width: '100%',
    };
};

export type VisibilityBoxProps = BoxProps & {
    activeIndex: number;
    boxIndex: number;
    visible?: boolean;
};

function VisibilityBox({
    children,
    activeIndex,
    boxIndex,
    visible = true,
    ...otherProps
}: Readonly<VisibilityBoxProps>) {
    return (
        <Box sx={getStyle(!visible || activeIndex !== boxIndex)} {...otherProps}>
            {children}
        </Box>
    );
}

export default VisibilityBox;
