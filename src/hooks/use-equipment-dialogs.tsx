/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import {
    EquipmentType,
    ExtendedEquipmentType,
    HvdcType,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_INFOS_TYPES } from '../components/utils/equipment-types';
import { deleteEquipment } from '../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../services/study/network';
import { CurrentTreeNode } from '../components/graph/tree-node.type';
import type { UUID } from 'node:crypto';

import BatteryModificationDialog from '../components/dialogs/network-modifications/battery/modification/battery-modification-dialog';
import GeneratorModificationDialog from '../components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import LoadModificationDialog from '../components/dialogs/network-modifications/load/modification/load-modification-dialog';
import TwoWindingsTransformerModificationDialog from '../components/dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import LineModificationDialog from '../components/dialogs/network-modifications/line/modification/line-modification-dialog';
import ShuntCompensatorModificationDialog from '../components/dialogs/network-modifications/shunt-compensator/modification/shunt-compensator-modification-dialog';
import EquipmentDeletionDialog from '../components/dialogs/network-modifications/equipment-deletion/equipment-deletion-dialog';
import { DynamicSimulationEventDialog } from '../components/dialogs/dynamicsimulation/event/dynamic-simulation-event-dialog';
import SubstationModificationDialog from 'components/dialogs/network-modifications/substation/modification/substation-modification-dialog';
import VoltageLevelModificationDialog from 'components/dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import VscModificationDialog from '../components/dialogs/network-modifications/hvdc-line/vsc/modification/vsc-modification-dialog';
import { LccModificationDialog } from '../components/dialogs/network-modifications/hvdc-line/lcc/modification/lcc-modification-dialog';

type EquipmentToModify = {
    equipmentId: string;
    equipmentType: EquipmentType;
    equipmentSubtype?: ExtendedEquipmentType | null;
};

interface UseEquipmentDialogsProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export const useEquipmentDialogs = ({ studyUuid, currentNode, currentRootNetworkUuid }: UseEquipmentDialogsProps) => {
    const { snackError } = useSnackMessage();

    // States
    const [equipmentToModify, setEquipmentToModify] = useState<EquipmentToModify>();
    const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentToModify>();
    const [equipmentToConfigDynamicSimulationEvent, setEquipmentToConfigDynamicSimulationEvent] =
        useState<EquipmentToModify>();
    const [dynamicSimulationEventDialogTitle, setDynamicSimulationEventDialogTitle] = useState('');

    // Handlers
    const handleOpenModificationDialog = useCallback(
        (id: string, type: EquipmentType, subtype: ExtendedEquipmentType | null) => {
            if (type) {
                setEquipmentToModify({
                    equipmentId: id,
                    equipmentType: type,
                    equipmentSubtype: subtype,
                });
            }
        },
        []
    );

    const handleOpenDeletionDialog = useCallback((equipmentId: string, equipmentType: EquipmentType) => {
        setEquipmentToDelete({ equipmentId, equipmentType });
    }, []);

    const handleOpenDynamicSimulationEventDialog = useCallback(
        (equipmentId: string, equipmentType: EquipmentType, dialogTitle: string) => {
            setDynamicSimulationEventDialogTitle(dialogTitle);
            setEquipmentToConfigDynamicSimulationEvent({
                equipmentId,
                equipmentType: equipmentType,
            });
        },
        []
    );

    // Close handlers
    const closeModificationDialog = useCallback(() => {
        setEquipmentToModify(undefined);
    }, []);

    const closeDeletionDialog = useCallback(() => {
        setEquipmentToDelete(undefined);
    }, []);

    const handleCloseDynamicSimulationEventDialog = useCallback(() => {
        setEquipmentToConfigDynamicSimulationEvent(undefined);
    }, []);

    const removeEquipment = useCallback(
        (equipmentType: EquipmentType, equipmentId: string) => {
            if (studyUuid) {
                deleteEquipment({
                    studyUuid,
                    nodeUuid: currentNode?.id,
                    equipmentId: equipmentId as UUID,
                    equipmentType,
                }).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'UnableToDeleteEquipment' });
                });
            }
        },
        [studyUuid, currentNode?.id, snackError]
    );

    const handleDeleteEquipment = useCallback(
        (equipmentType: EquipmentType, equipmentId: string) => {
            if (equipmentType === EquipmentType.HVDC_LINE) {
                // need a query to know the HVDC converters type (LCC vs VSC)
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    EquipmentType.HVDC_LINE,
                    EQUIPMENT_INFOS_TYPES.MAP.type,
                    equipmentId,
                    false
                )
                    .then((hvdcInfos) => {
                        if (hvdcInfos?.hvdcType === HvdcType.LCC) {
                            // only hvdc line with LCC requires a Dialog (to select MCS)
                            handleOpenDeletionDialog(equipmentId, EquipmentType.HVDC_LINE);
                        } else {
                            removeEquipment(equipmentType, equipmentId);
                        }
                    })
                    .catch(() => {
                        snackError({
                            messageId: 'NetworkEquipmentNotFound',
                            messageValues: { equipmentId: equipmentId },
                        });
                    });
            } else {
                removeEquipment(equipmentType, equipmentId);
            }
        },
        [studyUuid, currentNode?.id, currentRootNetworkUuid, snackError, handleOpenDeletionDialog, removeEquipment]
    );

    // Dialog renderers
    const renderModificationDialog = useCallback(() => {
        if (!equipmentToModify) {
            return null;
        }

        let CurrentModificationDialog;
        switch (equipmentToModify.equipmentType) {
            case EquipmentType.SUBSTATION:
                CurrentModificationDialog = SubstationModificationDialog;
                break;
            case EquipmentType.VOLTAGE_LEVEL:
                CurrentModificationDialog = VoltageLevelModificationDialog;
                break;
            case EquipmentType.BATTERY:
                CurrentModificationDialog = BatteryModificationDialog;
                break;
            case EquipmentType.GENERATOR:
                CurrentModificationDialog = GeneratorModificationDialog;
                break;
            case EquipmentType.LOAD:
                CurrentModificationDialog = LoadModificationDialog;
                break;
            case EquipmentType.TWO_WINDINGS_TRANSFORMER:
                CurrentModificationDialog = TwoWindingsTransformerModificationDialog;
                break;
            case EquipmentType.LINE:
                CurrentModificationDialog = LineModificationDialog;
                break;
            case EquipmentType.HVDC_LINE:
                if (equipmentToModify?.equipmentSubtype === ExtendedEquipmentType.HVDC_LINE_LCC) {
                    CurrentModificationDialog = LccModificationDialog;
                } else if (equipmentToModify.equipmentSubtype === ExtendedEquipmentType.HVDC_LINE_VSC) {
                    CurrentModificationDialog = VscModificationDialog;
                } else {
                    return null;
                }
                break;
            case EquipmentType.SHUNT_COMPENSATOR:
                CurrentModificationDialog = ShuntCompensatorModificationDialog;
                break;
            default:
                return null;
        }

        return (
            currentNode &&
            currentRootNetworkUuid && (
                <CurrentModificationDialog
                    open={true}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    defaultIdValue={equipmentToModify.equipmentId}
                    isUpdate={true}
                    onClose={closeModificationDialog}
                    editData={undefined}
                    editDataFetchStatus={undefined}
                />
            )
        );
    }, [equipmentToModify, currentNode, currentRootNetworkUuid, studyUuid, closeModificationDialog]);

    const renderDeletionDialog = useCallback(() => {
        if (!equipmentToDelete) {
            return null;
        }

        if (equipmentToDelete.equipmentType === EquipmentType.HVDC_LINE) {
            return (
                <EquipmentDeletionDialog
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    defaultIdValue={equipmentToDelete.equipmentId as UUID}
                    isUpdate={true}
                    onClose={closeDeletionDialog}
                    editData={undefined}
                    editDataFetchStatus={undefined}
                    equipmentType={equipmentToDelete.equipmentType}
                />
            );
        } else {
            return null;
        }
    }, [equipmentToDelete, studyUuid, currentNode, currentRootNetworkUuid, closeDeletionDialog]);

    const renderDynamicSimulationEventDialog = useCallback(() => {
        if (!equipmentToConfigDynamicSimulationEvent) {
            return null;
        }

        return (
            <DynamicSimulationEventDialog
                equipmentId={equipmentToConfigDynamicSimulationEvent.equipmentId}
                equipmentType={equipmentToConfigDynamicSimulationEvent.equipmentType}
                onClose={handleCloseDynamicSimulationEventDialog}
                title={dynamicSimulationEventDialogTitle}
            />
        );
    }, [
        equipmentToConfigDynamicSimulationEvent,
        dynamicSimulationEventDialogTitle,
        handleCloseDynamicSimulationEventDialog,
    ]);

    return {
        handleOpenModificationDialog,
        handleOpenDeletionDialog,
        handleOpenDynamicSimulationEventDialog,

        handleDeleteEquipment,
        // Dialog renderers
        renderModificationDialog,
        renderDeletionDialog,
        renderDynamicSimulationEventDialog,
    };
};

export default useEquipmentDialogs;
