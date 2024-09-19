/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import DynamicSimulationResultSeriesItem from './dynamic-simulation-result-series-item';
import { Grid, List, ListSubheader, Typography } from '@mui/material';
import { memo, useCallback, useEffect, useState } from 'react';

const styles = {
    root: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
    },
    headerItem: (theme) => ({
        textAlign: 'center',
        background: theme.palette.background.paper,
    }),
};

const DynamicSimulationResultSeriesList = ({ index, items, headers, onLeftAxisSelected, onRightAxisSelected }) => {
    const [leftAxisCheckedIndexes, setLeftAxisCheckedIndexes] = useState([]);
    const [rightAxisCheckedIndexes, setRightAxisCheckedIndexes] = useState([]);

    const handleToggle = useCallback((id, setAxisCheckedIndexes) => {
        setAxisCheckedIndexes((prev) => {
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
            handleToggle(id, setLeftAxisCheckedIndexes);
        },
        [handleToggle]
    );

    const handleToggleRightAxis = useCallback(
        (id) => {
            handleToggle(id, setRightAxisCheckedIndexes);
        },
        [handleToggle]
    );

    useEffect(() => {
        // propagate changes
        onLeftAxisSelected(index, leftAxisCheckedIndexes);
    }, [leftAxisCheckedIndexes, index, onLeftAxisSelected]);

    useEffect(() => {
        // propagate changes
        onRightAxisSelected(index, rightAxisCheckedIndexes);
    }, [rightAxisCheckedIndexes, index, onRightAxisSelected]);

    const renderHeaders = () => {
        return (
            <ListSubheader>
                <Grid container>
                    {headers.map((header, index) => (
                        <Grid item flexGrow={index === 1 ? 1 : 0} key={index}>
                            <Typography sx={styles.headerItem} variant={'subtitle1'}>
                                {header}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </ListSubheader>
        );
    };
    return (
        <List sx={styles.root} subheader={renderHeaders()}>
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
