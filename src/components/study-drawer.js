/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Drawer from '@mui/material/Drawer';
import React from 'react';
import PropTypes from 'prop-types';
import { mergeSx } from './utils/functions';

const styles = {
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
};

export const StudyDrawer = ({
    drawerStyle,
    drawerShiftStyle,
    open,
    children,
    anchor,
}) => {
    return (
        <Drawer
            variant={'persistent'}
            sx={mergeSx(drawerStyle, styles.drawer, !open && drawerShiftStyle)}
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
    drawerStyle: PropTypes.object,
    drawerShiftStyle: PropTypes.object,
    open: PropTypes.bool,
    children: PropTypes.object,
    anchor: PropTypes.string,
};
