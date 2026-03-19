/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { Button, Checkbox, List, ListItem, ListItemButton, ListItemText, Paper, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseVoltage, type MuiStyles } from '@gridsuite/commons-ui';
import { useBaseVoltages } from '../../hooks/use-base-voltages';

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

type VoltageLevelValuesInterval = Pick<BaseVoltage, 'name' | 'minValue' | 'maxValue'> & {
    vlListValues: number[];
};

export type NominalVoltageFilterProps = {
    nominalVoltages: number[];
    filteredNominalVoltages: number[];
    onChange: (filteredNominalVoltages: number[]) => void;
    disabled: boolean;
};

export default function NominalVoltageFilter({
    nominalVoltages,
    filteredNominalVoltages,
    onChange,
    disabled,
}: Readonly<NominalVoltageFilterProps>) {
    const { baseVoltages, getBaseVoltageInterval } = useBaseVoltages();
    const voltageLevelIntervals: VoltageLevelValuesInterval[] = useMemo(() => {
        return (
            baseVoltages?.map((interval) => {
                const vlListValues = nominalVoltages.filter(
                    (vnom) => getBaseVoltageInterval(vnom)?.name === interval.name
                );
                return { ...interval, vlListValues };
            }) ?? []
        );
    }, [baseVoltages, getBaseVoltageInterval, nominalVoltages]);

    const handleToggle = useCallback(
        (interval: VoltageLevelValuesInterval) => {
            let newFiltered: number[];

            // we "inverse" the selection for vlListValues
            newFiltered = [...filteredNominalVoltages];
            for (const vnom of interval.vlListValues) {
                const currentIndex = newFiltered.indexOf(vnom);
                if (currentIndex === -1) {
                    newFiltered.push(vnom); // not previously present, we add it
                } else {
                    newFiltered.splice(currentIndex, 1); // previously present, we remove it
                }
            }

            onChange(newFiltered); // update filteredNominalVoltages
        },
        [filteredNominalVoltages, onChange]
    );
    const handleToggleCheckAll = useCallback(
        (check: boolean) => {
            // if check is true, we check all; otherwise we uncheck all
            onChange(check ? [...nominalVoltages] : []); // update filteredNominalVoltages
        },
        [nominalVoltages, onChange]
    );
    const handleSelectAll = useCallback(() => handleToggleCheckAll(true), [handleToggleCheckAll]);
    const handleSelectNone = useCallback(() => handleToggleCheckAll(false), [handleToggleCheckAll]);

    const nominalVoltagesList = useMemo(
        () =>
            voltageLevelIntervals
                .filter((interval) => interval.vlListValues.length > 0)
                .map((interval) => {
                    const isChecked = filteredNominalVoltages.some(
                        (voltageValue) => voltageValue >= interval.minValue && voltageValue < interval.maxValue
                    );
                    return (
                        <ListItem sx={styles.nominalVoltageItem} key={interval.name}>
                            <Tooltip
                                title={
                                    <FormattedMessage
                                        id={'voltageLevelInterval'}
                                        values={{
                                            lowBound: interval.minValue,
                                            highBound: interval.maxValue,
                                        }}
                                    />
                                }
                                placement="left"
                            >
                                <ListItemButton
                                    role={undefined}
                                    dense
                                    onClick={() => handleToggle(interval)}
                                    disabled={!filteredNominalVoltages || disabled}
                                >
                                    <Checkbox color="default" sx={styles.nominalVoltageCheck} checked={isChecked} />

                                    <ListItemText
                                        sx={styles.nominalVoltageText}
                                        disableTypography
                                        primary={<FormattedMessage id={interval.name} />}
                                    ></ListItemText>
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                }),
        [filteredNominalVoltages, handleToggle, voltageLevelIntervals, disabled]
    );

    if (nominalVoltages.length <= 0) {
        return false;
    }
    return (
        <Paper>
            <List sx={styles.nominalVoltageZone}>
                <ListItem sx={styles.nominalVoltageItem}>
                    <Button
                        size={'small'}
                        sx={styles.nominalVoltageSelectionControl}
                        onClick={handleSelectAll}
                        disabled={disabled}
                    >
                        <FormattedMessage id="CBAll" />
                    </Button>
                    <ListItemText sx={styles.nominalVoltageText} secondary={'/'} />
                    <Button
                        size={'small'}
                        sx={styles.nominalVoltageSelectionControl}
                        onClick={handleSelectNone}
                        disabled={disabled}
                    >
                        <FormattedMessage id="CBNone" />
                    </Button>
                </ListItem>
                {nominalVoltagesList}
            </List>
        </Paper>
    );
}
