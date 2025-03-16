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
            visibility: 'hidden',
            height: 0,
        };
    }
    return {
        visibility: 'visible',
        height: 'inherit',
    };
};

export type VisibilityProps = BoxProps & {
    value: number;
    index: number;
    visible?: boolean;
};

function Visibility({ children, value, index, visible = true, ...otherProps }: Readonly<VisibilityProps>) {
    return (
        <Box sx={getStyle(!visible || value !== index)} {...otherProps}>
            {children}
        </Box>
    );
}

export default Visibility;
