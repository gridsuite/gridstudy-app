/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useCallback, useMemo, FunctionComponent } from 'react';
import { EquipmentType, ExtendedEquipmentType } from '@gridsuite/commons-ui';
import withOperatingStatusMenu, { MenuBranchProps } from '../components/menus/operating-status-menu';
import BaseEquipmentMenu, { MapEquipment as BaseEquipment } from '../components/menus/base-equipment-menu';
import withEquipmentMenu from '../components/menus/equipment-menu';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import type { UUID } from 'node:crypto';

type EquipmentMenuProps = {
    position?: [number, number] | null;
    equipment?: BaseEquipment;
    equipmentType?: EquipmentType;
    equipmentSubtype?: ExtendedEquipmentType | null;
    display: boolean;
};

type MenuProps = {
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    equipmentType: EquipmentType;
    modificationInProgress?: boolean;
    setModificationInProgress?: (inProgress: boolean) => void;
};

interface UseEquipmentMenuProps {
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    studyUuid: UUID;
    disabled: boolean;
    onViewInSpreadsheet: (equipmentType: EquipmentType, equipmentId: string) => void;
    onDeleteEquipment: (equipmentType: EquipmentType, equipmentId: string) => void;
    onOpenModificationDialog: (id: string, type: EquipmentType, subtype: ExtendedEquipmentType | null) => void;
    onOpenDynamicSimulationEventDialog?: (
        equipmentId: string,
        equipmentType: EquipmentType,
        dialogTitle: string
    ) => void;
    modificationInProgress?: boolean;
    setModificationInProgress?: (inProgress: boolean) => void;
}

export const useEquipmentMenu = ({
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    disabled,
    onViewInSpreadsheet,
    onDeleteEquipment,
    onOpenModificationDialog,
    onOpenDynamicSimulationEventDialog,
    modificationInProgress,
    setModificationInProgress,
}: UseEquipmentMenuProps) => {
    const [equipmentMenu, setEquipmentMenu] = useState<EquipmentMenuProps>();

    const {
        MenuBranch,
        MenuSubstation,
        MenuVoltageLevel,
        MenuLoad,
        MenuBattery,
        MenuDanglingLine,
        MenuGenerator,
        MenuStaticVarCompensator,
        MenuShuntCompensator,
        MenuLccConverterStation,
        MenuVscConverterStation,
    } = useMemo(
        () => ({
            MenuBranch: withOperatingStatusMenu(BaseEquipmentMenu),
            MenuSubstation: withEquipmentMenu(BaseEquipmentMenu, EquipmentType.SUBSTATION, null, 'substation-menus'),
            MenuVoltageLevel: withEquipmentMenu(
                BaseEquipmentMenu,
                EquipmentType.VOLTAGE_LEVEL,
                null,
                'voltage-level-menus'
            ),
            MenuLoad: withEquipmentMenu(BaseEquipmentMenu, EquipmentType.LOAD, null, 'load-menus'),
            MenuBattery: withEquipmentMenu(BaseEquipmentMenu, EquipmentType.BATTERY, null, 'battery-menus'),
            MenuDanglingLine: withEquipmentMenu(
                BaseEquipmentMenu,
                EquipmentType.DANGLING_LINE,
                null,
                'dangling-line-menus'
            ),
            MenuGenerator: withEquipmentMenu(BaseEquipmentMenu, EquipmentType.GENERATOR, null, 'generator-menus'),
            MenuStaticVarCompensator: withEquipmentMenu(
                BaseEquipmentMenu,
                EquipmentType.STATIC_VAR_COMPENSATOR,
                null,
                'static-var-compensator-menus'
            ),
            MenuShuntCompensator: withEquipmentMenu(
                BaseEquipmentMenu,
                EquipmentType.SHUNT_COMPENSATOR,
                null,
                'shunt-compensator-menus'
            ),
            MenuLccConverterStation: withEquipmentMenu(
                BaseEquipmentMenu,
                EquipmentType.LCC_CONVERTER_STATION,
                null,
                'lcc-converter-station-menus'
            ),
            MenuVscConverterStation: withEquipmentMenu(
                BaseEquipmentMenu,
                EquipmentType.VSC_CONVERTER_STATION,
                null,
                'vsc-converter-station-menus'
            ),
        }),
        []
    );

    const openEquipmentMenu = useCallback(
        (
            equipment: BaseEquipment,
            x: number,
            y: number,
            type: EquipmentType,
            subtype: ExtendedEquipmentType | null
        ) => {
            setEquipmentMenu({
                position: [x, y],
                equipment: equipment,
                equipmentType: type,
                equipmentSubtype: subtype,
                display: true,
            });
        },
        []
    );

    const closeEquipmentMenu = useCallback(() => {
        setEquipmentMenu({ display: false });
    }, []);

    const handleViewInSpreadsheet = useCallback(
        (equipmentType: EquipmentType, equipmentId: string) => {
            onViewInSpreadsheet(equipmentType, equipmentId);
            closeEquipmentMenu();
        },
        [onViewInSpreadsheet, closeEquipmentMenu]
    );

    const handleDeleteEquipment = useCallback(
        (equipmentType: EquipmentType, equipmentId: string) => {
            onDeleteEquipment(equipmentType, equipmentId);
            closeEquipmentMenu();
        },
        [onDeleteEquipment, closeEquipmentMenu]
    );

    const handleOpenModificationDialog = useCallback(
        (id: string, type: EquipmentType, subtype: ExtendedEquipmentType | null) => {
            onOpenModificationDialog(id, type, subtype);
            closeEquipmentMenu();
        },
        [onOpenModificationDialog, closeEquipmentMenu]
    );

    const handleOpenDynamicSimulationEventDialog = useCallback(
        (equipmentId: string, equipmentType: EquipmentType, dialogTitle: string) => {
            if (onOpenDynamicSimulationEventDialog) {
                onOpenDynamicSimulationEventDialog(equipmentId, equipmentType, dialogTitle);
            }
            closeEquipmentMenu();
        },
        [onOpenDynamicSimulationEventDialog, closeEquipmentMenu]
    );

    const withEquipment = useCallback(
        (Menu: FunctionComponent<MenuBranchProps>, props: MenuProps | null) => {
            return (
                equipmentMenu?.equipment &&
                equipmentMenu.position &&
                equipmentMenu?.equipmentType && (
                    <Menu
                        equipment={equipmentMenu?.equipment}
                        equipmentType={equipmentMenu?.equipmentType}
                        equipmentSubtype={equipmentMenu?.equipmentSubtype ?? null}
                        position={equipmentMenu.position}
                        handleClose={closeEquipmentMenu}
                        handleViewInSpreadsheet={handleViewInSpreadsheet}
                        handleDeleteEquipment={handleDeleteEquipment}
                        handleOpenModificationDialog={handleOpenModificationDialog}
                        onOpenDynamicSimulationEventDialog={handleOpenDynamicSimulationEventDialog}
                        {...props}
                    />
                )
            );
        },
        [
            equipmentMenu,
            closeEquipmentMenu,
            handleViewInSpreadsheet,
            handleDeleteEquipment,
            handleOpenModificationDialog,
            handleOpenDynamicSimulationEventDialog,
        ]
    );

    const renderEquipmentMenu = useCallback(() => {
        if (disabled || equipmentMenu?.equipment === null || !equipmentMenu?.equipmentType || !equipmentMenu?.display) {
            return <></>;
        }

        const menuProps: MenuProps = {
            currentNode,
            currentRootNetworkUuid,
            studyUuid,
            equipmentType: equipmentMenu.equipmentType,
            modificationInProgress,
            setModificationInProgress,
        };

        return (
            <>
                {/* Branch menus (LINE, HVDC_LINE, transformers) */}
                {(equipmentMenu.equipmentType === EquipmentType.LINE ||
                    equipmentMenu.equipmentType === EquipmentType.HVDC_LINE ||
                    equipmentMenu.equipmentType === EquipmentType.TWO_WINDINGS_TRANSFORMER ||
                    equipmentMenu.equipmentType === EquipmentType.THREE_WINDINGS_TRANSFORMER) &&
                    withEquipment(MenuBranch, menuProps)}

                {equipmentMenu.equipmentType === EquipmentType.SUBSTATION && withEquipment(MenuSubstation, null)}
                {equipmentMenu.equipmentType === EquipmentType.VOLTAGE_LEVEL && withEquipment(MenuVoltageLevel, null)}

                {equipmentMenu.equipmentType === EquipmentType.LOAD && withEquipment(MenuLoad, null)}
                {equipmentMenu.equipmentType === EquipmentType.BATTERY && withEquipment(MenuBattery, null)}
                {equipmentMenu.equipmentType === EquipmentType.DANGLING_LINE && withEquipment(MenuDanglingLine, null)}
                {equipmentMenu.equipmentType === EquipmentType.GENERATOR && withEquipment(MenuGenerator, null)}
                {equipmentMenu.equipmentType === EquipmentType.STATIC_VAR_COMPENSATOR &&
                    withEquipment(MenuStaticVarCompensator, null)}
                {equipmentMenu.equipmentType === EquipmentType.SHUNT_COMPENSATOR &&
                    withEquipment(MenuShuntCompensator, null)}
                {equipmentMenu.equipmentType === EquipmentType.LCC_CONVERTER_STATION &&
                    withEquipment(MenuLccConverterStation, null)}
                {equipmentMenu.equipmentType === EquipmentType.VSC_CONVERTER_STATION &&
                    withEquipment(MenuVscConverterStation, null)}
            </>
        );
    }, [
        disabled,
        equipmentMenu,
        withEquipment,
        MenuBranch,
        MenuSubstation,
        MenuVoltageLevel,
        MenuLoad,
        MenuBattery,
        MenuDanglingLine,
        MenuGenerator,
        MenuStaticVarCompensator,
        MenuShuntCompensator,
        MenuLccConverterStation,
        MenuVscConverterStation,
        currentNode,
        currentRootNetworkUuid,
        studyUuid,
        modificationInProgress,
        setModificationInProgress,
    ]);

    return {
        openEquipmentMenu,
        renderEquipmentMenu,
    };
};

export default useEquipmentMenu;
