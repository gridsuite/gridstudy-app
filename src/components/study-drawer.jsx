/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Drawer from '@mui/material/Drawer';
import PropTypes from 'prop-types';
import { DRAWER_NODE_EDITOR_WIDTH } from '../utils/UIconstants';
import { mergeSx } from '@gridsuite/commons-ui';

const styles = {
    drawerPaper: {
        position: 'static',
        overflow: 'hidden',
        flex: '1',
        flexGrow: '1',
        transition: 'none !important',
    },
    nodeEditor: (theme) => ({
        width: DRAWER_NODE_EDITOR_WIDTH + 'px',
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
        position: 'relative',
        flexShrink: 1,
        overflowY: 'none',
        overflowX: 'none',
    }),
    nodeEditorShift: (theme) => ({
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        pointerEvents: 'none',
        marginLeft: -DRAWER_NODE_EDITOR_WIDTH + 'px',
    }),
};

export const StudyDrawer = ({ open, children, anchor }) => {
    return (
        <Drawer
            variant={'persistent'}
            sx={mergeSx(styles.nodeEditor, !open && styles.nodeEditorShift)}
            anchor={anchor}
            open={open}
            PaperProps={{
                sx: styles.drawerPaper,
            }}
        >
            {children}
        </Drawer>
    );
};

StudyDrawer.propTypes = {
    open: PropTypes.bool,
    children: PropTypes.node,
    anchor: PropTypes.string,
};
