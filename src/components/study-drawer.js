/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Drawer from '@material-ui/core/Drawer';
import clsx from 'clsx';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    drawer: {
        position: 'relative',
        flexShrink: 1,
        overflowY: 'none',
        overflowX: 'none',
    },
    drawerPaper: {
        position: 'static',
        overflow: 'hidden',
        flex: '1',
        flexGrow: '1',
        transition: 'none !important',
    },
}));

export const StudyDrawer = ({
    drawerClassName,
    drawerShiftClassName,
    open,
    children,
    anchor,
}) => {
    const classes = useStyles();
    return (
        <Drawer
            variant={'persistent'}
            className={clsx(drawerClassName, classes.drawer, {
                [drawerShiftClassName]: !open,
            })}
            anchor={anchor}
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
    children: PropTypes.object,
    anchor: PropTypes.string,
};
