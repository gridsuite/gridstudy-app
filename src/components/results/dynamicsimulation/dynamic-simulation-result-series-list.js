/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import PropTypes from 'prop-types';
import DynamicSimulationResultSeriesItem from './dynamic-simulation-result-series-item';
import { debounce, Grid, List, ListSubheader, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';

const useStyle = makeStyles((theme) => ({
    root: {
        width: '100%',
        maxHeight: 'calc(100vh - 330px)',
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
    const [leftAxisChecked, setLeftAxisChecked] = useState([]);
    const [rightAxisChecked, setRightAxisChecked] = useState([]);

    const classes = useStyle();

    const handleToggle = useCallback((id, setAxisChecked) => {
        setAxisChecked((prev) => {
            const currIndex = prev.indexOf(id);
            const newChecked = [...prev];
            if (currIndex === -1) {
                newChecked.push(id);
            } else {
                newChecked.splice(currIndex, 1);
            }
            return newChecked;
        });
    }, []);

    const handleToggleLeftAxis = useCallback(
        (id) => {
            handleToggle(id, setLeftAxisChecked);
        },
        [handleToggle]
    );

    const handleToggleRightAxis = useCallback(
        (id) => {
            handleToggle(id, setRightAxisChecked);
        },
        [handleToggle]
    );

    const delayedOnLeftAxisSelected = useMemo(
        () => debounce(onLeftAxisSelected, 500),
        [onLeftAxisSelected]
    );
    const delayedOnRightAxisSelected = useMemo(
        () => debounce(onRightAxisSelected, 500),
        [onRightAxisSelected]
    );

    useEffect(() => {
        // propagate changes
        delayedOnLeftAxisSelected(index, leftAxisChecked);
    }, [leftAxisChecked, index, delayedOnLeftAxisSelected]);

    useEffect(() => {
        // propagate changes
        delayedOnRightAxisSelected(index, rightAxisChecked);
    }, [rightAxisChecked, index, delayedOnRightAxisSelected]);

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
                />
            ))}
        </List>
    );
};

DynamicSimulationResultSeriesList.propTypes = {
    index: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.object),
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    onLeftAxisSelected: PropTypes.func.isRequired,
    onRightAxisSelected: PropTypes.func.isRequired,
};

export default memo(DynamicSimulationResultSeriesList);
