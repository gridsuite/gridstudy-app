/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import DynamicSimulationResultSeriesItem from './dynamic-simulation-result-series-item';
import { Grid, List, ListSubheader, Typography } from '@mui/material';
import { memo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';

const useStyle = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxHeight: 'calc(100vh - 300px)',
        overflow: 'auto',
    },
    headerItem: {
        textAlign: 'center',
        background: theme.palette.background.paper,
    },
    headerList: {},
}));

const DynamicSimulationResultSeriesList = ({
    index,
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
        onAxisSelected(index, [...newChecked]);
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
            <ListSubheader className={classes.headerList}>
                <Grid container>
                    {headers.map((header, index) => (
                        <Grid item flexGrow={index === 1 ? 1 : 0} key={index}>
                            <Typography
                                className={classes.headerItem}
                                variant={'subtitle1'}
                            >
                                {header}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </ListSubheader>
        );
    };
    return (
        <List className={classes.root} subheader={renderHeaders()}>
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
