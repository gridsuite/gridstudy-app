/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import Menu from '@mui/material/Menu';

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
    energiseOperationalEquipmentEnd,
    lockoutOperationalEquipment,
    switchOnOperationalEquipment,
    tripOperationalEquipment,
} from '../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../services/study/network';
import { useParameterState } from '../dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../graph/util/model-constants';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';
import { CustomMenuItem } from '../utils/custom-nested-menu';

const styles = {
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

const withOperationalEquipmentMenu =
    (BaseMenu) =>
    ({
        equipment,
        equipmentType,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
        handleOpenDynamicSimulationEventDialog,
        currentNode,
        studyUuid,
        modificationInProgress,
        setModificationInProgress,
    }) => {
        const intl = useIntl();
        const { snackError } = useSnackMessage();
        const isAnyNodeBuilding = useIsAnyNodeBuilding();
        const { getNameOrId } = useNameOrId();
        const [operationalEquipment, setOperationalEquipment] = useState(null);

        const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

        const getTranslationKey = (key) => {
            return key.concat(EQUIPMENT_TYPE_LABEL_KEYS[equipmentType]);
        };

        useEffect(() => {
            fetchNetworkElementInfos(
                studyUuid,
                currentNode?.id,
                equipmentType,
                EQUIPMENT_INFOS_TYPES.LIST.type,
                equipment.id,
                false
            ).then((value) => {
                if (value) {
                    setOperationalEquipment(value);
                }
            });
        }, [studyUuid, currentNode?.id, equipmentType, equipment.id]);

        const isNodeEditable = useMemo(
            function () {
                return (
                    operationalEquipment &&
                    isNodeBuilt(currentNode) &&
                    !isNodeReadOnly(currentNode) &&
                    !isAnyNodeBuilding &&
                    !modificationInProgress
                );
            },
            [
                operationalEquipment,
                currentNode,
                isAnyNodeBuilding,
                modificationInProgress,
            ]
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
            lockoutOperationalEquipment(
                studyUuid,
                currentNode?.id,
                operationalEquipment
            ).catch((error) => {
                handleError(error, 'UnableToLockout');
            });
        }

        function handleTrip() {
            startModification();
            tripOperationalEquipment(
                studyUuid,
                currentNode?.id,
                operationalEquipment
            ).catch((error) => {
                handleError(error, 'UnableToTrip');
            });
        }

        function handleEnergise(side) {
            startModification();
            energiseOperationalEquipmentEnd(
                studyUuid,
                currentNode?.id,
                operationalEquipment,
                side
            ).catch((error) => {
                handleError(error, 'UnableToEnergiseOnOneEnd');
            });
        }

        function handleSwitchOn() {
            startModification();
            switchOnOperationalEquipment(
                studyUuid,
                currentNode?.id,
                operationalEquipment
            ).catch((error) => {
                handleError(error, 'UnableToSwitchOn');
            });
        }

        return (
            <Menu
                anchorReference="anchorPosition"
                anchorPosition={{
                    position: 'absolute',
                    top: position[1],
                    left: position[0],
                }}
                id="operationalEquipment-menu"
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
                    <CustomMenuItem
                        sx={styles.menuItem}
                        onClick={() => handleLockout()}
                        disabled={
                            !isNodeEditable ||
                            operationalEquipment.operationalStatus ===
                                'PLANNED_OUTAGE'
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
                    </CustomMenuItem>
                )}
                <CustomMenuItem
                    sx={styles.menuItem}
                    onClick={() => handleTrip()}
                    disabled={
                        !isNodeEditable ||
                        operationalEquipment.operationalStatus ===
                            'FORCED_OUTAGE'
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
                </CustomMenuItem>
                {enableDeveloperMode && getEventType(equipmentType) && (
                    <DynamicSimulationEventMenuItem
                        equipmentId={equipment.id}
                        equipmentType={equipmentType}
                        handleOpenDynamicSimulationEventDialog={
                            handleOpenDynamicSimulationEventDialog
                        }
                        disabled={
                            !isNodeEditable ||
                            operationalEquipment.operationalStatus ===
                                'FORCED_OUTAGE'
                        }
                    />
                )}
                {equipmentType === EQUIPMENT_TYPES.LINE && (
                    <CustomMenuItem
                        sx={styles.menuItem}
                        onClick={() => handleEnergise(BRANCH_SIDE.ONE)}
                        disabled={
                            !isNodeEditable ||
                            (operationalEquipment.terminal1Connected &&
                                !operationalEquipment.terminal2Connected)
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
                                                name: operationalEquipment?.voltageLevelName1,
                                                id: operationalEquipment?.voltageLevelId1,
                                            }),
                                        }
                                    )}
                                </Typography>
                            }
                        />
                    </CustomMenuItem>
                )}
                {equipmentType === EQUIPMENT_TYPES.LINE && (
                    <CustomMenuItem
                        sx={styles.menuItem}
                        onClick={() => handleEnergise(BRANCH_SIDE.TWO)}
                        disabled={
                            !isNodeEditable ||
                            (operationalEquipment.terminal2Connected &&
                                !operationalEquipment.terminal1Connected)
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
                                                name: operationalEquipment?.voltageLevelName2,
                                                id: operationalEquipment?.voltageLevelId2,
                                            }),
                                        }
                                    )}
                                </Typography>
                            }
                        />
                    </CustomMenuItem>
                )}
                {equipmentType === EQUIPMENT_TYPES.LINE && (
                    <CustomMenuItem
                        sx={styles.menuItem}
                        onClick={() => handleSwitchOn()}
                        disabled={
                            !isNodeEditable ||
                            (operationalEquipment.terminal1Connected &&
                                operationalEquipment.terminal2Connected)
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
                    </CustomMenuItem>
                )}
                <CustomMenuItem
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
                </CustomMenuItem>
                {(equipmentType === EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER ||
                    equipmentType === EQUIPMENT_TYPES.LINE) && (
                    <CustomMenuItem
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
                    </CustomMenuItem>
                )}
            </Menu>
        );
    };

withOperationalEquipmentMenu.propTypes = {
    id: PropTypes.string.isRequired,
    equipmentType: PropTypes.string.isRequired,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleClose: PropTypes.func.isRequired,
    handleViewInSpreadsheet: PropTypes.func.isRequired,
    handleDeleteEquipment: PropTypes.func.isRequired,
    handleOpenModificationDialog: PropTypes.func.isRequired,
    handleOpenDynamicSimulationEventDialog: PropTypes.func.isRequired,
    currentNode: PropTypes.object,
    studyUuid: PropTypes.string.isRequired,
    modificationInProgress: PropTypes.func,
    setModificationInProgress: PropTypes.func,
};

export default withOperationalEquipmentMenu;
