import React, { useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
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
                    checked={props.checked}
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
