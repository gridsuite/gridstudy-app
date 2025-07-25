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
import { type FunctionComponent, type ReactElement, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { type AppState } from 'redux/reducer';
import { type EditableEquipmentType, SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';

export type UseEquipmentModificationProps = {
    equipmentType: SpreadsheetEquipmentType;
};

const EQUIPMENT_DIALOG_MAPPING: Readonly<Record<EditableEquipmentType, FunctionComponent<any>>> = {
    [SpreadsheetEquipmentType.SUBSTATION]: SubstationModificationDialog,
    [SpreadsheetEquipmentType.VOLTAGE_LEVEL]: VoltageLevelModificationDialog,
    [SpreadsheetEquipmentType.LINE]: LineModificationDialog,
    [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER]: TwoWindingsTransformerModificationDialog,
    [SpreadsheetEquipmentType.GENERATOR]: GeneratorModificationDialog,
    [SpreadsheetEquipmentType.LOAD]: LoadModificationDialog,
    [SpreadsheetEquipmentType.BATTERY]: BatteryModificationDialog,
    [SpreadsheetEquipmentType.SHUNT_COMPENSATOR]: ShuntCompensatorModificationDialog,
};

function isEditableEquipmentType(type: SpreadsheetEquipmentType): type is EditableEquipmentType {
    return type in EQUIPMENT_DIALOG_MAPPING;
}

export function useEquipmentModification({ equipmentType }: Readonly<UseEquipmentModificationProps>) {
    const [modificationDialog, setModificationDialog] = useState<ReactElement | null>(null);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const createDialogWithProps = useCallback(
        (Dialog: FunctionComponent<any>, equipmentId: string) => (
            <Dialog
                onClose={() => setModificationDialog(null)}
                currentNode={currentNode}
                studyUuid={studyUuid}
                currentRootNetworkUuid={currentRootNetworkUuid}
                editData={undefined}
                isUpdate={false}
                editDataFetchStatus={FetchStatus.IDLE}
                defaultIdValue={equipmentId}
            />
        ),
        [currentNode, studyUuid, currentRootNetworkUuid]
    );

    const getDialogForEquipment = useCallback(
        (equipmentId: string) => {
            if (!isEditableEquipmentType(equipmentType)) {
                return null;
            }
            return createDialogWithProps(EQUIPMENT_DIALOG_MAPPING[equipmentType], equipmentId);
        },
        [createDialogWithProps, equipmentType]
    );

    const handleOpenModificationDialog = useCallback(
        (equipmentId: string) => {
            setModificationDialog(getDialogForEquipment(equipmentId));
        },
        [getDialogForEquipment]
    );

    const isModificationDialogForEquipmentType = useMemo(() => isEditableEquipmentType(equipmentType), [equipmentType]);

    return { modificationDialog, handleOpenModificationDialog, isModificationDialogForEquipmentType };
}
