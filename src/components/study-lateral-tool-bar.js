import LateralToolbar from './lateral-toolbar';
import NetworkExplorer from './network/network-explorer';
import NodeEditor from './graph/menus/node-editor';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { StudyDrawer, ToolDrawer } from './study-drawer';
import NetworkModificationTreePane from './network-modification-tree-pane';

export const drawerExplorerWidth = 300;
export const nodeEditorWidth = 400;
export const drawerToolbarWidth = 48;
export const drawerNetworkModificationTreeWidth = 400;

const useStyles = makeStyles((theme) => ({
    drawerExplorer: {
        width: drawerExplorerWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
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
    drawerNetworkModificationTree: {
        width: drawerNetworkModificationTreeWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        zIndex: 50,
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
    drawerNetworkModificationTreeShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -drawerNetworkModificationTreeWidth,
    },
}));

export function StudyLateralToolBar({
    network,
    onVoltageLevelDisplayClick,
    onSubstationDisplayClick,
    onSubstationFocus,
    visibleSubstation,
    isMap,
    studyUuid,
    setLateralShift,
}) {
    const [drawerExplorerOpen, setDrawerExplorerOpen] = useState(true);

    const [
        drawerNetworkModificationTreeOpen,
        setDrawerNetworkModificationTreeOpen,
    ] = useState(false);

    const [networkModificationsPaneOpen, setNetworkModificationsPaneOpen] =
        useState(false);

    const toggleExplorerDrawer = () => {
        setDrawerExplorerOpen(!drawerExplorerOpen);
        setDrawerNetworkModificationTreeOpen(false);
    };

    const toggleNetworkModificationTreeDrawer = () => {
        setDrawerNetworkModificationTreeOpen(
            !drawerNetworkModificationTreeOpen
        );
        setDrawerExplorerOpen(false);
    };

    const toggleNetworkModificationConfiguration = () => {
        setNetworkModificationsPaneOpen(!networkModificationsPaneOpen);
    };

    const closeNetworkModificationConfiguration = () => {
        setNetworkModificationsPaneOpen(false);
    };

    useEffect(() => {
        let shift = drawerToolbarWidth;
        if (drawerExplorerOpen) shift += drawerExplorerWidth;
        if (drawerNetworkModificationTreeOpen)
            shift += drawerNetworkModificationTreeWidth;
        if (networkModificationsPaneOpen) {
            shift += nodeEditorWidth;
        }
        setLateralShift(shift);
    }, [
        setLateralShift,
        drawerExplorerOpen,
        drawerNetworkModificationTreeOpen,
        networkModificationsPaneOpen,
    ]);

    const classes = useStyles();
    return (
        <>
            <ToolDrawer>
                <LateralToolbar
                    handleDisplayNetworkExplorer={toggleExplorerDrawer}
                    handleDisplayNetworkModificationTree={
                        toggleNetworkModificationTreeDrawer
                    }
                    networkExplorerDisplayed={drawerExplorerOpen}
                    networkModificationTreeDisplayed={
                        drawerNetworkModificationTreeOpen
                    }
                    handleOpenNetworkModificationConfiguration={
                        toggleNetworkModificationConfiguration
                    }
                />
            </ToolDrawer>
            <StudyDrawer
                open={drawerExplorerOpen}
                drawerClassName={classes.drawerExplorer}
                drawerShiftClassName={classes.drawerExplorerShift}
            >
                <NetworkExplorer
                    isOpen={drawerExplorerOpen}
                    substations={network ? network.substations : []}
                    onVoltageLevelDisplayClick={onVoltageLevelDisplayClick}
                    onSubstationDisplayClick={onSubstationDisplayClick}
                    onSubstationFocus={onSubstationFocus}
                    visibleSubstation={visibleSubstation}
                    visible={isMap}
                />
            </StudyDrawer>
            <StudyDrawer
                open={drawerNetworkModificationTreeOpen}
                drawerClassName={classes.drawerNetworkModificationTree}
                drawerShiftClassName={
                    classes.drawerNetworkModificationTreeShift
                }
            >
                <NetworkModificationTreePane studyUuid={studyUuid} />
            </StudyDrawer>
            <StudyDrawer
                open={networkModificationsPaneOpen}
                drawerClassName={classes.nodeEditor}
                drawerShiftClassName={classes.nodeEditorShift}
            >
                <NodeEditor onClose={closeNetworkModificationConfiguration} />
            </StudyDrawer>
        </>
    );
}
StudyLateralToolBar.propTypes = {
    classes: PropTypes.any,
    handleDisplayNetworkExplorer: PropTypes.func,
    handleDisplayNetworkModificationTree: PropTypes.func,
    networkExplorerDisplayed: PropTypes.bool,
    networkModificationTreeDisplayed: PropTypes.bool,
    handleOpenNetworkModificationConfiguration: PropTypes.func,
    network: PropTypes.any,
    onVoltageLevelDisplayClick: PropTypes.func,
    onSubstationDisplayClick: PropTypes.func,
    onSubstationFocus: PropTypes.func,
    visibleSubstation: PropTypes.any,
    view: PropTypes.any,
    treeModel: PropTypes.any,
    networkModificationsPaneOpen: PropTypes.bool,
    onClose: PropTypes.func,
};
