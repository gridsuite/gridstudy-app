/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { useDispatch, useSelector } from 'react-redux';
import { filteredNominalVoltagesUpdated } from '../../redux/actions';

const useStyles = makeStyles((theme) => ({
    nominalVoltageZone: {
        minWidth: 90,
        maxHeight: 300,
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
}));

const NominalVoltageFilter = (props) => {
    const [substationsLoaded, setSubstationsLoaded] = useState(false);
    const network = useSelector((state) => state.network);

    const filteredNominalVoltages = useSelector(
        (state) => state.filteredNominalVoltages
    );

    const dispatch = useDispatch();

    const classes = useStyles();

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
        dispatch(filteredNominalVoltagesUpdated(newFiltered));
    };

    useEffect(() => {
        if (network.substations.values === undefined) {
            if (substationsLoaded) setSubstationsLoaded(false);
            network.substations.getOrFetch(() => setSubstationsLoaded(true));
        }
    }, [substationsLoaded, network.substations]);

    return (
        substationsLoaded && (
            <Paper>
                <List className={classes.nominalVoltageZone}>
                    <ListItem className={classes.nominalVoltageItem}>
                        <Button
                            size={'small'}
                            variant={'text'}
                            className={classes.nominalVoltageSelectionControl}
                            onClick={handleToggle(
                                network.getNominalVoltages(),
                                false
                            )}
                        >
                            <FormattedMessage id="CBAll" />
                        </Button>
                        <ListItemText
                            className={classes.nominalVoltageText}
                            secondary={'/'}
                        />
                        <Button
                            size={'small'}
                            variant={'text'}
                            className={classes.nominalVoltageSelectionControl}
                            onClick={handleToggle([], false)}
                        >
                            <FormattedMessage id="CBNone" />
                        </Button>
                    </ListItem>
                    {network.getNominalVoltages().map((value) => {
                        return (
                            <ListItem
                                className={classes.nominalVoltageItem}
                                key={value}
                                button
                                onClick={handleToggle([value], true)}
                            >
                                <Checkbox
                                    color="default"
                                    className={classes.nominalVoltageCheck}
                                    checked={
                                        !filteredNominalVoltages ||
                                        filteredNominalVoltages.indexOf(
                                            value
                                        ) !== -1
                                    }
                                />
                                <ListItemText
                                    className={classes.nominalVoltageText}
                                    disableTypography
                                    primary={`${value} kV`}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        )
    );
};

export default NominalVoltageFilter;
