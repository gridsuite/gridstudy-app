/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { getNominalVoltageColor } from '../utils/colors';
import { useNameOrId } from './util/equipmentInfosHandler';

const useStyles = makeStyles(() => ({
    menu: {
        minWidth: 300,
        maxHeight: 800,
        overflowY: 'auto',
    },
    nominalVoltageItem: {
        padding: '0px',
        margin: '7px',
    },
    nominalVoltageButton: {
        borderRadius: 25,
        size: 'small',
        padding: '0px',
        margin: '7px',
        maxWidth: '40px',
        minWidth: '40px',
        maxHeight: '40px',
        minHeight: '40px',
        color: 'white',
    },
    nominalVoltageText: {
        fontSize: 12,
        padding: '8px',
    },
}));

const voltageLevelComparator = (vl1, vl2) => {
    return vl1.nominalVoltage < vl2.nominalVoltage;
};

const VoltageLevelChoice = ({
    handleClose,
    onClickHandler,
    substation,
    position,
}) => {
    const classes = useStyles();
    const { getNameOrId } = useNameOrId();

    return (
        <div className={classes.menu}>
            <Menu
                anchorReference="anchorPosition"
                anchorPosition={{
                    position: 'absolute',
                    top: position[1],
                    left: position[0],
                }}
                id="choice-vl-menu"
                open={true}
                onClose={handleClose}
            >
                {substation !== undefined &&
                    substation.voltageLevels
                        .sort(voltageLevelComparator)
                        .map((voltageLevel) => {
                            let color = getNominalVoltageColor(
                                voltageLevel.nominalVoltage
                            );
                            let colorString =
                                'rgb(' +
                                color[0].toString() +
                                ',' +
                                color[1].toString() +
                                ',' +
                                color[2].toString() +
                                ')';

                            return (
                                <MenuItem
                                    className={classes.nominalVoltageItem}
                                    id={voltageLevel.id}
                                    key={voltageLevel.id}
                                    onClick={() =>
                                        onClickHandler(voltageLevel.id)
                                    }
                                >
                                    <ListItemIcon>
                                        <Button
                                            className={
                                                classes.nominalVoltageButton
                                            }
                                            variant="contained"
                                            style={{
                                                backgroundColor: colorString,
                                            }}
                                        >
                                            {voltageLevel.nominalVoltage}
                                        </Button>
                                    </ListItemIcon>

                                    <ListItemText
                                        className={classes.nominalVoltageText}
                                        primary={
                                            <Typography noWrap>
                                                {getNameOrId(
                                                    voltageLevel?.name,
                                                    voltageLevel?.id
                                                )}
                                            </Typography>
                                        }
                                    />
                                </MenuItem>
                            );
                        })}
            </Menu>
        </div>
    );
};

export default VoltageLevelChoice;
