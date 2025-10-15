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
import { BASE_VOLTAGES, VoltageLevelInterval } from './constants';
import { getNominalVoltageIntervalName } from './utils/nominal-voltage-filter-utils';

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

type VoltageLevelValuesInterval = VoltageLevelInterval & {
    vlListValues: number[];
    isChecked: boolean;
};

export default function NominalVoltageFilter({
    nominalVoltages,
    filteredNominalVoltages,
    onChange,
}: Readonly<NominalVoltageFilterProps>) {
    const [voltageLevelIntervals, setVoltageLevelIntervals] = useState<VoltageLevelValuesInterval[]>(
        BASE_VOLTAGES.map((interval) => ({ ...interval, vlListValues: [], isChecked: true }))
    );
    const updateVoltageLevelIntervals = useCallback((voltageValue: number) => {
        const intervalName = getNominalVoltageIntervalName(voltageValue);
        setVoltageLevelIntervals((prev) =>
            prev.map((interval) =>
                interval.name === intervalName
                    ? { ...interval, vlListValues: [...interval.vlListValues, voltageValue] }
                    : interval
            )
        );
    }, []);
    useEffect(() => {
        nominalVoltages.forEach(updateVoltageLevelIntervals);
    }, [nominalVoltages, updateVoltageLevelIntervals]);

    const handleToggle = useCallback(
        (intervalVlName: string, interval?: VoltageLevelValuesInterval) => {
            let newFiltered: number[];
            if (intervalVlName === 'all') {
                newFiltered = [...nominalVoltages];
                setVoltageLevelIntervals((prev) => prev.map((i) => ({ ...i, isChecked: true })));
            } else if (intervalVlName === 'none') {
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
                    prev.map((i) => (i.name === interval.name ? { ...i, isChecked: !i.isChecked } : i))
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
                <ListItem sx={styles.nominalVoltageItem} key={interval.name}>
                    <ListItemButton
                        role={undefined}
                        dense
                        onClick={() => handleToggle(interval.name, interval)}
                        disabled={!filteredNominalVoltages}
                    >
                        <Checkbox color="default" sx={styles.nominalVoltageCheck} checked={interval.isChecked} />
                        <Tooltip
                            title={
                                <FormattedMessage
                                    id={'voltageLevelInterval'}
                                    values={{ lowBound: interval.minValue, highBound: interval.maxValue }}
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
