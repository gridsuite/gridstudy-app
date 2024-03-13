/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import { NestedMenuItem } from 'mui-nested-menu';
import { Box } from '@mui/system';
import MenuItem from '@mui/material/MenuItem';
import { mergeSx } from './functions';

const styles = {
    highlightedParentLine: {
        backgroundColor: 'action.hover',
        color: 'primary.main',
        transition: 'all 300ms ease',
    },
    highlightedLine: {
        transition: 'all 300ms ease',
        '&:hover': {
            backgroundColor: 'action.hover',
            color: 'primary.main',
        },
    },
};

export const CustomNestedMenuItem = (props) => {
    const { sx, children, ...other } = props;
    const [isSubMenuActive, setSubMenuActive] = useState(false);

    return (
        <NestedMenuItem
            parentMenuOpen={true}
            sx={mergeSx(
                isSubMenuActive
                    ? styles.highlightedParentLine
                    : styles.highlightedLine,
                sx,
            )}
            {...other}
        >
            <Box
                onMouseEnter={() => setSubMenuActive(true)}
                onMouseLeave={() => setSubMenuActive(false)}
            >
                {children}
            </Box>
        </NestedMenuItem>
    );
};

export const CustomMenuItem = (props) => {
    const { sx, ...other } = props;

    return <MenuItem sx={mergeSx(styles.highlightedLine, sx)} {...other} />;
};
