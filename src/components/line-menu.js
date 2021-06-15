/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
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
import { useParameterState } from './parameters';
import { PARAM_USE_NAME } from '../utils/config-params';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import {
    energiseLineEnd,
    lockoutLine,
    switchOnLine,
    tripLine,
} from '../utils/rest-api';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { displayInfoMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { equipments } from './network/network-equipments';

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

const withLineMenu = (BaseMenu) => ({
    id,
    position,
    handleClose,
    handleViewInSpreadsheet,
}) => {
    const classes = useStyles();
    const intl = useIntl();
    const intlRef = useIntlRef();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { enqueueSnackbar } = useSnackbar();
    const [displayUseName] = useParameterState(PARAM_USE_NAME);
    const network = useSelector((state) => state.network);

    const line = network.getLine(id);

    const getLineDescriptor = useCallback(
        (voltageLevelId) => {
            return displayUseName
                ? network.getVoltageLevel(voltageLevelId).name
                : voltageLevelId;
        },
        [displayUseName, network]
    );

    function handleLineChangesResponse(response, messsageId) {
        const utf8Decoder = new TextDecoder('utf-8');
        response.body
            .getReader()
            .read()
            .then((value) => {
                displayInfoMessageWithSnackbar({
                    errorMessage: utf8Decoder.decode(value.value),
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: messsageId,
                        intlRef: intlRef,
                    },
                });
            });
    }

    function handleLockout() {
        if (line.branchStatus === 'PLANNED_OUTAGE') return;
        handleClose();
        lockoutLine(studyUuid, line.id).then((response) => {
            if (response.status !== 200) {
                handleLineChangesResponse(response, 'UnableToLockoutLine');
            }
        });
    }

    function handleTrip() {
        if (line.branchStatus === 'FORCED_OUTAGE') return;
        handleClose();
        tripLine(studyUuid, line.id).then((response) => {
            if (response.status !== 200) {
                handleLineChangesResponse(response, 'UnableToTripLine');
            }
        });
    }

    function handleEnergise(side) {
        if (
            (side === 'ONE' &&
                line.terminal1Connected &&
                !line.terminal2Connected) ||
            (side === 'TWO' &&
                line.terminal2Connected &&
                !line.terminal1Connected)
        )
            return;
        handleClose();
        energiseLineEnd(studyUuid, line.id, side).then((response) => {
            if (response.status !== 200) {
                handleLineChangesResponse(response, 'UnableToEnergiseLineEnd');
            }
        });
    }

    function handleSwitchOn() {
        if (line.terminal1Connected && line.terminal2Connected) return;
        handleClose();
        switchOnLine(studyUuid, line.id).then((response) => {
            if (response.status !== 200) {
                handleLineChangesResponse(response, 'UnableToSwitchOnLine');
            }
        });
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
            <BaseMenu
                equipmentId={id}
                equipmentType={equipments.lines}
                handleViewInSpreadsheet={handleViewInSpreadsheet}
            />

            <MenuItem
                className={classes.menuItem}
                onClick={() => handleLockout()}
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
                onClick={() => handleTrip()}
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
                onClick={() => handleEnergise('ONE')}
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
                                {
                                    substation: getLineDescriptor(
                                        line.voltageLevelId1
                                    ),
                                }
                            )}
                        </Typography>
                    }
                />
            </MenuItem>

            <MenuItem
                className={classes.menuItem}
                onClick={() => handleEnergise('TWO')}
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
                                {
                                    substation: getLineDescriptor(
                                        line.voltageLevelId2
                                    ),
                                }
                            )}
                        </Typography>
                    }
                />
            </MenuItem>

            <MenuItem
                className={classes.menuItem}
                onClick={() => handleSwitchOn()}
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

withLineMenu.propTypes = {
    line: PropTypes.object.isRequired,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleClose: PropTypes.func.isRequired,
    handleViewInSpreadsheet: PropTypes.func.isRequired,
};

export default withLineMenu;
