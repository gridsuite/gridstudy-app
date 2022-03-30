import React, { useState } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import * as PropTypes from 'prop-types';

const ListItemWithDeleteButton = (props) => {
    const [isHoover, setHoover] = useState(false);

    function handleHoover(enter) {
        return setHoover(enter);
    }

    return (
        <ListItem
            role={undefined}
            dense
            button
            onClick={props.onClick}
            onMouseEnter={() => handleHoover(true)}
            onMouseLeave={() => handleHoover(false)}
        >
            <ListItemIcon>
                <Checkbox
                    color={'primary'}
                    edge="start"
                    checked={props.set.has(props.value)}
                    tabIndex={-1}
                    disableRipple
                />
            </ListItemIcon>
            <ListItemText primary={props.primary} />
            {props.removeFromList && isHoover && (
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

ListItemWithDeleteButton.propTypes = {
    onClick: PropTypes.func,
    set: PropTypes.any,
    value: PropTypes.any,
    primary: PropTypes.any,
    removeFromList: PropTypes.any,
};

export default ListItemWithDeleteButton;
