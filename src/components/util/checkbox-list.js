/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

const CheckboxList = (props) => {
    const [checked, setChecked] = useState([]);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);

        if (props.onChecked) {
            props.onChecked(newChecked);
        }
    };

    return (
        <List>
            {props.values.map((item) => {
                return (
                    <ListItem
                        key={props.id(item)}
                        role={undefined}
                        dense
                        button
                        onClick={handleToggle(props.id(item))}
                    >
                        <ListItemIcon>
                            <Checkbox
                                color={'primary'}
                                edge="start"
                                checked={checked.indexOf(props.id(item)) !== -1}
                                tabIndex={-1}
                                disableRipple
                            />
                        </ListItemIcon>
                        <ListItemText primary={props.label(item)} />
                    </ListItem>
                );
            })}
        </List>
    );
};

export default CheckboxList;
