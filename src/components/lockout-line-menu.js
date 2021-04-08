/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import PlayIcon from '@material-ui/icons/PlayArrow';
import OfflineBoltOutlinedIcon from '@material-ui/icons/OfflineBoltOutlined';
import EnergiseOneSideIcon from '@material-ui/icons/LastPage';
import EnergiseOtherSideIcon from '@material-ui/icons/FirstPage';
import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    menu: {
        minWidth: 300,
        maxHeight: 800,
        overflowY: 'auto',
    },
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

const CommandItem = ({ message, icon, line, handleClick }) => {
    const classes = useStyles();
    return (
        <MenuItem
            className={classes.menuItem}
            id={line.id}
            key={line.id}
            onClick={() => handleClick(line.id)}
        >
            <ListItemIcon>{icon}</ListItemIcon>

            <ListItemText
                className={classes.listItemText}
                primary={<Typography noWrap>{message}</Typography>}
            />
        </MenuItem>
    );
};

const LockoutLine = ({
    line,
    position,
    handleClose,
    handleLockout,
    handleTrip,
    handleEnergise,
    handleSwitchOn,
}) => {
    const classes = useStyles();
    const intl = useIntl();

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
                <CommandItem
                    line={line}
                    icon={<LockOutlinedIcon />}
                    message={intl.formatMessage({ id: 'LockoutLine' })}
                    handleClick={handleLockout}
                />
                <CommandItem
                    line={line}
                    icon={<OfflineBoltOutlinedIcon />}
                    message={intl.formatMessage({ id: 'TripLine' })}
                    handleClick={handleTrip}
                />
                <CommandItem
                    line={line}
                    icon={<EnergiseOneSideIcon />}
                    message={intl.formatMessage(
                        { id: 'EnergiseOnOneEnd' },
                        { substation: line.voltageLevelId1 }
                    )}
                    handleClick={(lineId) => handleEnergise(lineId, 'ONE')}
                />
                <CommandItem
                    line={line}
                    icon={<EnergiseOtherSideIcon />}
                    message={intl.formatMessage(
                        { id: 'EnergiseOnOneEnd' },
                        { substation: line.voltageLevelId2 }
                    )}
                    handleClick={(lineId) => handleEnergise(lineId, 'TWO')}
                />
                <CommandItem
                    line={line}
                    icon={<PlayIcon />}
                    message={intl.formatMessage({ id: 'SwitchOnLine' })}
                    handleClick={handleSwitchOn}
                />
            </Menu>
        </div>
    );
};

export default LockoutLine;
