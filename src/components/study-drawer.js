import Drawer from '@material-ui/core/Drawer';
import clsx from 'clsx';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { drawerToolbarWidth } from './study-lateral-tool-bar';

const useStyles = makeStyles((theme) => ({
    drawer: {
        position: 'relative',
        flexShrink: 1,
        overflowY: 'none',
        overflowX: 'none',
    },
    drawerToolbar: {
        width: drawerToolbarWidth,
        // zIndex set to be below the loader with overlay
        // and above the network explorer drawer
        zIndex: 60,
    },
    drawerPaper: {
        position: 'static',
        overflow: 'hidden',
        flex: '1',
        flexGrow: '1',
    },
}));

export const ToolDrawer = ({ children }) => {
    const classes = useStyles();

    return (
        <Drawer
            variant={'permanent'}
            className={clsx(classes.drawerToolbar, classes.drawer)}
            anchor="left"
            classes={{
                paper: classes.drawerPaper,
            }}
        >
          {children}
        </Drawer>
    );
};

export const StudyDrawer = ({
    drawerClassName,
    drawerShiftClassName,
    open,
    children,
}) => {
    const classes = useStyles();
    return (
        <Drawer
            variant={'persistent'}
            className={clsx(drawerClassName, classes.drawer, {
                [drawerShiftClassName]: !open,
            })}
            anchor="left"
            open={open}
            classes={{
                paper: classes.drawerPaper,
            }}
        >
          {children}
        </Drawer>
    );
};

StudyDrawer.propTypes = {
    drawerClassName: PropTypes.string,
    drawerShiftClassName: PropTypes.string,
    open: PropTypes.bool,
};
