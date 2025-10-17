/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { forwardRef, ReactNode } from 'react';
import Box, { BoxProps } from '@mui/material/Box';

interface ForwardRefBoxProps extends BoxProps {
    children: ReactNode;
}

const ForwardRefBox = forwardRef<HTMLDivElement, ForwardRefBoxProps>(({ children, ...boxProps }, ref) => (
    <Box ref={ref} {...boxProps}>
        {children}
    </Box>
));

export default ForwardRefBox;
