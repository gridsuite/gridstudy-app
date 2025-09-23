/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { EquipmentType, ExtendedEquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from '../components/utils/equipment-types';
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
    equipmentType: EQUIPMENT_TYPES;
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
        (id: string, type: EquipmentType | null, subtype: ExtendedEquipmentType | null) => {
            if (type) {
                const equipmentEnumType = EQUIPMENT_TYPES[type as keyof typeof EQUIPMENT_TYPES];
                setEquipmentToModify({
                    equipmentId: id,
                    equipmentType: equipmentEnumType,
                    equipmentSubtype: subtype,
                });
            }
        },
        []
    );

    const handleOpenDeletionDialog = useCallback((equipmentId: string, equipmentType: EQUIPMENT_TYPES) => {
        setEquipmentToDelete({ equipmentId, equipmentType });
    }, []);

    const handleOpenDynamicSimulationEventDialog = useCallback(
        (equipmentId: string, equipmentType: EquipmentType | null, dialogTitle: string) => {
            setDynamicSimulationEventDialogTitle(dialogTitle);
            setEquipmentToConfigDynamicSimulationEvent({
                equipmentId,
                equipmentType: EQUIPMENT_TYPES[equipmentType as keyof typeof EQUIPMENT_TYPES],
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
        (equipmentType: string, equipmentId: string) => {
            if (studyUuid) {
                deleteEquipment(studyUuid, currentNode?.id, equipmentType, equipmentId, undefined).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'UnableToDeleteEquipment',
                    });
                });
            }
        },
        [studyUuid, currentNode?.id, snackError]
    );

    const handleDeleteEquipment = useCallback(
        (equipmentType: EquipmentType | null, equipmentId: string) => {
            const equipmentEnumType = EQUIPMENT_TYPES[equipmentType as keyof typeof EQUIPMENT_TYPES];
            if (equipmentEnumType !== EQUIPMENT_TYPES.HVDC_LINE) {
                removeEquipment(equipmentEnumType, equipmentId);
            } else {
                // need a query to know the HVDC converters type (LCC vs VSC)
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode?.id,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.HVDC_LINE,
                    EQUIPMENT_INFOS_TYPES.MAP.type,
                    equipmentId,
                    false
                )
                    .then((hvdcInfos) => {
                        if (hvdcInfos?.hvdcType === 'LCC') {
                            // only hvdc line with LCC requires a Dialog (to select MCS)
                            handleOpenDeletionDialog(equipmentId, EQUIPMENT_TYPES.HVDC_LINE);
                        } else {
                            removeEquipment(equipmentEnumType, equipmentId);
                        }
                    })
                    .catch(() => {
                        snackError({
                            messageId: 'NetworkEquipmentNotFound',
                            messageValues: { equipmentId: equipmentId },
                        });
                    });
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
            case EQUIPMENT_TYPES.SUBSTATION:
                CurrentModificationDialog = SubstationModificationDialog;
                break;
            case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
                CurrentModificationDialog = VoltageLevelModificationDialog;
                break;
            case EQUIPMENT_TYPES.BATTERY:
                CurrentModificationDialog = BatteryModificationDialog;
                break;
            case EQUIPMENT_TYPES.GENERATOR:
                CurrentModificationDialog = GeneratorModificationDialog;
                break;
            case EQUIPMENT_TYPES.LOAD:
                CurrentModificationDialog = LoadModificationDialog;
                break;
            case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
                CurrentModificationDialog = TwoWindingsTransformerModificationDialog;
                break;
            case EQUIPMENT_TYPES.LINE:
                CurrentModificationDialog = LineModificationDialog;
                break;
            case EQUIPMENT_TYPES.HVDC_LINE:
                if (equipmentToModify?.equipmentSubtype === ExtendedEquipmentType.HVDC_LINE_LCC) {
                    CurrentModificationDialog = LccModificationDialog;
                } else if (equipmentToModify.equipmentSubtype === ExtendedEquipmentType.HVDC_LINE_VSC) {
                    CurrentModificationDialog = VscModificationDialog;
                } else {
                    return null;
                }
                break;
            case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
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

        if (equipmentToDelete.equipmentType === EQUIPMENT_TYPES.HVDC_LINE) {
            return (
                <EquipmentDeletionDialog
                    open={true}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    defaultIdValue={equipmentToDelete.equipmentId}
                    isUpdate={true}
                    onClose={closeDeletionDialog}
                    editData={undefined}
                    editDataFetchStatus={undefined}
                    equipmentType={undefined}
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
