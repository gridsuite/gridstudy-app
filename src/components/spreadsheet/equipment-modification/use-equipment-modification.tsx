/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FetchStatus } from '@gridsuite/commons-ui';
import BatteryModificationDialog from 'components/dialogs/network-modifications/battery/modification/battery-modification-dialog';
import GeneratorModificationDialog from 'components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import LineModificationDialog from 'components/dialogs/network-modifications/line/modification/line-modification-dialog';
import LoadModificationDialog from 'components/dialogs/network-modifications/load/modification/load-modification-dialog';
import ShuntCompensatorModificationDialog from 'components/dialogs/network-modifications/shunt-compensator/modification/shunt-compensator-modification-dialog';
import SubstationModificationDialog from 'components/dialogs/network-modifications/substation/modification/substation-modification-dialog';
import TwoWindingsTransformerModificationDialog from 'components/dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import VoltageLevelModificationDialog from 'components/dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { SpreadsheetEquipmentType } from '../config/spreadsheet.type';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

interface UseEquipmentModificationProps {
    equipmentType: SpreadsheetEquipmentType;
}

type EditableEquipmentType = Exclude<
    SpreadsheetEquipmentType,
    | EQUIPMENT_TYPES.TIE_LINE
    | EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER
    | EQUIPMENT_TYPES.BUS
    | EQUIPMENT_TYPES.BUSBAR_SECTION
    | EQUIPMENT_TYPES.DANGLING_LINE
    | EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR
    | EQUIPMENT_TYPES.VSC_CONVERTER_STATION
    | EQUIPMENT_TYPES.LCC_CONVERTER_STATION
    | EQUIPMENT_TYPES.HVDC_LINE
>;

const EQUIPMENT_DIALOG_MAPPING: Record<EditableEquipmentType, React.FC<any>> = {
    [EQUIPMENT_TYPES.SUBSTATION]: SubstationModificationDialog,
    [EQUIPMENT_TYPES.VOLTAGE_LEVEL]: VoltageLevelModificationDialog,
    [EQUIPMENT_TYPES.LINE]: LineModificationDialog,
    [EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER]: TwoWindingsTransformerModificationDialog,
    [EQUIPMENT_TYPES.GENERATOR]: GeneratorModificationDialog,
    [EQUIPMENT_TYPES.LOAD]: LoadModificationDialog,
    [EQUIPMENT_TYPES.BATTERY]: BatteryModificationDialog,
    [EQUIPMENT_TYPES.SHUNT_COMPENSATOR]: ShuntCompensatorModificationDialog,
};

export const useEquipmentModification = ({ equipmentType }: UseEquipmentModificationProps) => {
    const [modificationDialog, setModificationDialog] = useState<React.ReactElement | null>(null);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const createDialogWithProps = useCallback(
        (Dialog: React.FC<any>, equipmentId: string) => {
            return (
                <Dialog
                    onClose={() => setModificationDialog(null)}
                    onValidated={() => {}}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    editData={undefined}
                    isUpdate={false}
                    editDataFetchStatus={FetchStatus.IDLE}
                    defaultIdValue={equipmentId}
                />
            );
        },
        [currentNode, studyUuid, currentRootNetworkUuid]
    );

    const getDialogForEquipment = useCallback(
        (equipmentId: string) => {
            const DialogComponent = EQUIPMENT_DIALOG_MAPPING[equipmentType as EditableEquipmentType];

            if (!DialogComponent) {
                return null;
            }

            return createDialogWithProps(DialogComponent, equipmentId);
        },
        [createDialogWithProps, equipmentType]
    );

    const handleOpenModificationDialog = useCallback(
        (equipmentId: string) => {
            setModificationDialog(getDialogForEquipment(equipmentId));
        },
        [getDialogForEquipment]
    );

    const isModificationDialogForEquipmentType = useCallback(() => {
        const DialogComponent = EQUIPMENT_DIALOG_MAPPING[equipmentType as EditableEquipmentType];
        return DialogComponent !== undefined;
    }, [equipmentType]);

    return { modificationDialog, handleOpenModificationDialog, isModificationDialogForEquipmentType };
};
