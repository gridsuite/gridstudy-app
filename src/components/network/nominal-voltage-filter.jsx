/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import { ListItemButton } from '@mui/material';

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

const NominalVoltageFilter = ({ nominalVoltages, filteredNominalVoltages, onChange }) => {
    // Set up filteredNominalVoltages
    useEffect(() => {
        if (nominalVoltages && !filteredNominalVoltages) {
            onChange(nominalVoltages);
        }
    }, [nominalVoltages, filteredNominalVoltages, onChange]);

    const handleToggle = (vnoms, isToggle) => () => {
        // filter on nominal voltage
        let newFiltered = [...filteredNominalVoltages];
        if (isToggle) {
            vnoms.forEach((vnom) => {
                const currentIndex = filteredNominalVoltages.indexOf(vnom);
                if (currentIndex === -1) {
                    newFiltered.push(vnom);
                } else {
                    newFiltered.splice(currentIndex, 1);
                }
            });
        } else {
            newFiltered = [...vnoms];
        }
        onChange(newFiltered);
    };

    if (!nominalVoltages?.length > 0) {
        return false;
    }
    return (
        <Paper>
            <List sx={styles.nominalVoltageZone}>
                <ListItem sx={styles.nominalVoltageItem}>
                    <Button
                        size={'small'}
                        sx={styles.nominalVoltageSelectionControl}
                        onClick={handleToggle(nominalVoltages, false)}
                    >
                        <FormattedMessage id="CBAll" />
                    </Button>
                    <ListItemText sx={styles.nominalVoltageText} secondary={'/'} />
                    <Button size={'small'} sx={styles.nominalVoltageSelectionControl} onClick={handleToggle([], false)}>
                        <FormattedMessage id="CBNone" />
                    </Button>
                </ListItem>
                {nominalVoltages.map((value) => {
                    return (
                        <ListItem sx={styles.nominalVoltageItem} key={value}>
                            <ListItemButton
                                role={undefined}
                                dense
                                onClick={handleToggle([value], true)}
                                disabled={!filteredNominalVoltages}
                            >
                                <Checkbox
                                    color="default"
                                    sx={styles.nominalVoltageCheck}
                                    checked={!filteredNominalVoltages || filteredNominalVoltages.indexOf(value) !== -1}
                                />
                                <ListItemText
                                    sx={styles.nominalVoltageText}
                                    disableTypography
                                    primary={`${value} kV`}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
};

export default NominalVoltageFilter;
