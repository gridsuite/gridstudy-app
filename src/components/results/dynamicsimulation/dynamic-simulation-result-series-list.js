/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import DynamicSimulationResultSeriesItem from './dynamic-simulation-result-series-item';
import { List, ListSubheader } from '@mui/material';
import { memo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';

const useStyle = makeStyles((theme) => ({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
    },
}));

const DynamicSimulationResultSeriesList = ({
    items,
    headers,
    onLeftAxisSelected,
    onRightAxisSelected,
}) => {
    console.log('Rerender DynamicSimulationResultSeriesList', [items]);
    const [leftAxisChecked, setLeftAxisChecked] = useState([]);
    const [rightAxisChecked, setRightAxisChecked] = useState([]);

    const classes = useStyle();

    function handleToggle(id, axisChecked, setAxisChecked, onAxisSelected) {
        console.log('handleToggle id=', id);
        const currIndex = axisChecked.indexOf(id);
        const newChecked = [...axisChecked];

        if (currIndex === -1) {
            newChecked.push(id);
        } else {
            newChecked.splice(currIndex, 1);
        }

        setAxisChecked(newChecked);

        // propagate changes
        onAxisSelected([...newChecked]);
    }

    const handleToggleLeftAxis = (id) => () => {
        handleToggle(
            id,
            leftAxisChecked,
            setLeftAxisChecked,
            onLeftAxisSelected
        );
    };

    const handleToggleRightAxis = (id) => () => {
        handleToggle(
            id,
            rightAxisChecked,
            setRightAxisChecked,
            onRightAxisSelected
        );
    };

    const renderHeaders = () => {
        return (
            <ListSubheader>
                <li className={classes.header}>
                    {headers.map((header, index) => (
                        <ul key={index}>{header}</ul>
                    ))}
                </li>
            </ListSubheader>
        );
    };
    return (
        <List
            sx={{
                width: '100%',
                maxHeight: 600,
                overflow: 'auto',
                bgColor: 'background.paper',
            }}
            subheader={renderHeaders()}
        >
            {items.map((item, index) => (
                <DynamicSimulationResultSeriesItem
                    key={index}
                    item={item}
                    onChangeLeftAxis={handleToggleLeftAxis}
                    onChangeRightAxis={handleToggleRightAxis}
                    leftAxisChecked={leftAxisChecked.indexOf(item.id) !== -1}
                    rightAxisChecked={rightAxisChecked.indexOf(item.id) !== -1}
                />
            ))}
        </List>
    );
};

export default memo(DynamicSimulationResultSeriesList);
