/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Checkbox, FormControlLabel } from '@mui/material';

const styles = {
    label: {
        width: '100%',
        margin: 0,
    },
    menuItem: {
        padding: '0 10px 0 0',
    },
};

/**
 * MultiSelectList allows to manipulate an object where each keys are associated to a boolean in order to determine which are the ones the user wants to select
 *
 * @param {Object}   selectedItems - It serves as the model and data of the Component each entry must be formatted as a pair of string and boolean. Each key will be displayed and the corresponding boolean is updated in function of its checkbox status
 * @param {Function} handleChange - Allows to customise the behaviour on selection change
 * @param {Function} handleClose - Allows to customise the behaviour when the menu is closing
 * @param {Object} anchor - Determines where the menu will appear on screen
 */

export const MultiSelectList = ({
    selectedItems,
    handleChange,
    handleClose,
    anchor,
}) => {
    const open = Boolean(anchor);
    return (
        <Menu open={open} onClose={handleClose} anchorEl={anchor}>
            {Object.entries(selectedItems).map(([key, value]) => {
                return (
                    <MenuItem sx={styles.menuItem} key={key}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={value}
                                    onChange={handleChange}
                                    name={key}
                                />
                            }
                            label={key}
                            sx={styles.label}
                        />
                    </MenuItem>
                );
            })}
        </Menu>
    );
};
