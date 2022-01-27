/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import NetworkExplorer from './network/network-explorer';
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { StudyDrawer } from './study-drawer';
import NodeEditor from './graph/menus/node-editor';

export const drawerExplorerWidth = 300;
export const nodeEditorWidth = 400;

const useStyles = makeStyles((theme) => ({
    drawerExplorer: {
        width: drawerExplorerWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    nodeEditor: {
        width: nodeEditorWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
    },
    drawerExplorerShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -drawerExplorerWidth,
    },
    nodeEditorShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        pointerEvents: 'none',
        marginLeft: -nodeEditorWidth,
    },
}));

export function MapLateralDrawers({
    network,
    onVoltageLevelDisplayClick,
    onSubstationDisplayClick,
    onSubstationFocus,
    visibleSubstation,
    setLateralShift,
    drawerExplorerOpen,
    drawerNodeEditorOpen,
    closeDrawerNodeEditor,
}) {
    const classes = useStyles();
    return (
        <>
            <StudyDrawer
                open={drawerNodeEditorOpen}
                drawerClassName={classes.nodeEditor}
                drawerShiftClassName={classes.nodeEditorShift}
            >
                <NodeEditor onClose={closeDrawerNodeEditor} />
            </StudyDrawer>
            <StudyDrawer
                open={drawerExplorerOpen}
                drawerClassName={classes.drawerExplorer}
                drawerShiftClassName={classes.drawerExplorerShift}
            >
                <NetworkExplorer
                    substations={network ? network.substations : []}
                    onVoltageLevelDisplayClick={onVoltageLevelDisplayClick}
                    onSubstationDisplayClick={onSubstationDisplayClick}
                    onSubstationFocus={onSubstationFocus}
                    visibleSubstation={visibleSubstation}
                />
            </StudyDrawer>
        </>
    );
}
MapLateralDrawers.propTypes = {
    classes: PropTypes.any,
    drawerExplorerOpen: PropTypes.bool,
    drawerNodeEditorOpen: PropTypes.bool,
    network: PropTypes.any,
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
    closeDrawerNodeEditor: PropTypes.func,
    visibleSubstation: PropTypes.any,
    onClose: PropTypes.func,
};
