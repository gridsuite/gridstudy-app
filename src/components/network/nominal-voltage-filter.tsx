/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { Button, Checkbox, List, ListItem, ListItemButton, ListItemText, Paper } from '@mui/material';
import { FormattedMessage } from 'react-intl';

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
};

export type NominalVoltageFilterProps = {
    nominalVoltages: number[];
    filteredNominalVoltages: number[];
    onChange: (filteredNominalVoltages: number[]) => void;
};

export default function NominalVoltageFilter({
    nominalVoltages,
    filteredNominalVoltages,
    onChange,
}: Readonly<NominalVoltageFilterProps>) {
    const handleToggle = useCallback(
        (vnoms: number[], isToggle = false) => {
            let newFiltered: number[];
            if (isToggle) {
                // we "inverse" the selection for vnoms values
                newFiltered = [...filteredNominalVoltages];
                vnoms.forEach((vnom) => {
                    const currentIndex = filteredNominalVoltages.indexOf(vnom);
                    if (currentIndex === -1) {
                        newFiltered.push(vnom); //not previously present, we add it
                    } else {
                        newFiltered.splice(currentIndex, 1); // previously present, we remove it
                    }
                });
            } else {
                // it's just the new selection
                newFiltered = [...vnoms];
            }
            onChange(newFiltered);
        },
        [filteredNominalVoltages, onChange]
    );
    const handleSelectAll = useCallback(() => handleToggle(nominalVoltages), [handleToggle, nominalVoltages]);
    const handleSelectNone = useCallback(() => handleToggle([]), [handleToggle]);

    const nominalVoltagesList = useMemo(
        () =>
            nominalVoltages.map((value) => (
                <ListItem sx={styles.nominalVoltageItem} key={value}>
                    <ListItemButton
                        role={undefined}
                        dense
                        onClick={() => handleToggle([value], true)}
                        disabled={!filteredNominalVoltages}
                    >
                        <Checkbox
                            color="default"
                            sx={styles.nominalVoltageCheck}
                            checked={!filteredNominalVoltages || filteredNominalVoltages.indexOf(value) !== -1}
                        />
                        <ListItemText sx={styles.nominalVoltageText} disableTypography primary={`${value} kV`} />
                    </ListItemButton>
                </ListItem>
            )),
        [filteredNominalVoltages, handleToggle, nominalVoltages]
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
