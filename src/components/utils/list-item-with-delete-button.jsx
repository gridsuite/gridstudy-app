/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import * as PropTypes from 'prop-types';
import { ListItemButton } from '@mui/material';

const ListItemWithDeleteButton = (props) => {
    const [isHoover, setHoover] = useState(false);

    return (
        <ListItem
            onMouseEnter={() => setHoover(true)}
            onMouseLeave={() => setHoover(false)}
            disablePadding
            secondaryAction={
                props.removeFromList &&
                isHoover && (
                    <IconButton
                        style={{
                            alignItems: 'end',
                        }}
                        edge="end"
                        onClick={props.removeFromList}
                        size={'small'}
                    >
                        <DeleteIcon />
                    </IconButton>
                )
            }
        >
            <ListItemButton
                role={undefined}
                onClick={props.onClick}
                dense
                sx={{
                    paddingTop: 0,
                    paddingBottom: 0,
                }}
            >
                <ListItemIcon>
                    <Checkbox
                        edge="start"
                        size={'small'}
                        checked={props.checked}
                        tabIndex={-1}
                        disableRipple
                    />
                </ListItemIcon>
                <ListItemText primary={props.primary} />
            </ListItemButton>
        </ListItem>
    );
};

ListItemWithDeleteButton.propTypes = {
    onClick: PropTypes.func,
    set: PropTypes.any,
    value: PropTypes.any,
    primary: PropTypes.any,
    removeFromList: PropTypes.any,
};

export default ListItemWithDeleteButton;
