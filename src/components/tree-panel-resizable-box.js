/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import ResizePanelHandleIcon from '@mui/icons-material/MoreVert';
import { ResizableBox } from 'react-resizable';
import { useWindowWidth } from '@react-hook/window-size';
import makeStyles from '@mui/styles/makeStyles';
import PropTypes from 'prop-types';
import {
    DRAWER_NODE_EDITOR_WIDTH,
    TREE_PANEL_MIN_WIDTH_PERCENTAGE,
    TREE_PANEL_MAX_WIDTH_PERCENTAGE,
} from '../utils/UIconstants';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    panel: {
        position: 'relative',
        boxSizing: 'border-box',
    },
    innerResizablePanel: {
        flex: 'auto',
        height: '100%',
    },
    resizePanelHandle: {
        // This panel's right border looks like the panel's handle but is only a decoy.
        // The true handle is wider than it seems, to be easier to grip, and is invisible.
        borderRightColor: theme.palette.action.disabled,
        borderRightStyle: 'solid',
        borderRightWidth: theme.spacing(0.5),
        '& .react-resizable-handle': {
            position: 'absolute',
            width: theme.spacing(1),
            height: '100%',
            top: 0,
            right: '-' + theme.spacing(0.75),
            cursor: 'col-resize',
            backgroundColor: 'rgba(0, 0, 0, 0)', // The handle is invisible (alpha = 0)
            zIndex: 5,
        },
    },
    resizePanelHandleIcon: {
        bottom: '50%',
        right: theme.spacing(-1.75),
        position: 'absolute',
        color: theme.palette.text.disabled,
        transform: 'scale(0.5, 1.5)',
    },
}));

const TreePanelResizableBox = (props) => {
    const classes = useStyles();

    const windowWidth = useWindowWidth();

    const [resizedTreePercentage, setResizedTreePercentage] = useState(0.5);

    const updateResizedTreePercentage = (treePanelWidth, totalWidth) => {
        if (totalWidth > 0) {
            let newPercentage = treePanelWidth / totalWidth;
            if (newPercentage < TREE_PANEL_MIN_WIDTH_PERCENTAGE) {
                newPercentage = TREE_PANEL_MIN_WIDTH_PERCENTAGE;
            } else if (newPercentage > TREE_PANEL_MAX_WIDTH_PERCENTAGE) {
                newPercentage = TREE_PANEL_MAX_WIDTH_PERCENTAGE;
            }
            setResizedTreePercentage(newPercentage);
        }
    };
    const onResize = (event, { element, size }) => {
        updateResizedTreePercentage(size.width, windowWidth);
    };

    const drawerWidth = DRAWER_NODE_EDITOR_WIDTH + 4; // 4 pixels for the handle's width
    return (
        <ResizableBox
            style={{ display: props.hide ? 'none' : undefined }}
            height={'100%'}
            width={
                props.fullscreen
                    ? windowWidth
                    : windowWidth * resizedTreePercentage > drawerWidth
                    ? windowWidth * resizedTreePercentage
                    : drawerWidth
            }
            className={clsx(classes.panel, {
                [classes.resizePanelHandle]: !props.disableResize,
            })}
            minConstraints={
                props.fullscreen || props.hide
                    ? undefined
                    : [
                          windowWidth * TREE_PANEL_MIN_WIDTH_PERCENTAGE >
                          drawerWidth
                              ? windowWidth * TREE_PANEL_MIN_WIDTH_PERCENTAGE
                              : drawerWidth,
                      ]
            }
            maxConstraints={
                props.fullscreen || props.hide
                    ? undefined
                    : [windowWidth * TREE_PANEL_MAX_WIDTH_PERCENTAGE]
            }
            resizeHandles={['e']}
            axis={props.disableResize ? 'none' : 'x'}
            onResize={onResize}
        >
            <div className={classes.innerResizablePanel}>
                {props.children}
                <ResizePanelHandleIcon
                    className={classes.resizePanelHandleIcon}
                />
            </div>
        </ResizableBox>
    );
};

TreePanelResizableBox.defaultProps = {
    disableResize: false,
    fullscreen: false,
    hide: false,
};

TreePanelResizableBox.propTypes = {
    children: PropTypes.node,
    disableResize: PropTypes.bool,
    fullscreen: PropTypes.bool,
    hide: PropTypes.bool,
};

export default TreePanelResizableBox;
