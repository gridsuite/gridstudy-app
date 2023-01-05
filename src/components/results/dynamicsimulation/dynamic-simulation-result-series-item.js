/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    Checkbox,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';

const DynamicSimulationResultSeriesItem = ({
    item: { id, label },
    onChangeLeftAxis,
    onChangeRightAxis,
    leftAxisChecked,
    rightAxisChecked,
}) => {
    const handleToggleLeftAxis = (id) => {
        return onChangeLeftAxis(id);
    };

    const handleToggleRightAxis = (id) => {
        return onChangeRightAxis(id);
    };

    return (
        <ListItem
            key={id}
            secondaryAction={
                <Checkbox
                    edge={'end'}
                    onChange={handleToggleRightAxis(id)}
                    checked={rightAxisChecked}
                    inputProps={{ 'aria-labelledby': `right-axis-label-${id}` }}
                />
            }
            disablePadding
        >
            <ListItemButton
                role={undefined}
                onClick={handleToggleLeftAxis(id)}
                dense
            >
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

export default DynamicSimulationResultSeriesItem;
