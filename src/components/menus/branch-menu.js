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
import { useSelector } from 'react-redux';
import {
    energiseBranchEnd,
    lockoutBranch,
    switchOnBranch,
    tripBranch,
} from '../../utils/rest-api';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { equipments } from '../network/network-equipments';
import { isNodeReadOnly, isNodeBuilt } from '../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../util/is-any-node-building-hook';
import { useNameOrId } from '../util/equipmentInfosHandler';

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

const withBranchMenu =
    (BaseMenu) =>
    ({
        id,
        equipmentType,
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
        const { snackError } = useSnackMessage();
        const network = useSelector((state) => state.network);
        const isAnyNodeBuilding = useIsAnyNodeBuilding();
        const { getNameOrId } = useNameOrId();

        const branch =
            equipmentType === equipments.twoWindingsTransformers
                ? network.getTwoWindingsTransformer(id)
                : network.getLine(id);

        const getTranslationKey = (key) => {
            return key.concat(
                equipmentType === equipments.lines ? 'Line' : '2WTransformer'
            );
        };

        const isNodeEditable = useMemo(
            function () {
                return (
                    branch &&
                    isNodeBuilt(currentNode) &&
                    !isNodeReadOnly(currentNode) &&
                    !isAnyNodeBuilding &&
                    !modificationInProgress
                );
            },
            [branch, currentNode, isAnyNodeBuilding, modificationInProgress]
        );

        const getVoltageLevelLabel = useCallback(
            (voltageLevelId) => {
                return getNameOrId({
                    name: network.getVoltageLevel(voltageLevelId)?.name,
                    id: voltageLevelId,
                });
            },
            [network, getNameOrId]
        );

        function handleError(error, translationKey) {
            snackError({
                messageTxt: error.message,
                headerId: getTranslationKey(translationKey),
            });
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(false);
            }
        }

        function startModification() {
            handleClose();
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(true);
            }
        }

        function handleLockout() {
            startModification();
            lockoutBranch(studyUuid, currentNode?.id, branch.id).catch(
                (error) => {
                    handleError(error, 'UnableToLockout');
                }
            );
        }

        function handleTrip() {
            startModification();
            tripBranch(studyUuid, currentNode?.id, branch.id).catch((error) => {
                handleError(error, 'UnableToTrip');
            });
        }

        function handleEnergise(side) {
            startModification();
            energiseBranchEnd(
                studyUuid,
                currentNode?.id,
                branch.id,
                side
            ).catch((error) => {
                handleError(error, 'UnableToEnergiseOnOneEnd');
            });
        }

        function handleSwitchOn() {
            startModification();
            switchOnBranch(studyUuid, currentNode?.id, branch.id).catch(
                (error) => {
                    handleError(error, 'UnableToSwitchOn');
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
                id="branch-menu"
                open={true}
                onClose={handleClose}
            >
                <BaseMenu
                    equipmentId={id}
                    equipmentType={equipmentType}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                />
                {equipmentType === equipments.lines && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() => handleLockout()}
                        disabled={
                            !isNodeEditable ||
                            branch.branchStatus === 'PLANNED_OUTAGE'
                        }
                    >
                        <ListItemIcon>
                            <LockOutlinedIcon />
                        </ListItemIcon>

                        <ListItemText
                            className={classes.listItemText}
                            primary={
                                <Typography noWrap>
                                    {intl.formatMessage({
                                        id: getTranslationKey('Lockout'),
                                    })}
                                </Typography>
                            }
                        />
                    </MenuItem>
                )}
                <MenuItem
                    className={classes.menuItem}
                    onClick={() => handleTrip()}
                    disabled={
                        !isNodeEditable ||
                        branch.branchStatus === 'FORCED_OUTAGE'
                    }
                >
                    <ListItemIcon>
                        <OfflineBoltOutlinedIcon />
                    </ListItemIcon>

                    <ListItemText
                        className={classes.listItemText}
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({
                                    id: getTranslationKey('Trip'),
                                })}
                            </Typography>
                        }
                    />
                </MenuItem>
                {equipmentType === equipments.lines && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() => handleEnergise('ONE')}
                        disabled={
                            !isNodeEditable ||
                            (branch.terminal1Connected &&
                                !branch.terminal2Connected)
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
                                        {
                                            id: getTranslationKey(
                                                'EnergiseOnOneEnd'
                                            ),
                                        },
                                        {
                                            substation: getVoltageLevelLabel(
                                                branch.voltageLevelId1
                                            ),
                                        }
                                    )}
                                </Typography>
                            }
                        />
                    </MenuItem>
                )}
                {equipmentType === equipments.lines && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() => handleEnergise('TWO')}
                        disabled={
                            !isNodeEditable ||
                            (branch.terminal2Connected &&
                                !branch.terminal1Connected)
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
                                        {
                                            id: getTranslationKey(
                                                'EnergiseOnOneEnd'
                                            ),
                                        },
                                        {
                                            substation: getVoltageLevelLabel(
                                                branch.voltageLevelId2
                                            ),
                                        }
                                    )}
                                </Typography>
                            }
                        />
                    </MenuItem>
                )}
                {equipmentType === equipments.lines && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() => handleSwitchOn()}
                        disabled={
                            !isNodeEditable ||
                            (branch.terminal1Connected &&
                                branch.terminal2Connected)
                        }
                    >
                        <ListItemIcon>
                            <PlayIcon />
                        </ListItemIcon>

                        <ListItemText
                            className={classes.listItemText}
                            primary={
                                <Typography noWrap>
                                    {intl.formatMessage({
                                        id: getTranslationKey('SwitchOn'),
                                    })}
                                </Typography>
                            }
                        />
                    </MenuItem>
                )}
            </Menu>
        );
    };

withBranchMenu.propTypes = {
    id: PropTypes.string.isRequired,
    equipmentType: PropTypes.string.isRequired,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleClose: PropTypes.func.isRequired,
    handleViewInSpreadsheet: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    modificationInProgress: PropTypes.func,
    setModificationInProgress: PropTypes.func,
};

export default withBranchMenu;
