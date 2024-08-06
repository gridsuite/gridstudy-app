/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { ResizableBox } from 'react-resizable';
import PropTypes from 'prop-types';
import ResizeHandleIcon from '@mui/icons-material/ChevronRight';
import { MIN_HEIGHT, MIN_WIDTH, LOADING_HEIGHT, LOADING_WIDTH } from './diagram-common';
import { mergeSx } from '../utils/functions';
import { styled } from '@mui/system';

// TODO can we avoid to define a component just to add sx support ?
const ResizableBoxSx = styled(ResizableBox)({});

const styles = {
    resizable: (theme) => ({
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
    resizeHandleIconRight: (theme) => ({
        bottom: theme.spacing(-0.5),
        right: theme.spacing(-0.5),
        position: 'absolute',
        transform: 'rotate(45deg)',
        color: theme.palette.action.disabled,
    }),
    resizeHandleIconLeft: (theme) => ({
        bottom: theme.spacing(-0.5),
        left: theme.spacing(-0.5),
        position: 'absolute',
        transform: 'rotate(135deg)',
        color: theme.palette.action.disabled,
    }),
};

const DiagramResizableBox = (props) => {
    return (
        <ResizableBoxSx
            style={{ display: props.hide ? 'none' : undefined }}
            width={props.width}
            height={props.height}
            minConstraints={[MIN_WIDTH, MIN_HEIGHT]}
            axis={props.disableResize ? 'none' : undefined}
            resizeHandles={props?.align === 'right' ? ['sw'] : undefined}
            sx={mergeSx(
                styles.resizable,
                !props.disableResize && props?.align === 'right' && styles.leftHandle,
                !props.disableResize && props?.align === 'left' && styles.rightHandle
            )}
        >
            <>
                {props.children}
                {!props.disableResize && (
                    <ResizeHandleIcon
                        sx={props?.align === 'right' ? styles.resizeHandleIconLeft : styles.resizeHandleIconRight}
                    />
                )}
            </>
        </ResizableBoxSx>
    );
};

DiagramResizableBox.defaultProps = {
    disableResize: false,
    hide: false,
    align: 'left',
    width: LOADING_WIDTH,
    height: LOADING_HEIGHT,
};

DiagramResizableBox.propTypes = {
    children: PropTypes.node,
    disableResize: PropTypes.bool,
    hide: PropTypes.bool,
    align: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default DiagramResizableBox;
