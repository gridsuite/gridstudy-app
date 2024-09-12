/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useIntl } from 'react-intl';
import Menu from '@mui/material/Menu';

const styles = {
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
 * @param {Object} filterText - Value of the filter
 * @param {Function} setFilterText - Setter needed to update the filter
 */

export const TextFilterButton = ({ filterText, setFilterText }) => {
    const intl = useIntl();

    const [anchorEl, setAnchorEl] = useState();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChange = (event) => {
        setFilterText(event.target.value);
    };

    return (
        <Box sx={styles.container}>
            <IconButton onClick={handleClick}>
                <FilterAltIcon sx={styles.icon} />
            </IconButton>
            <Menu open={Boolean(anchorEl)} onClose={handleClose} anchorEl={anchorEl}>
                <TextField
                    size={'small'}
                    fullWidth
                    value={filterText || ''}
                    onChange={handleChange}
                    placeholder={intl.formatMessage({
                        id: 'filter.filterOoo',
                    })}
                    inputProps={{
                        type: 'text',
                    }}
                />
            </Menu>
        </Box>
    );
};
