/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FetchStatus } from '@gridsuite/commons-ui';
import BatteryModificationDialog from 'components/dialogs/network-modifications/battery/modification/battery-modification-dialog';
import GeneratorModificationDialog from 'components/dialogs/network-modifications/generator/modification/generator-modification-dialog';
import VscModificationDialog from 'components/dialogs/network-modifications/hvdc-line/vsc/modification/vsc-modification-dialog';
import LineModificationDialog from 'components/dialogs/network-modifications/line/modification/line-modification-dialog';
import LoadModificationDialog from 'components/dialogs/network-modifications/load/modification/load-modification-dialog';
import ShuntCompensatorModificationDialog from 'components/dialogs/network-modifications/shunt-compensator/modification/shunt-compensator-modification-dialog';
import SubstationModificationDialog from 'components/dialogs/network-modifications/substation/modification/substation-modification-dialog';
import TwoWindingsTransformerModificationDialog from 'components/dialogs/network-modifications/two-windings-transformer/modification/two-windings-transformer-modification-dialog';
import VoltageLevelModificationDialog from 'components/dialogs/network-modifications/voltage-level/modification/voltage-level-modification-dialog';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';

interface UseEquipmentModificationProps {
    studyUuid: string;
    tabIndex: number;
}

const EQUIPMENT_DIALOG_MAPPING: Record<string, React.FC<any>> = {
    Substations: SubstationModificationDialog,
    VoltageLevels: VoltageLevelModificationDialog,
    Lines: LineModificationDialog,
    TwoWindingsTransformers: TwoWindingsTransformerModificationDialog,
    Generators: GeneratorModificationDialog,
    Loads: LoadModificationDialog,
    Batteries: BatteryModificationDialog,
    ShuntCompensators: ShuntCompensatorModificationDialog,
    HvdcLines: VscModificationDialog,
};

export const useEquipmentModification = ({ studyUuid, tabIndex }: UseEquipmentModificationProps) => {
    const [modificationDialog, setModificationDialog] = useState<React.ReactElement | null>(null);

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const tablesNames = useSelector((state: AppState) => state.tables.names);

    const createDialogWithProps = useCallback(
        (Dialog: React.FC<any>, defaultIdValue?: string) => {
            return (
                <Dialog
                    onClose={() => setModificationDialog(null)}
                    onValidated={() => {}}
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                    editData={undefined}
                    isUpdate={false}
                    editDataFetchStatus={FetchStatus.IDLE}
                    defaultIdValue={defaultIdValue}
                />
            );
        },
        [currentNode, studyUuid]
    );

    const getDialogForEquipment = useCallback(
        (equipmentId: string) => {
            const tableName = tablesNames[tabIndex];
            const DialogComponent = EQUIPMENT_DIALOG_MAPPING[tableName];

            if (!DialogComponent) {
                return null;
            }

            return createDialogWithProps(DialogComponent, equipmentId);
        },
        [tabIndex, tablesNames, createDialogWithProps]
    );

    const handleOpenModificationDialog = useCallback(
        (equipmentId: string) => {
            setModificationDialog(getDialogForEquipment(equipmentId));
        },
        [getDialogForEquipment]
    );

    return { modificationDialog, handleOpenModificationDialog };
};
