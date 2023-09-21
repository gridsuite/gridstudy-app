/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useMemo, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { MultiSelectList } from './multi-select-list';

const styles = {
    notificationDot: {
        height: '6px',
        width: '6px',
        backgroundColor: '#cc70a0',
        borderRadius: '50%',
        position: 'absolute',
        top: '5px',
        left: '23px',
    },
    container: {
        position: 'relative',
    },
    icon: {
        width: '0.7em',
        height: '0.7em',
    },
};

/**
 * FilterButton wraps a MultiSelectList with a button which has a visual indication to indicate when the user alters the default state of the list
 *
 * @param {Object}   selectedItems    - It serves as the model and data of the Component each entry must be formatted as a pair of string and boolean. Each key will be displayed and the corresponding boolean is updated in function of its checkbox status
 * @param {Function} setSelectedItems - Setter needed to update the list underlying data
 */

export const FilterButton = ({ selectedItems, setSelectedItems }) => {
    const [initialState] = useState(selectedItems);
    const [anchorEl, setAnchorEl] = useState();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event) => {
        setSelectedItems((previousSelection) => {
            return {
                ...previousSelection,
                [event.target.name]: !selectedItems[event.target.name],
            };
        });
    };

    const isInitialStateModified = useMemo(() => {
        return Object.keys(selectedItems).some(
            (key) => initialState[key] !== selectedItems[key]
        );
    }, [initialState, selectedItems]);

    return (
        <Box sx={styles.container}>
            <IconButton onClick={handleClick}>
                <MenuIcon sx={styles.icon} />
                {isInitialStateModified && <Box sx={styles.notificationDot} />}
            </IconButton>
            <MultiSelectList
                selectedItems={selectedItems}
                handleChange={handleChange}
                handleClose={handleClose}
                anchor={anchorEl}
            />
        </Box>
    );
};
