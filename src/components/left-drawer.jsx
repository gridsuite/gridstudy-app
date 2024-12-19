import Drawer from '@mui/material/Drawer';
import PropTypes from 'prop-types';
import { mergeSx } from './utils/functions';
import { DRAWER_NODE_EDITOR_WIDTH } from '../utils/UIconstants';
import RootNetworkEditor from './graph/menus/root-network-editor';

const styles = {
    drawerPaper: {
        position: 'static',
        overflow: 'hidden',
        flex: '1',
        flexGrow: '1',
        transition: 'none !important',
        //  backgroundColor: 'green  !important',
    },
    nodeEditor: (theme) => ({
        width: DRAWER_NODE_EDITOR_WIDTH + 'px',
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
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
        marginRight: -DRAWER_NODE_EDITOR_WIDTH + 'px', // Shift out of view when closed
    }),
    leftDrawer: (theme) => ({
        width: DRAWER_NODE_EDITOR_WIDTH + 'px',
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        zIndex: 51,
        position: 'relative',
        flexShrink: 1,
        overflowY: 'none',
        overflowX: 'none',
    }),
    leftDrawerShift: (theme) => ({
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        pointerEvents: 'none',
        marginLeft: DRAWER_NODE_EDITOR_WIDTH + 'px', // Shift right when open
    }),
};

// LeftDrawer Component
export const LeftDrawer = ({ open }) => {
    return (
        <Drawer
            variant={'persistent'}
            sx={mergeSx(styles.leftDrawer, !open && styles.leftDrawerShift)}
            anchor="left" // Ensure the drawer opens from the left
            open={open}
            PaperProps={{
                sx: styles.drawerPaper,
            }}
        >
            <RootNetworkEditor />
        </Drawer>
    );
};

LeftDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
};
