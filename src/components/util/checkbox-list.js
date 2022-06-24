/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import List from '@mui/material/List';
import PropTypes from 'prop-types';
import { isEqual } from './is-object-equals';

const CheckboxList = ({
    itemRenderer,
    toggleSelectAll,
    values,
    onChecked,
    initialSelection,
    ...props
}) => {
    const [checked, setChecked] = useState(new Set(initialSelection));

    useEffect(() => {
        const existingValues = new Set(values);
        const newChecked = new Set(
            [...checked].filter((element) => {
                for (const existingValue of existingValues) {
                    if (isEqual(element, existingValue)) {
                        return true;
                    }
                }
                return false;
            })
        );
        if (newChecked.size !== checked.size) {
            setChecked(newChecked);
        }
    }, [values, checked, setChecked]);

    const refVals = useRef();
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
            let valueToDelete = undefined;
            for (const e of newChecked) {
                if (isEqual(e, value)) {
                    valueToDelete = e;
                    break;
                }
            }

            if (!newChecked.delete(valueToDelete)) {
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

    const isCheckboxInCheckedSet = (checkedSet, checkBoxToCheck) => {
        for (const element of checkedSet) {
            if (isEqual(element, checkBoxToCheck)) {
                return true;
            }
        }
        return false;
    };

    return (
        <List {...props}>
            {values?.map((item, index) =>
                itemRenderer({
                    item,
                    index,
                    checked: isCheckboxInCheckedSet(checked, item),
                    handleToggle,
                })
            )}
        </List>
    );
};

export default CheckboxList;

CheckboxList.propTypes = {
    initialSelection: PropTypes.array,
    itemRenderer: PropTypes.func.isRequired,
    onChecked: PropTypes.func.isRequired,
    toggleSelectAll: PropTypes.bool,
    values: PropTypes.array,
};
