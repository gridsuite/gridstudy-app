/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ResizableBox } from 'react-resizable';
import ResizeHandleIcon from '@mui/icons-material/ChevronRight';
import { MIN_HEIGHT, MIN_WIDTH, LOADING_HEIGHT, LOADING_WIDTH } from './diagram-common';
import { styled, Theme } from '@mui/material';
import { mergeSx } from '@gridsuite/commons-ui';

// TODO can we avoid to define a component just to add sx support ?
const ResizableBoxSx = styled(ResizableBox)({});

const styles = {
    resizable: (theme: Theme) => ({
        position: 'relative',
        '& .react-resizable-handle': {
            position: 'absolute',
            width: theme.spacing(2),
            height: theme.spacing(2),
            bottom: 0,
        },
    }),
    rightHandle: {
        '& .react-resizable-handle': {
            right: 0,
            cursor: 'se-resize',
        },
    },
    leftHandle: {
        '& .react-resizable-handle': {
            left: 0,
            cursor: 'sw-resize',
        },
    },
    resizeHandleIconRight: (theme: Theme) => ({
        bottom: theme.spacing(-0.5),
        right: theme.spacing(-0.5),
        position: 'absolute',
        transform: 'rotate(45deg)',
        color: theme.palette.action.disabled,
    }),
    resizeHandleIconLeft: (theme: Theme) => ({
        bottom: theme.spacing(-0.5),
        left: theme.spacing(-0.5),
        position: 'absolute',
        transform: 'rotate(135deg)',
        color: theme.palette.action.disabled,
    }),
};

interface DiagramResizableBoxProps {
    children?: React.ReactNode;
    disableResize?: boolean;
    hide?: boolean;
    align?: 'left' | 'right' | 'center';
    width?: number;
    height?: number;
}

const DiagramResizableBox: React.FC<DiagramResizableBoxProps> = ({
    children,
    disableResize = false,
    hide = false,
    align = 'left',
    width = LOADING_WIDTH,
    height = LOADING_HEIGHT,
}) => {
    return (
        <ResizableBoxSx
            style={{ display: hide ? 'none' : undefined }}
            width={width}
            height={height}
            minConstraints={[MIN_WIDTH, MIN_HEIGHT]}
            axis={disableResize ? undefined : 'both'}
            resizeHandles={align === 'right' ? ['sw'] : undefined}
            sx={mergeSx(
                styles.resizable,
                !disableResize && align === 'right' ? styles.leftHandle : undefined,
                !disableResize && align === 'left' ? styles.rightHandle : undefined
            )}
        >
            <>
                {children}
                {!disableResize && (
                    <ResizeHandleIcon
                        sx={align === 'right' ? styles.resizeHandleIconLeft : styles.resizeHandleIconRight}
                    />
                )}
            </>
        </ResizableBoxSx>
    );
};

export default DiagramResizableBox;
