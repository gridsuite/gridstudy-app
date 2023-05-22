/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import { useIntl } from 'react-intl';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import {
    energiseBranchEnd,
    fetchNetworkElementInfos,
    lockoutBranch,
    switchOnBranch,
    tripBranch,
} from '../../utils/rest-api';
import PropTypes from 'prop-types';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { isNodeReadOnly, isNodeBuilt } from '../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../utils/is-any-node-building-hook';
import { BRANCH_SIDE } from '../network/constants';
import { getFeederTypeFromEquipmentType } from 'components/diagrams/diagram-common';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';

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
        handleDeleteEquipment,
        currentNode,
        studyUuid,
        modificationInProgress,
        setModificationInProgress,
    }) => {
        const classes = useStyles();
        const intl = useIntl();
        const { snackError } = useSnackMessage();
        const isAnyNodeBuilding = useIsAnyNodeBuilding();
        const { getNameOrId } = useNameOrId();
        const [branch, setBranch] = useState(null);

        const getTranslationKey = (key) => {
            return key.concat(getEquipmentTranslation(equipmentType));
        };

        const getEquipmentTranslation = useCallback((equipmentType) => {
            switch (equipmentType) {
                case EQUIPMENT_TYPES.LINE.name:
                    return 'Line';
                case EQUIPMENT_TYPES.HVDC_LINE.name:
                    return 'HvdcLine';
                case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.name:
                    return '2WTransformer';
                default:
                    break;
            }
        }, []);

        const getRealEquipmentType = useCallback((equipmentType) => {
            switch (equipmentType) {
                case EQUIPMENT_TYPES.LINE.name:
                    return EQUIPMENT_TYPES.LINE.type;
                case EQUIPMENT_TYPES.HVDC_LINE.name:
                    return EQUIPMENT_TYPES.HVDC_LINE.type;
                case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.name:
                    return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type;
                default:
                    break;
            }
        }, []);
        useEffect(() => {
            fetchNetworkElementInfos(
                studyUuid,
                currentNode?.id,
                getRealEquipmentType(equipmentType),
                EQUIPMENT_INFOS_TYPES.LIST.type,
                id,
                false
            ).then((value) => {
                if (value) {
                    setBranch(value);
                }
            });
        }, [
            studyUuid,
            currentNode?.id,
            equipmentType,
            id,
            getRealEquipmentType,
        ]);

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
                    handleDeleteEquipment={handleDeleteEquipment}
                />
                {equipmentType === EQUIPMENT_TYPES.LINE.name && (
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
                {equipmentType !== EQUIPMENT_TYPES.HVDC_LINE.name && (
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
                )}
                {equipmentType === EQUIPMENT_TYPES.LINE.name && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() => handleEnergise(BRANCH_SIDE.ONE)}
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
                                            substation: getNameOrId({
                                                name: branch?.voltageLevelName1,
                                                id: branch?.voltageLevelId1,
                                            }),
                                        }
                                    )}
                                </Typography>
                            }
                        />
                    </MenuItem>
                )}
                {equipmentType === EQUIPMENT_TYPES.LINE.name && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() => handleEnergise(BRANCH_SIDE.TWO)}
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
                                            substation: getNameOrId({
                                                name: branch?.voltageLevelName2,
                                                id: branch?.voltageLevelId2,
                                            }),
                                        }
                                    )}
                                </Typography>
                            }
                        />
                    </MenuItem>
                )}
                {equipmentType === EQUIPMENT_TYPES.LINE.name && (
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
                {equipmentType !== EQUIPMENT_TYPES.HVDC_LINE.name && (
                    <MenuItem
                        className={classes.menuItem}
                        onClick={() =>
                            handleDeleteEquipment(
                                getFeederTypeFromEquipmentType(equipmentType),
                                id
                            )
                        }
                        disabled={!isNodeEditable}
                    >
                        <ListItemIcon>
                            <DeleteIcon />
                        </ListItemIcon>

                        <ListItemText
                            className={classes.listItemText}
                            primary={
                                <Typography noWrap>
                                    {intl.formatMessage({
                                        id: 'DeleteFromMenu',
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
    handleDeleteEquipment: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    modificationInProgress: PropTypes.func,
    setModificationInProgress: PropTypes.func,
};

export default withBranchMenu;
