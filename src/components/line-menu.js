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

const LineMenu = ({
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
                id="line-menu"
                open={true}
                onClose={handleClose}
            >
                <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleLockout(line.id)}
                    selected={line.status === 'PLANNED_OUTAGE'}
                >
                    <ListItemIcon>
                        <LockOutlinedIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({ id: 'LockoutLine' })}
                            </Typography>
                        }
                    />
                </MenuItem>

                <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleTrip(line.id)}
                    selected={line.status === 'FORCED_OUTAGE'}
                >
                    <ListItemIcon>
                        <OfflineBoltOutlinedIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({ id: 'TripLine' })}
                            </Typography>
                        }
                    />
                </MenuItem>

                <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleEnergise(line.id, 'ONE')}
                    selected={
                        line.terminal1Connected && !line.terminal2Connected
                    }
                >
                    <ListItemIcon>
                        <EnergiseOneSideIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage(
                                    { id: 'EnergiseOnOneEnd' },
                                    { substation: line.voltageLevelId1 }
                                )}
                            </Typography>
                        }
                    />
                </MenuItem>

                <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleEnergise(line.id, 'TWO')}
                    selected={
                        line.terminal2Connected && !line.terminal1Connected
                    }
                >
                    <ListItemIcon>
                        <EnergiseOtherSideIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage(
                                    { id: 'EnergiseOnOneEnd' },
                                    { substation: line.voltageLevelId2 }
                                )}
                            </Typography>
                        }
                    />
                </MenuItem>

                <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleSwitchOn(line.id)}
                    selected={
                        line.terminal1Connected && line.terminal2Connected
                    }
                >
                    <ListItemIcon>
                        <PlayIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({ id: 'SwitchOnLine' })}
                            </Typography>
                        }
                    />
                </MenuItem>
            </Menu>
        </div>
    );
};

export default LineMenu;
