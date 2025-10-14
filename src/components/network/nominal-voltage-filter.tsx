/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, List, ListItem, ListItemButton, ListItemText, Paper, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { type MuiStyles } from '@gridsuite/commons-ui';

const styles = {
    nominalVoltageZone: {
        minWidth: '90px',
        maxHeight: '300px',
        overflowY: 'auto',
    },
    nominalVoltageItem: {
        padding: '0px',
    },
    nominalVoltageCheck: {
        size: 'small',
        padding: '0px',
    },
    nominalVoltageText: {
        fontSize: 12,
    },
    nominalVoltageSelectionControl: {
        fontSize: 12,
        textDecoration: 'underline',
        textTransform: 'none',
        padding: '0px',
        minWidth: '45%',
        '&:hover, &:focus': {
            textDecoration: 'underline',
        },
    },
} as const satisfies MuiStyles;

export type NominalVoltageFilterProps = {
    nominalVoltages: number[];
    filteredNominalVoltages: number[];
    onChange: (filteredNominalVoltages: number[]) => void;
};

type voltageInterval = {
    vlInterval: string;
    vlListValues: number[];
    isChecked: boolean;
    lowBound: number;
    highBound: number;
    vlValue: number;
};

export default function NominalVoltageFilter({
    nominalVoltages,
    filteredNominalVoltages,
    onChange,
}: Readonly<NominalVoltageFilterProps>) {
    const [voltageLevelIntervals, setVoltageLevelIntervals] = useState<voltageInterval[]>([
        { vlInterval: '0to30', vlListValues: [], isChecked: true, lowBound: 0, highBound: 30, vlValue: 20 },
        { vlInterval: '30to50', vlListValues: [], isChecked: true, lowBound: 30, highBound: 50, vlValue: 45 },
        { vlInterval: '50to70', vlListValues: [], isChecked: true, lowBound: 50, highBound: 70, vlValue: 63 },
        { vlInterval: '70to120', vlListValues: [], isChecked: true, lowBound: 70, highBound: 120, vlValue: 90 },
        { vlInterval: '120to180', vlListValues: [], isChecked: true, lowBound: 120, highBound: 180, vlValue: 150 },
        { vlInterval: '180to300', vlListValues: [], isChecked: true, lowBound: 180, highBound: 300, vlValue: 225 },
        { vlInterval: '300to500', vlListValues: [], isChecked: true, lowBound: 300, highBound: 500, vlValue: 400 },
    ]);
    const getIntervalKey = (voltageValue: number): string => {
        if (voltageValue < 30) {
            return '0to30';
        }
        if (voltageValue < 50) {
            return '30to50';
        }
        if (voltageValue < 70) {
            return '50to70';
        }
        if (voltageValue < 120) {
            return '70to120';
        }
        if (voltageValue < 180) {
            return '120to180';
        }
        if (voltageValue < 300) {
            return '180to300';
        }
        return '300to500';
    };
    const updateVoltageLevelIntervals = useCallback((voltageValue: number) => {
        const key = getIntervalKey(voltageValue);
        setVoltageLevelIntervals((prev) =>
            prev.map((interval) =>
                interval.vlInterval === key
                    ? { ...interval, vlListValues: [...interval.vlListValues, voltageValue] }
                    : interval
            )
        );
    }, []);
    useEffect(() => {
        nominalVoltages.forEach(updateVoltageLevelIntervals);
    }, [nominalVoltages, updateVoltageLevelIntervals]);

    const handleToggle = useCallback(
        (intervalLabel: string, interval?: voltageInterval) => {
            let newFiltered: number[];
            if (intervalLabel === 'all') {
                newFiltered = [...nominalVoltages];
                setVoltageLevelIntervals((prev) => prev.map((i) => ({ ...i, isChecked: true })));
            } else if (intervalLabel === 'none') {
                newFiltered = [];
                setVoltageLevelIntervals((prev) => prev.map((i) => ({ ...i, isChecked: false })));
            } else {
                if (interval === undefined) {
                    return;
                }
                // we "inverse" the selection for vlListValues
                newFiltered = [...filteredNominalVoltages];
                interval.vlListValues.forEach((vnom) => {
                    const currentIndex = newFiltered.indexOf(vnom);
                    if (currentIndex === -1) {
                        newFiltered.push(vnom); //not previously present, we add it
                    } else {
                        newFiltered.splice(currentIndex, 1); // previously present, we remove it
                    }
                });
                setVoltageLevelIntervals((prev) =>
                    prev.map((i) => (i.vlInterval === interval.vlInterval ? { ...i, isChecked: !i.isChecked } : i))
                );
            }
            onChange(newFiltered); // update filteredNominalVoltages
        },
        [filteredNominalVoltages, nominalVoltages, onChange]
    );
    const handleSelectAll = useCallback(() => handleToggle('all'), [handleToggle]);
    const handleSelectNone = useCallback(() => handleToggle('none'), [handleToggle]);

    const nominalVoltagesList = useMemo(
        () =>
            voltageLevelIntervals.map((interval) => (
                <ListItem sx={styles.nominalVoltageItem} key={interval.vlInterval}>
                    <ListItemButton
                        role={undefined}
                        dense
                        onClick={() => handleToggle(interval.vlInterval, interval)}
                        disabled={!filteredNominalVoltages}
                    >
                        <Checkbox color="default" sx={styles.nominalVoltageCheck} checked={interval.isChecked} />
                        <Tooltip
                            title={
                                <FormattedMessage
                                    id={'voltageLevelInterval'}
                                    values={{ lowBound: interval.lowBound, highBound: interval.highBound }}
                                />
                            }
                        >
                            <ListItemText
                                sx={styles.nominalVoltageText}
                                disableTypography
                                primary={`${interval.vlValue} kV`}
                            ></ListItemText>
                        </Tooltip>
                    </ListItemButton>
                </ListItem>
            )),
        [filteredNominalVoltages, handleToggle, voltageLevelIntervals]
    );

    if (nominalVoltages.length <= 0) {
        return false;
    }
    return (
        <Paper>
            <List sx={styles.nominalVoltageZone}>
                <ListItem sx={styles.nominalVoltageItem}>
                    <Button size={'small'} sx={styles.nominalVoltageSelectionControl} onClick={handleSelectAll}>
                        <FormattedMessage id="CBAll" />
                    </Button>
                    <ListItemText sx={styles.nominalVoltageText} secondary={'/'} />
                    <Button size={'small'} sx={styles.nominalVoltageSelectionControl} onClick={handleSelectNone}>
                        <FormattedMessage id="CBNone" />
                    </Button>
                </ListItem>
                {nominalVoltagesList}
            </List>
        </Paper>
    );
}
