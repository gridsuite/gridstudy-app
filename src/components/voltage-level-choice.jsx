/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { getNominalVoltageColor } from '../utils/colors';
import { useNameOrId } from './utils/equipmentInfosHandler';
import { Box } from '@mui/material';

const styles = {
    menu: {
        minWidth: '300px',
        maxHeight: '800px',
        overflowY: 'auto',
    },
    nominalVoltageItem: {
        padding: '0px',
        margin: '7px',
    },
    nominalVoltageButton: {
        borderRadius: '25px',
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
};

const voltageLevelComparator = (vl1, vl2) => {
    return vl1.nominalV < vl2.nominalV;
};

const VoltageLevelChoice = ({ handleClose, onClickHandler, substation, position }) => {
    const { getNameOrId } = useNameOrId();

    return (
        <Box sx={styles.menu}>
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
                    substation.voltageLevels.sort(voltageLevelComparator).map((voltageLevel) => {
                        let color = getNominalVoltageColor(voltageLevel.nominalV);
                        let colorString =
                            'rgb(' + color[0].toString() + ',' + color[1].toString() + ',' + color[2].toString() + ')';

                        return (
                            <MenuItem
                                sx={styles.nominalVoltageItem}
                                id={voltageLevel.id}
                                key={voltageLevel.id}
                                onClick={() => onClickHandler(voltageLevel.id)}
                            >
                                <ListItemIcon>
                                    <Button
                                        sx={styles.nominalVoltageButton}
                                        variant="contained"
                                        style={{
                                            backgroundColor: colorString,
                                        }}
                                    >
                                        {voltageLevel.nominalV}
                                    </Button>
                                </ListItemIcon>

                                <ListItemText
                                    sx={styles.nominalVoltageText}
                                    primary={<Typography noWrap>{getNameOrId(voltageLevel)}</Typography>}
                                />
                            </MenuItem>
                        );
                    })}
            </Menu>
        </Box>
    );
};

export default VoltageLevelChoice;
