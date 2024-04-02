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

const RestoreModificationListItem = (props) => {
    const [isHover, setHover] = useState(false);

    function handleHover(enter) {
        return setHover(enter);
    }

    return (
        <ListItem
            role={undefined}
            dense
            button
            onClick={props.onClick}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            style={{
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
            {props.removeFromList && isHover && (
                <IconButton onClick={props.removeFromList} size={'small'}>
                    <DeleteIcon
                        style={{
                            alignItems: 'end',
                        }}
                    />
                </IconButton>
            )}
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
