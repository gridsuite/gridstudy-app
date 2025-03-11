/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { EquipmentInfos, EquipmentType, OperatingStatus, useSnackMessage } from '@gridsuite/commons-ui';
import { isNodeBuilt, isNodeReadOnly } from '../graph/util/model-functions';
import { useIsAnyNodeBuilding } from '../utils/is-any-node-building-hook';
import { BRANCH_SIDE } from '../network/constants';
import { EQUIPMENT_INFOS_TYPES } from '../utils/equipment-types';
import {
    energiseEquipmentEnd,
    lockoutEquipment,
    switchOnEquipment,
    tripEquipment,
} from '../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../services/study/network';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import { EQUIPMENT_TYPE_LABEL_KEYS } from '../graph/util/model-constants';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';
import { CustomMenuItem } from '../utils/custom-nested-menu';
import { BaseEquipmentMenuProps, MapEquipment } from './base-equipment-menu';
import { CurrentTreeNode } from 'redux/reducer';
import { getCommonEquipmentType } from 'components/diagrams/diagram-common';
import { UUID } from 'crypto';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

const styles = {
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};
export type MenuBranchProps = {
    equipment: MapEquipment;
    equipmentType: EquipmentType;
    position: [number, number] | null;
    handleClose: () => void;
    handleViewInSpreadsheet: (type: EquipmentType, id: string) => void;
    handleDeleteEquipment: (type: EquipmentType | null, id: string) => void;
    handleOpenModificationDialog: (id: string, type: EquipmentType | null) => void;
    onOpenDynamicSimulationEventDialog?: (id: string, type: EquipmentType | null, dialogTitle: string) => void;
    currentNode?: CurrentTreeNode;
    studyUuid?: UUID;
    currentRootNetworkUuid?: UUID | null;
    modificationInProgress?: boolean;
    setModificationInProgress?: (progress: boolean) => void;
};
type BranchSide = (typeof BRANCH_SIDE)[keyof typeof BRANCH_SIDE];

const withOperatingStatusMenu =
    (BaseMenu: React.ComponentType<BaseEquipmentMenuProps>) =>
    ({
        equipment,
        equipmentType,
        position,
        handleClose,
        handleViewInSpreadsheet,
        handleDeleteEquipment,
        handleOpenModificationDialog,
        onOpenDynamicSimulationEventDialog,
        currentNode,
        studyUuid,
        currentRootNetworkUuid,
        modificationInProgress,
        setModificationInProgress,
    }: MenuBranchProps) => {
        const intl = useIntl();
        const { snackError } = useSnackMessage();
        const isAnyNodeBuilding = useIsAnyNodeBuilding();
        const { getNameOrId } = useNameOrId();
        const [equipmentInfos, setEquipmentInfos] = useState<EquipmentInfos | null>(null);

        const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

        const getTranslationKey = (key: string) => {
            if (equipmentType) {
                return key.concat(EQUIPMENT_TYPE_LABEL_KEYS[equipmentType]);
            }
        };

        useEffect(() => {
            if (equipment?.id) {
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    equipmentType,
                    EQUIPMENT_INFOS_TYPES.OPERATING_STATUS.type,
                    equipment.id,
                    false
                ).then((value) => {
                    if (value) {
                        setEquipmentInfos(value);
                    }
                });
            }
        }, [studyUuid, currentNode?.id, currentRootNetworkUuid, equipmentType, equipment?.id]);

        const isNodeEditable = useMemo(
            function () {
                if (currentNode) {
                    return (
                        equipmentInfos &&
                        isNodeBuilt(currentNode) &&
                        !isNodeReadOnly(currentNode) &&
                        !isAnyNodeBuilding &&
                        !modificationInProgress
                    );
                }
            },
            [equipmentInfos, currentNode, isAnyNodeBuilding, modificationInProgress]
        );

        function handleError(error: Error, translationKey: string) {
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
            lockoutEquipment(studyUuid, currentNode?.id, equipmentInfos).catch((error) => {
                handleError(error, 'UnableToLockout');
            });
        }

        function handleTrip() {
            startModification();
            tripEquipment(studyUuid, currentNode?.id, equipmentInfos).catch((error) => {
                handleError(error, 'UnableToTrip');
            });
        }

        function handleEnergise(side: BranchSide) {
            startModification();
            energiseEquipmentEnd(studyUuid, currentNode?.id, equipmentInfos, side).catch((error) => {
                handleError(error, 'UnableToEnergiseOnOneEnd');
            });
        }

        function handleSwitchOn() {
            startModification();
            switchOnEquipment(studyUuid, currentNode?.id, equipmentInfos).catch((error) => {
                handleError(error, 'UnableToSwitchOn');
            });
        }

        const handleOpenDynamicSimulationEventDialog = useCallback(
            (equipmentId: string, equipmentType: EquipmentType, dialogTitle: string) => {
                if (onOpenDynamicSimulationEventDialog) {
                    handleClose();
                    onOpenDynamicSimulationEventDialog(equipmentId, equipmentType, dialogTitle);
                }
            },
            [handleClose, onOpenDynamicSimulationEventDialog]
        );

        return (
            equipmentType && (
                <Menu
                    anchorReference="anchorPosition"
                    anchorPosition={position ? { top: position[1], left: position[0] } : undefined}
                    id="operating-status-menu"
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
                    {[
                        EquipmentType.LINE,
                        EquipmentType.TWO_WINDINGS_TRANSFORMER,
                        EquipmentType.THREE_WINDINGS_TRANSFORMER,
                        EquipmentType.HVDC_LINE,
                    ].includes(equipmentType) && (
                        <CustomMenuItem
                            sx={styles.menuItem}
                            onClick={() => handleLockout()}
                            disabled={
                                !isNodeEditable || equipmentInfos?.operatingStatus === OperatingStatus.PLANNED_OUTAGE
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
                        onClick={handleTrip}
                        disabled={!isNodeEditable || equipmentInfos?.operatingStatus === OperatingStatus.FORCED_OUTAGE}
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
                            onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                            disabled={
                                !isNodeEditable || equipmentInfos?.operatingStatus === OperatingStatus.FORCED_OUTAGE
                            }
                        />
                    )}
                    {equipmentType === EquipmentType.LINE && (
                        <CustomMenuItem
                            sx={styles.menuItem}
                            onClick={() => handleEnergise(BRANCH_SIDE.ONE)}
                            disabled={
                                !isNodeEditable ||
                                (equipmentInfos?.terminal1Connected && !equipmentInfos?.terminal2Connected)
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
                                                id: getTranslationKey('EnergiseOnOneEnd'),
                                            },
                                            {
                                                substation: getNameOrId({
                                                    name: equipmentInfos?.voltageLevelName1,
                                                    id: equipmentInfos?.voltageLevelId1 ?? '',
                                                }),
                                            }
                                        )}
                                    </Typography>
                                }
                            />
                        </CustomMenuItem>
                    )}
                    {equipmentType === EquipmentType.LINE && (
                        <CustomMenuItem
                            sx={styles.menuItem}
                            onClick={() => handleEnergise(BRANCH_SIDE.TWO)}
                            disabled={
                                !isNodeEditable ||
                                (equipmentInfos?.terminal2Connected && !equipmentInfos?.terminal1Connected)
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
                                                id: getTranslationKey('EnergiseOnOneEnd'),
                                            },
                                            {
                                                substation: getNameOrId({
                                                    name: equipmentInfos?.voltageLevelName2,
                                                    id: equipmentInfos?.voltageLevelId2 ?? '',
                                                }),
                                            }
                                        )}
                                    </Typography>
                                }
                            />
                        </CustomMenuItem>
                    )}
                    {equipmentType === EquipmentType.LINE && (
                        <CustomMenuItem
                            sx={styles.menuItem}
                            onClick={() => handleSwitchOn()}
                            disabled={
                                !isNodeEditable ||
                                (equipmentInfos?.terminal1Connected && equipmentInfos?.terminal2Connected)
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
                        onClick={() => handleDeleteEquipment(getCommonEquipmentType(equipmentType), equipment.id)}
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
                    {(equipmentType === EquipmentType.TWO_WINDINGS_TRANSFORMER ||
                        equipmentType === EquipmentType.LINE) && (
                        <CustomMenuItem
                            sx={styles.menuItem}
                            onClick={() => handleOpenModificationDialog(equipment.id, equipmentType)}
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
            )
        );
    };

export default withOperatingStatusMenu;
