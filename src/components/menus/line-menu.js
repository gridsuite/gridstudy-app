/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useMemo } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PlayIcon from '@mui/icons-material/PlayArrow';
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined';
import EnergiseOneSideIcon from '@mui/icons-material/LastPage';
import EnergiseOtherSideIcon from '@mui/icons-material/FirstPage';
import { useIntl } from 'react-intl';
import { PARAM_USE_NAME } from '../../utils/config-params';
import { useSelector } from 'react-redux';
import {
    energiseLineEnd,
    lockoutLine,
    switchOnLine,
    tripLine,
} from '../../utils/rest-api';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { equipments } from '../network/network-equipments';
import { isNodeReadOnly, isNodeBuilt } from '../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../util/is-any-node-building-hook';
import { useParameterState } from '../dialogs/parameters/parameters';
import { getNameOrId } from '../diagrams/singleLineDiagram/utils';

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

const withLineMenu =
    (BaseMenu) =>
    ({
        id,
        position,
        handleClose,
        handleViewInSpreadsheet,
        currentNode,
        modificationInProgress,
        setModificationInProgress,
    }) => {
        const classes = useStyles();
        const intl = useIntl();
        const studyUuid = decodeURIComponent(useParams().studyUuid);

        const { snackInfo } = useSnackMessage();
        const [displayUseName] = useParameterState(PARAM_USE_NAME);
        const network = useSelector((state) => state.network);

        const isAnyNodeBuilding = useIsAnyNodeBuilding();

        const line = network.getLine(id);

        const isNodeEditable = useMemo(
            function () {
                return (
                    isNodeBuilt(currentNode) &&
                    !isNodeReadOnly(currentNode) &&
                    !isAnyNodeBuilding &&
                    !modificationInProgress
                );
            },
            [currentNode, isAnyNodeBuilding, modificationInProgress]
        );

        const getLineDescriptor = useCallback(
            (voltageLevelId) => {
                return displayUseName
                    ? getNameOrId(network.getVoltageLevel(voltageLevelId))
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
                    snackInfo({
                        messageTxt: utf8Decoder.decode(value.value),
                        headerId: messsageId,
                    });
                });
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(false);
            }
        }

        function handleLockout() {
            handleClose();
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(true);
            }
            lockoutLine(studyUuid, currentNode?.id, line.id).then(
                (response) => {
                    if (response.status !== 200) {
                        handleLineChangesResponse(
                            response,
                            'UnableToLockoutLine'
                        );
                    }
                }
            );
        }

        function handleTrip() {
            handleClose();
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(true);
            }
            tripLine(studyUuid, currentNode?.id, line.id).then((response) => {
                if (response.status !== 200) {
                    handleLineChangesResponse(response, 'UnableToTripLine');
                }
            });
        }

        function handleEnergise(side) {
            handleClose();
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(true);
            }
            energiseLineEnd(studyUuid, currentNode?.id, line.id, side).then(
                (response) => {
                    if (response.status !== 200) {
                        handleLineChangesResponse(
                            response,
                            'UnableToEnergiseLineEnd'
                        );
                    }
                }
            );
        }

        function handleSwitchOn() {
            handleClose();
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(true);
            }
            switchOnLine(studyUuid, currentNode?.id, line.id).then(
                (response) => {
                    if (response.status !== 200) {
                        handleLineChangesResponse(
                            response,
                            'UnableToSwitchOnLine'
                        );
                    }
                }
            );
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
                    disabled={
                        !isNodeEditable ||
                        line.branchStatus === 'PLANNED_OUTAGE'
                    }
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
                    disabled={
                        !isNodeEditable || line.branchStatus === 'FORCED_OUTAGE'
                    }
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
                    disabled={
                        !isNodeEditable ||
                        (line.terminal1Connected && !line.terminal2Connected)
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
                    disabled={
                        !isNodeEditable ||
                        (line.terminal2Connected && !line.terminal1Connected)
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
                    disabled={
                        !isNodeEditable ||
                        (line.terminal1Connected && line.terminal2Connected)
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
        );
    };

withLineMenu.propTypes = {
    line: PropTypes.object.isRequired,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleClose: PropTypes.func.isRequired,
    handleViewInSpreadsheet: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
};

export default withLineMenu;
