/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { Checkbox, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { memo, useState } from 'react';

const DynamicSimulationResultSeriesItem = ({ item: { id, label }, onChangeLeftAxis, onChangeRightAxis }) => {
    const [leftAxisChecked, setLeftAxisChecked] = useState(false);
    const [rightAxisChecked, setRightAxisChecked] = useState(false);

    const handleToggleLeftAxis = (id) => {
        onChangeLeftAxis(id);
        setLeftAxisChecked((prev) => !prev);
    };

    const handleToggleRightAxis = (id) => {
        onChangeRightAxis(id);
        setRightAxisChecked((prev) => !prev);
    };

    return (
        <ListItem
            key={id}
            secondaryAction={
                <Checkbox
                    edge={'end'}
                    onChange={() => handleToggleRightAxis(id)}
                    checked={rightAxisChecked}
                    inputProps={{ 'aria-labelledby': `right-axis-label-${id}` }}
                />
            }
            disablePadding
        >
            <ListItemButton role={undefined} onClick={() => handleToggleLeftAxis(id)} dense>
                <ListItemIcon>
                    <Checkbox
                        edge={'start'}
                        checked={leftAxisChecked}
                        disableRipple
                        inputProps={{
                            'aria-labelledby': `left-axis-label-${id}`,
                        }}
                    />
                </ListItemIcon>
                <ListItemText id={id} primary={label} />
            </ListItemButton>
        </ListItem>
    );
};

DynamicSimulationResultSeriesItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.number,
        label: PropTypes.string,
    }).isRequired,
    onChangeLeftAxis: PropTypes.func.isRequired,
    onChangeRightAxis: PropTypes.func.isRequired,
};

export default memo(DynamicSimulationResultSeriesItem);
