/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import EditIcon from '@mui/icons-material/Edit';
import { useIntl } from 'react-intl';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import PropTypes from 'prop-types';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { isNodeBuilt, isNodeReadOnly } from '../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../utils/is-any-node-building-hook';
import { BRANCH_SIDE } from '../network/constants';
import { getFeederTypeFromEquipmentType } from 'components/diagrams/diagram-common';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../utils/equipment-types';
import {
    energiseBranchEnd,
    lockoutBranch,
    switchOnBranch,
    tripBranch,
} from '../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../services/study/network';

const styles = {
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

const withBranchMenu =
    (BaseMenu) =>
    ({
        equipment,
        equipmentType,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
        currentNode,
        studyUuid,
        modificationInProgress,
        setModificationInProgress,
    }) => {
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
                case EQUIPMENT_TYPES.LINE:
                    return 'Line';
                case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
                    return '2WTransformer';
                default:
                    break;
            }
        }, []);

        const getRealEquipmentType = useCallback((equipmentType) => {
            switch (equipmentType) {
                case EQUIPMENT_TYPES.LINE:
                    return EQUIPMENT_TYPES.LINE;
                case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
                    return EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER;
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
                equipment.id,
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
            equipment.id,
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
            lockoutBranch(studyUuid, currentNode?.id, branch).catch((error) => {
                handleError(error, 'UnableToLockout');
            });
        }

        function handleTrip() {
            startModification();
            tripBranch(studyUuid, currentNode?.id, branch).catch((error) => {
                handleError(error, 'UnableToTrip');
            });
        }

        function handleEnergise(side) {
            startModification();
            energiseBranchEnd(studyUuid, currentNode?.id, branch, side).catch(
                (error) => {
                    handleError(error, 'UnableToEnergiseOnOneEnd');
                }
            );
        }

        function handleSwitchOn() {
            startModification();
            switchOnBranch(studyUuid, currentNode?.id, branch).catch(
                (error) => {
                    handleError(error, 'UnableToSwitchOn');
                }
            );
        }

        return (
            <Menu
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
                    equipment={equipment}
                    equipmentType={equipmentType}
                    handleViewInSpreadsheet={handleViewInSpreadsheet}
                    handleDeleteEquipment={handleDeleteEquipment}
                    handleOpenModificationDialog={handleOpenModificationDialog}
                />
                {(equipmentType === EQUIPMENT_TYPES.LINE ||
                    equipmentType ===
                        EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER) && (
                    <MenuItem
                        sx={styles.menuItem}
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
                    sx={styles.menuItem}
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
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({
                                    id: getTranslationKey('Trip'),
                                })}
                            </Typography>
                        }
                    />
                </MenuItem>
                {equipmentType === EQUIPMENT_TYPES.LINE && (
                    <MenuItem
                        sx={styles.menuItem}
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
                {equipmentType === EQUIPMENT_TYPES.LINE && (
                    <MenuItem
                        sx={styles.menuItem}
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
                {equipmentType === EQUIPMENT_TYPES.LINE && (
                    <MenuItem
                        sx={styles.menuItem}
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
                <MenuItem
                    sx={styles.menuItem}
                    onClick={() =>
                        handleDeleteEquipment(
                            getFeederTypeFromEquipmentType(equipmentType),
                            equipment.id
                        )
                    }
                    disabled={!isNodeEditable}
                >
                    <ListItemIcon>
                        <DeleteIcon />
                    </ListItemIcon>

                    <ListItemText
                        primary={
                            <Typography noWrap>
                                {intl.formatMessage({
                                    id: 'DeleteFromMenu',
                                })}
                            </Typography>
                        }
                    />
                </MenuItem>
                {(equipmentType === EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER ||
                    equipmentType === EQUIPMENT_TYPES.LINE) && (
                    <MenuItem
                        sx={styles.menuItem}
                        onClick={() =>
                            handleOpenModificationDialog(
                                equipment.id,
                                equipmentType
                            )
                        }
                        disabled={!isNodeEditable}
                    >
                        <ListItemIcon>
                            <EditIcon />
                        </ListItemIcon>

                        <ListItemText
                            primary={
                                <Typography noWrap>
                                    {intl.formatMessage({
                                        id: 'ModifyFromMenu',
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
    handleOpenModificationDialog: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    modificationInProgress: PropTypes.func,
    setModificationInProgress: PropTypes.func,
};

export default withBranchMenu;
