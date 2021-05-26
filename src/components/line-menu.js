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
import { useSnackbar } from 'notistack';
import {
    energiseLineEnd,
    lockoutLine,
    switchOnLine,
    tripLine,
} from '../utils/rest-api';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

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

const LineMenu = ({ line, position, handleClose }) => {
    const classes = useStyles();
    const intl = useIntl();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { enqueueSnackbar } = useSnackbar();

    function handleLockout(lineId) {
        lockoutLine(studyUuid, lineId)
            .then((response) => {
                if (response.status === 304) {
                    enqueueSnackbar(
                        intl.formatMessage({ id: 'UnableToLockoutLine' }),
                        {
                            variant: 'info',
                            persist: false,
                            style: { whiteSpace: 'pre-line' },
                        }
                    );
                }
            })
            .then(handleClose);
    }

    function handleTrip(lineId) {
        tripLine(studyUuid, lineId)
            .then((response) => {
                if (response.status === 304) {
                    enqueueSnackbar(
                        intl.formatMessage({ id: 'UnableToTripLine' }),
                        {
                            variant: 'info',
                            persist: false,
                            style: { whiteSpace: 'pre-line' },
                        }
                    );
                }
            })
            .then(handleClose);
    }

    function handleEnergise(lineId, side) {
        energiseLineEnd(studyUuid, lineId, side)
            .then((response) => {
                if (response.status === 304) {
                    enqueueSnackbar(
                        intl.formatMessage({
                            id: 'UnableToEnergiseLineEnd',
                        }),
                        {
                            variant: 'info',
                            persist: false,
                            style: { whiteSpace: 'pre-line' },
                        }
                    );
                }
            })
            .then(handleClose);
    }

    function handleSwitchOn(lineId) {
        switchOnLine(studyUuid, lineId)
            .then((response) => {
                if (response.status === 304) {
                    enqueueSnackbar(
                        intl.formatMessage({ id: 'UnableToSwitchOnLine' }),
                        {
                            variant: 'info',
                            persist: false,
                            style: { whiteSpace: 'pre-line' },
                        }
                    );
                }
            })
            .then(handleClose);
    }

    return (
        <Menu
            className={classes.menu}
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
                selected={line.branchStatus === 'PLANNED_OUTAGE'}
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
                selected={line.branchStatus === 'FORCED_OUTAGE'}
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
                selected={line.terminal1Connected && !line.terminal2Connected}
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
                selected={line.terminal2Connected && !line.terminal1Connected}
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
                selected={line.terminal1Connected && line.terminal2Connected}
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
    );
};

LineMenu.propTypes = {
    line: PropTypes.object.isRequired,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleClose: PropTypes.func.isRequired,
};

export default LineMenu;
