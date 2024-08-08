/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
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

const RestoreModificationListItem = (props) => {
    const [isHover, setHover] = useState(false);

    return (
        <ListItem
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            disablePadding
            secondaryAction={
                props.removeFromList &&
                isHover && (
                    <IconButton
                        style={{
                            alignItems: 'end',
                        }}
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
                    <Checkbox edge="start" size={'small'} checked={props.checked} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText primary={props.primary} />
            </ListItemButton>
        </ListItem>
    );
};

RestoreModificationListItem.propTypes = {
    onClick: PropTypes.func,
    set: PropTypes.any,
    value: PropTypes.any,
    primary: PropTypes.any,
    removeFromList: PropTypes.any,
};

export default RestoreModificationListItem;
