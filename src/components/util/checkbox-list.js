/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import List from '@material-ui/core/List';

const CheckboxList = ({
    itemRenderer,
    toggleSelectAll,
    values,
    onChecked,
    ...props
}) => {
    const [checked, setChecked] = useState(new Set(props.initialSelection));

    /* remove non absent selected items */
    useEffect(() => {
        const existingValues = new Set(values);
        const newChecked = new Set(
            [...checked].filter((id) => existingValues.has(id))
        );
        if (newChecked.size !== checked.size) {
            setChecked(newChecked);
        }
    }, [values, checked, setChecked]);

    const refVals = useRef({ values: onChecked });
    refVals.current = { values, onChecked };

    useEffect(() => {
        if (toggleSelectAll === undefined) return;
        setChecked((oldVals) => {
            return oldVals.size > 0
                ? new Set()
                : new Set(refVals.current.values);
        });
    }, [toggleSelectAll]);

    const handleToggle = useCallback(
        (value) => {
            const newChecked = new Set(checked);
            if (!newChecked.delete(value)) {
                newChecked.add(value);
            }
            setChecked(newChecked);

            if (onChecked) {
                onChecked([...newChecked]);
            }
        },
        [checked, onChecked]
    );

    useEffect(() => onChecked && onChecked(checked), [checked, onChecked]);

    return (
        <List>
            {values?.map((item, index) =>
                itemRenderer({
                    item,
                    index,
                    checked: checked.has(item),
                    handleToggle,
                })
            )}
        </List>
    );
};

export default CheckboxList;
