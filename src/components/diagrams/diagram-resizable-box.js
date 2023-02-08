/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { ResizableBox } from 'react-resizable';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import ResizeHandleIcon from '@mui/icons-material/ChevronRight';
import { LOADING_HEIGHT, LOADING_WIDTH } from './diagram-common';

const useStyles = makeStyles((theme) => ({
    resizable: {
        position: 'relative',
        '& .react-resizable-handle': {
            position: 'absolute',
            width: theme.spacing(2),
            height: theme.spacing(2),
            bottom: 0,
        },
    },
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
    resizeHandleIconRight: {
        bottom: theme.spacing(-0.5),
        right: theme.spacing(-0.5),
        position: 'absolute',
        transform: 'rotate(45deg)',
        color: theme.palette.action.disabled,
    },
    resizeHandleIconLeft: {
        bottom: theme.spacing(-0.5),
        left: theme.spacing(-0.5),
        position: 'absolute',
        transform: 'rotate(135deg)',
        color: theme.palette.action.disabled,
    },
}));

const DiagramResizableBox = (props) => {
    const classes = useStyles();

    return (
        <ResizableBox
            style={{ display: props.hide ? 'none' : undefined }}
            width={props.width}
            height={props.height}
            minConstraints={[LOADING_WIDTH, LOADING_HEIGHT]}
            axis={props.disableResize ? 'none' : undefined}
            resizeHandles={props?.align === 'right' ? ['sw'] : undefined}
            className={clsx(classes.resizable, {
                [classes.leftHandle]:
                    !props.disableResize && props?.align === 'right',
                [classes.rightHandle]:
                    !props.disableResize && props?.align === 'left',
            })}
        >
            <>
                {props.children}
                {!props.disableResize && (
                    <ResizeHandleIcon
                        className={
                            props?.align === 'right'
                                ? classes.resizeHandleIconLeft
                                : classes.resizeHandleIconRight
                        }
                    />
                )}
            </>
        </ResizableBox>
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
