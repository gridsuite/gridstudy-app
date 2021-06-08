/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import TableChartIcon from '@material-ui/icons/TableChart';

import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    menuItem: {
        padding: '0px',
        margin: '7px',
    },
    listItemText: {
        fontSize: 12,
        padding: '0px',
        margin: '4px',
    },
}));

const EquipmentMenu = ({ equipment, handleViewInSpreadsheet }) => {
    const classes = useStyles();
    const intl = useIntl();

    return (
        <>
            <MenuItem
                className={classes.menuItem}
                onClick={() => handleViewInSpreadsheet(equipment.id)}
                selected={false}
            >
                <ListItemIcon>
                    <TableChartIcon />
                </ListItemIcon>

                <ListItemText
                    className={classes.listItemText}
                    primary={
                        <Typography noWrap>
                            {intl.formatMessage({ id: 'ViewOnSpreadsheet' })}
                        </Typography>
                    }
                />
            </MenuItem>
        </>
    );
};

export default EquipmentMenu;
