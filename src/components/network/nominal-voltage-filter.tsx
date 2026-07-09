/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import {
    Checkbox,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    type SxProps,
    type Theme,
    Tooltip,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseVoltage, mergeSx, type MuiStyles } from '@gridsuite/commons-ui';
import { useBaseVoltages } from '../../hooks/use-base-voltages';

const defaultStyles = {
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
        ml: 0.5,
    },
} as const satisfies MuiStyles;

type VoltageLevelValuesInterval = Pick<BaseVoltage, 'name' | 'minValue' | 'maxValue'> & {
    vlListValues: number[];
};

/** Per-element style overrides, merged with the component defaults via `mergeSx`. */
export interface NominalVoltageFilterStyles {
    root?: SxProps<Theme>;
    nominalVoltageZone?: SxProps<Theme>;
    nominalVoltageItem?: SxProps<Theme>;
    nominalVoltageCheck?: SxProps<Theme>;
    nominalVoltageText?: SxProps<Theme>;
}

export type NominalVoltageFilterProps = {
    nominalVoltages: number[];
    filteredNominalVoltages: number[];
    onChange: (filteredNominalVoltages: number[]) => void;
    disabled: boolean;
    styles?: NominalVoltageFilterStyles;
};

export default function NominalVoltageFilter({
    nominalVoltages,
    filteredNominalVoltages,
    onChange,
    disabled,
    styles: styleOverrides,
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

    // Master checkbox state: all present voltages selected / none / some (indeterminate).
    const checkedCount = useMemo(
        () => nominalVoltages.filter((v) => filteredNominalVoltages.includes(v)).length,
        [nominalVoltages, filteredNominalVoltages]
    );
    const allChecked = nominalVoltages.length > 0 && checkedCount === nominalVoltages.length;
    const noneChecked = checkedCount === 0;
    const handleToggleMaster = useCallback(() => handleToggleCheckAll(!allChecked), [handleToggleCheckAll, allChecked]);

    const sx = useMemo(
        () => ({
            root: mergeSx(styleOverrides?.root),
            nominalVoltageZone: mergeSx(defaultStyles.nominalVoltageZone, styleOverrides?.nominalVoltageZone),
            nominalVoltageItem: mergeSx(defaultStyles.nominalVoltageItem, styleOverrides?.nominalVoltageItem),
            nominalVoltageCheck: mergeSx(defaultStyles.nominalVoltageCheck, styleOverrides?.nominalVoltageCheck),
            nominalVoltageText: mergeSx(defaultStyles.nominalVoltageText, styleOverrides?.nominalVoltageText),
        }),
        [styleOverrides]
    );

    const nominalVoltagesList = useMemo(
        () =>
            voltageLevelIntervals
                .filter((interval) => interval.vlListValues.length > 0)
                .map((interval) => {
                    const isChecked = filteredNominalVoltages.some(
                        (voltageValue) => voltageValue >= interval.minValue && voltageValue < interval.maxValue
                    );
                    return (
                        <ListItem sx={sx.nominalVoltageItem} key={interval.name}>
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
                                    <Checkbox color="default" sx={sx.nominalVoltageCheck} checked={isChecked} />

                                    <ListItemText
                                        sx={sx.nominalVoltageText}
                                        disableTypography
                                        primary={<FormattedMessage id={interval.name} />}
                                    ></ListItemText>
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                }),
        [filteredNominalVoltages, handleToggle, voltageLevelIntervals, disabled, sx]
    );

    if (nominalVoltages.length <= 0) {
        return false;
    }
    return (
        <Paper sx={sx.root}>
            <List sx={sx.nominalVoltageZone}>
                <ListItem sx={sx.nominalVoltageItem}>
                    <ListItemButton role={undefined} dense onClick={handleToggleMaster} disabled={disabled}>
                        <Checkbox
                            color="default"
                            sx={sx.nominalVoltageCheck}
                            checked={allChecked}
                            indeterminate={!allChecked && !noneChecked}
                        />
                        <ListItemText
                            sx={sx.nominalVoltageText}
                            disableTypography
                            primary={<FormattedMessage id="CBAll" />}
                        />
                    </ListItemButton>
                </ListItem>
                <Divider component="li" variant="middle" />
                {nominalVoltagesList}
            </List>
        </Paper>
    );
}
