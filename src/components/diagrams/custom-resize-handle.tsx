/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { OpenInFull } from '@mui/icons-material';
import { forwardRef, Ref } from 'react';

type ResizeHandleAxis = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';
type CustomResizeHandleProps = {
    handleAxis?: ResizeHandleAxis;
};

const CustomResizeHandle = forwardRef((props: CustomResizeHandleProps, ref: Ref<HTMLDivElement>) => {
    const { handleAxis, ...restProps } = props;
    return (
        <div ref={ref} className={`react-resizable-handle react-resizable-handle-${handleAxis}`} {...restProps}>
            <OpenInFull fontSize="small" sx={{ rotate: '90deg' }} color="action" />
        </div>
    );
});

export default CustomResizeHandle;
