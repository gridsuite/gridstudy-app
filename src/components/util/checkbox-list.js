/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import * as PropTypes from 'prop-types';

function CustomListItem(props) {
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
}

CustomListItem.propTypes = {
    onClick: PropTypes.func,
    set: PropTypes.any,
    value: PropTypes.any,
    primary: PropTypes.any,
    removeFromList: PropTypes.any,
};
const CheckboxList = (props) => {
    const [checked, setChecked] = useState(new Set(props.initialSelection));

    /* remove non absent selected items */
    useEffect(() => {
        const existingValues = new Set(props.values.map(props.id));
        const newChecked = new Set(
            [...checked].filter((id) => existingValues.has(id))
        );
        if (newChecked.size !== checked.size) {
            setChecked(newChecked);
        }
    }, [props.values, props.id, checked, setChecked]);

    const handleToggle = (value, forceRemove) => {
        const newChecked = new Set(checked);
        if (!newChecked.delete(value)) {
            if (forceRemove) {
                return;
            }
            newChecked.add(value);
        }
        setChecked(newChecked);

        if (props.onChecked) {
            props.onChecked([...newChecked]);
        }
    };

    return (
        <List>
            {props.values.map((item) => {
                return (
                    <CustomListItem
                        key={props.id(item)}
                        onClick={() => handleToggle(props.id(item), false)}
                        set={checked}
                        value={props.id(item)}
                        primary={props.label(item)}
                        removeFromList={
                            props.removeFromList
                                ? (e) => {
                                      e.stopPropagation();
                                      handleToggle(props.id(item), true);
                                      props.removeFromList(props.id(item));
                                  }
                                : undefined
                        }
                    />
                );
            })}
        </List>
    );
};

export default CheckboxList;
