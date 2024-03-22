/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { List } from '@mui/material';
import { areIdsEqual } from './utils';

const CheckboxList = ({
    itemRenderer,
    values,
    onChecked,
    checkedValues,
    itemComparator = areIdsEqual,
    ...props
}) => {
    const isChecked = (item) =>
        checkedValues.some((checkedItem) => itemComparator(checkedItem, item));

    const handleToggle = (clickedItem) => {
        const newCheckedValues = [...checkedValues];
        const valueToDeleteIndex = checkedValues.findIndex((item) =>
            itemComparator(item, clickedItem)
        );

        if (valueToDeleteIndex > -1) {
            newCheckedValues.splice(valueToDeleteIndex, 1);
        } else {
            newCheckedValues.push(clickedItem);
        }

        onChecked(newCheckedValues);
    };

    return (
        <List {...props}>
            {values?.map((item, index) =>
                itemRenderer({
                    item,
                    index,
                    checked: isChecked(item),
                    handleToggle,
                })
            )}
        </List>
    );
};

export default CheckboxList;

CheckboxList.propTypes = {
    itemRenderer: PropTypes.func.isRequired,
    onChecked: PropTypes.func.isRequired,
    checkedValues: PropTypes.array.isRequired,
    values: PropTypes.array,
    itemComparator: PropTypes.func,
};
