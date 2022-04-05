/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { StudyDrawer } from './study-drawer';
import NodeEditor from './graph/menus/node-editor';
import { StudyDisplayMode } from './study-pane';
import { useSelector } from 'react-redux';

export const DRAWER_NODE_EDITOR_WIDTH = 400;

const useStyles = makeStyles((theme) => ({
    drawerNodeEditor: {
        width: DRAWER_NODE_EDITOR_WIDTH,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
    },
    drawerNodeEditorShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        display: 'none',
    },
}));

export function MapLateralDrawers({ studyDisplayMode }) {
    const classes = useStyles();

    const selectedTreeNode = useSelector((state) => state.selectedTreeNode);

    const isModificationsDrawerOpen = useSelector(
        (state) => state.isModificationsDrawerOpen
    );

    return (
        <>
            {selectedTreeNode !== null &&
                selectedTreeNode.type === 'NETWORK_MODIFICATION' && (
                    <StudyDrawer
                        open={
                            isModificationsDrawerOpen &&
                            studyDisplayMode === StudyDisplayMode.MAP
                        }
                        drawerClassName={classes.drawerNodeEditor}
                        drawerShiftClassName={classes.drawerNodeEditorShift}
                        anchor={
                            studyDisplayMode === StudyDisplayMode.MAP
                                ? 'left'
                                : 'right'
                        }
                    >
                        <NodeEditor />
                    </StudyDrawer>
                )}
        </>
    );
}
MapLateralDrawers.propTypes = {
    classes: PropTypes.any,
    studyDisplayMode: PropTypes.string,
    network: PropTypes.any,
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
    visibleSubstation: PropTypes.any,
};
