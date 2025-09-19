/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, List, ListSubheader, Typography } from '@mui/material';
import { Dispatch, memo, SetStateAction, useCallback, useEffect, useState } from 'react';
import DynamicSimulationResultSeriesItem from './dynamic-simulation-result-series-item';
import { type MuiStyles } from '@gridsuite/commons-ui';

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
} as const satisfies MuiStyles;

export type DynamicSimulationResultSeriesListProps = {
    index: number;
    items: {
        id: number;
        label: string;
    }[];
    headers: string[];
    onLeftAxisSelected: (index: number, axisCheckedIndexes: number[]) => void;
    onRightAxisSelected: (index: number, axisCheckedIndexes: number[]) => void;
};

function DynamicSimulationResultSeriesList({
    index,
    items,
    headers,
    onLeftAxisSelected,
    onRightAxisSelected,
}: Readonly<DynamicSimulationResultSeriesListProps>) {
    const [leftAxisCheckedIndexes, setLeftAxisCheckedIndexes] = useState<number[]>([]);
    const [rightAxisCheckedIndexes, setRightAxisCheckedIndexes] = useState<number[]>([]);

    const handleToggle = useCallback((id: number, setAxisCheckedIndexes: Dispatch<SetStateAction<number[]>>) => {
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
        (id: number) => {
            handleToggle(id, setLeftAxisCheckedIndexes);
        },
        [handleToggle]
    );

    const handleToggleRightAxis = useCallback(
        (id: number) => {
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
                        <Grid item flexGrow={index === 1 ? 1 : 0} key={header}>
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
                    key={item.id}
                    item={item}
                    onChangeLeftAxis={handleToggleLeftAxis}
                    onChangeRightAxis={handleToggleRightAxis}
                />
            ))}
        </List>
    );
}

export default memo(DynamicSimulationResultSeriesList);
