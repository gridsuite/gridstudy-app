/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ListItemIcon, ListItemText, Menu, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { FormattedMessage } from 'react-intl';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { isNodeBuilt, isNodeReadOnly } from 'components/graph/util/model-functions';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { convertToEquipmentType, EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../utils/equipment-types';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';
import { CustomMenuItem } from '../utils/custom-nested-menu';
import { useOptionalServiceStatus } from '../../hooks/use-optional-service-status';
import { OptionalServicesNames, OptionalServicesStatus } from '../utils/optional-services';
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined';
import { tripEquipment } from '../../services/study/network-modifications';
import { EquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { fetchNetworkElementInfos } from '../../services/study/network';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

interface BusMenuProps {
    busId: string;
    handleRunShortcircuitAnalysis: (busId: string) => void;
    onOpenDynamicSimulationEventDialog: (
        equipmentId: string,
        equipmentType: EquipmentType,
        dialogTitle: string
    ) => void;
    position: [number, number];
    onClose: () => void;
    setModificationInProgress: (progress: boolean) => void;
}

const styles = {
    menu: {
        minWidth: '300px',
        maxHeight: '800px',
        overflowY: 'visible',
    },
    menuItem: {
        // NestedMenu item manages only label prop of string type
        // It fix paddings itself then we must force this padding
        // to justify menu items texts
        paddingLeft: '12px',
    },
};

type EquipmentInfo = {
    id: string;
    name: string;
    operatingStatus: string;
};

export const BusMenu: FunctionComponent<BusMenuProps> = ({
    busId,
    handleRunShortcircuitAnalysis,
    onOpenDynamicSimulationEventDialog,
    position,
    onClose,
    setModificationInProgress,
}) => {
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);
    const { snackError } = useSnackMessage();
    const [equipmentInfos, setEquipmentInfos] = useState<EquipmentInfo>();

    // to check is node editable
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const isNodeEditable = useMemo(
        () => isNodeBuilt(currentNode) && !isNodeReadOnly(currentNode) && !isAnyNodeBuilding,
        [currentNode, isAnyNodeBuilding]
    );

    useEffect(() => {
        fetchNetworkElementInfos(
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            EQUIPMENT_TYPES.BUSBAR_SECTION,
            EQUIPMENT_INFOS_TYPES.OPERATING_STATUS.type,
            busId,
            false
        ).then((value: EquipmentInfo | null) => {
            if (value) {
                setEquipmentInfos(value);
            }
        });
    }, [studyUuid, currentRootNetworkUuid, currentNode?.id, busId]);

    const computationStarting = useSelector((state: AppState) => state.computationStarting);

    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);

    const oneBusShortcircuitAnalysisState = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );

    const handleClickRunShortcircuitAnalysis = useCallback(() => {
        onClose();
        handleRunShortcircuitAnalysis(busId);
    }, [busId, onClose, handleRunShortcircuitAnalysis]);

    const handleOpenDynamicSimulationEventDialog = useCallback(
        (equipmentId: string, equipmentType: EquipmentType, dialogTitle: string) => {
            onClose();
            onOpenDynamicSimulationEventDialog(equipmentId, equipmentType, dialogTitle);
        },
        [onClose, onOpenDynamicSimulationEventDialog]
    );

    const handleClickTrip = useCallback(() => {
        onClose();
        if (setModificationInProgress !== undefined) {
            setModificationInProgress(true);
        }
        const equipmentInfos = { id: busId };
        tripEquipment(studyUuid, currentNode?.id, equipmentInfos).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'UnableToTripBusbarSection',
            });
            if (setModificationInProgress !== undefined) {
                setModificationInProgress(false);
            }
        });
    }, [busId, currentNode?.id, studyUuid, onClose, setModificationInProgress, snackError]);

    return (
        <Menu
            sx={styles.menu}
            open={true}
            anchorReference="anchorPosition"
            anchorPosition={{
                top: position[1],
                left: position[0],
            }}
            onClose={onClose}
        >
            {shortCircuitAvailability === OptionalServicesStatus.Up && (
                <CustomMenuItem
                    sx={styles.menuItem}
                    onClick={handleClickRunShortcircuitAnalysis}
                    selected={false}
                    disabled={
                        computationStarting ||
                        oneBusShortcircuitAnalysisState === RunningStatus.RUNNING ||
                        !isNodeEditable
                    }
                >
                    <ListItemIcon>
                        <BoltIcon />
                    </ListItemIcon>

                    <ListItemText
                        primary={
                            <Typography noWrap>
                                <FormattedMessage id="ShortCircuitAnalysis" />
                            </Typography>
                        }
                    />
                </CustomMenuItem>
            )}
            {enableDeveloperMode && getEventType(EQUIPMENT_TYPES.BUS) && (
                <DynamicSimulationEventMenuItem
                    equipmentId={busId}
                    equipmentType={convertToEquipmentType(EQUIPMENT_TYPES.BUS)}
                    onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                    disabled={!isNodeEditable}
                />
            )}
            <CustomMenuItem
                sx={styles.menuItem}
                onClick={handleClickTrip}
                selected={false}
                disabled={!isNodeEditable || equipmentInfos?.operatingStatus === 'FORCED_OUTAGE'}
            >
                <ListItemIcon>
                    <OfflineBoltOutlinedIcon />
                </ListItemIcon>

                <ListItemText
                    primary={
                        <Typography noWrap>
                            <FormattedMessage id="TripBusbarSection" />
                        </Typography>
                    }
                />
            </CustomMenuItem>
        </Menu>
    );
};
