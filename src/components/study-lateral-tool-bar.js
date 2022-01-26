import NetworkExplorer from './network/network-explorer';
import React, { useEffect } from 'react';
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

export function StudyLateralToolBar({
    network,
    onVoltageLevelDisplayClick,
    onSubstationDisplayClick,
    onSubstationFocus,
    visibleSubstation,
    setLateralShift,
    drawerExplorerOpen,
    drawerNodeEditorOpen,
}) {

    useEffect(() => {
        let shift = 0;
        if (drawerExplorerOpen) shift += drawerExplorerWidth;
        setLateralShift(shift);
    }, [setLateralShift, drawerExplorerOpen]);

    const classes = useStyles();
    return (
        <>
            <StudyDrawer
                open={drawerNodeEditorOpen}
                drawerClassName={classes.nodeEditor}
                drawerShiftClassName={classes.nodeEditorShift}
            >
                <NodeEditor onClose={null} />
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
StudyLateralToolBar.propTypes = {
    classes: PropTypes.any,
    drawerExplorerOpen: PropTypes.bool,
    drawerNodeEditorOpen: PropTypes.bool,
    network: PropTypes.any,
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
    visibleSubstation: PropTypes.any,
    onClose: PropTypes.func,
};
