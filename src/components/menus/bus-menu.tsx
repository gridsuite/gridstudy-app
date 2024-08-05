/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ListItemIcon, ListItemText, Menu, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { FormattedMessage } from 'react-intl';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import {
    isNodeBuilt,
    isNodeReadOnly,
} from 'components/graph/util/model-functions';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useIsAnyNodeBuilding } from 'components/utils/is-any-node-building-hook';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import { useParameterState } from '../dialogs/parameters/parameters';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { EQUIPMENT_TYPES } from '../utils/equipment-types';
import { getEventType } from '../dialogs/dynamicsimulation/event/model/event.model';
import DynamicSimulationEventMenuItem from './dynamic-simulation/dynamic-simulation-event-menu-item';
import { CustomMenuItem } from '../utils/custom-nested-menu';

interface BusMenuProps {
    busId: string;
    handleRunShortcircuitAnalysis: (busId: string) => void;
    onOpenDynamicSimulationEventDialog: (
        equipmentId: string,
        equipmentType: string,
        dialogTitle: string
    ) => void;
    position: [number, number];
    onClose: () => void;
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

export const BusMenu: FunctionComponent<BusMenuProps> = ({
    busId,
    handleRunShortcircuitAnalysis,
    onOpenDynamicSimulationEventDialog,
    position,
    onClose,
}) => {
    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    // to check is node editable
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isAnyNodeBuilding = useIsAnyNodeBuilding();
    const isNodeEditable = useMemo(
        () =>
            isNodeBuilt(currentNode) &&
            !isNodeReadOnly(currentNode) &&
            !isAnyNodeBuilding,
        [currentNode, isAnyNodeBuilding]
    );

    const computationStarting = useSelector(
        (state: AppState) => state.computationStarting
    );

    const oneBusShortcircuitAnalysisState = useSelector(
        (state: AppState) =>
            state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );

    const handleClickRunShortcircuitAnalysis = useCallback(() => {
        onClose();
        handleRunShortcircuitAnalysis(busId);
    }, [busId, onClose, handleRunShortcircuitAnalysis]);

    const handleOpenDynamicSimulationEventDialog = useCallback(
        (equipmentId: string, equipmentType: string, dialogTitle: string) => {
            onClose();
            onOpenDynamicSimulationEventDialog(
                equipmentId,
                equipmentType,
                dialogTitle
            );
        },
        [onClose, onOpenDynamicSimulationEventDialog]
    );

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
            {enableDeveloperMode && getEventType(EQUIPMENT_TYPES.BUS) && (
                <DynamicSimulationEventMenuItem
                    equipmentId={busId}
                    equipmentType={EQUIPMENT_TYPES.BUS}
                    onOpenDynamicSimulationEventDialog={
                        handleOpenDynamicSimulationEventDialog
                    }
                    disabled={!isNodeEditable}
                />
            )}
        </Menu>
    );
};
