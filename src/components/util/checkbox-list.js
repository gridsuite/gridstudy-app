/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import List from '@material-ui/core/List';

const CheckboxList = ({ itemRenderer, ...props }) => {
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

    const handleToggle = (value) => {
        const newChecked = new Set(checked);
        if (!newChecked.delete(value)) {
            newChecked.add(value);
        }
        setChecked(newChecked);

        if (props.onChecked) {
            props.onChecked([...newChecked]);
        }
    };

    return (
        <List>
            {props.values.map((item) =>
                itemRenderer(item, checked, (id) => handleToggle(id, false))
            )}
        </List>
    );
};

export default CheckboxList;
