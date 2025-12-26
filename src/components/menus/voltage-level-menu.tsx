/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentType, ExtendedEquipmentType } from '@gridsuite/commons-ui';
import withEquipmentMenu from './equipment-menu';
import { MenuBranchProps } from './operating-status-menu';
import { BaseEquipmentMenuProps } from './base-equipment-menu';
import { fetchNetworkElementInfos } from 'services/study/network';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useEffect, useState } from 'react';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES, VoltageLevel } from 'components/utils/equipment-types';

export const withVoltageLevelMenu = (
    BaseMenu: React.ComponentType<BaseEquipmentMenuProps>,
    equipmentType: EquipmentType,
    equipmentSubtype: ExtendedEquipmentType | null,
    menuId: string
) => {
    return (props: MenuBranchProps) => {
        const studyUuid = useSelector((state: AppState) => state.studyUuid);
        const currentNodeUuid = useSelector((state: AppState) => state.currentTreeNode)?.id;
        const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
        const EquipmentMenu = withEquipmentMenu(BaseMenu, equipmentType, equipmentSubtype, menuId);
        const [isLoading, setIsLoading] = useState(false);
        const [voltageLevelInfos, setVoltageLevelInfos] = useState<VoltageLevel>();

        const voltageLevel = props.equipment;

        useEffect(() => {
            let cancelled = false;
            setIsLoading(true);

            fetchNetworkElementInfos(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                EQUIPMENT_TYPES.VOLTAGE_LEVEL,
                EQUIPMENT_INFOS_TYPES.MAP.type,
                voltageLevel.id,
                true
            )
                .then((res) => {
                    if (!cancelled) setVoltageLevelInfos(res);
                })
                .finally(() => {
                    if (!cancelled) setIsLoading(false);
                });

            return () => {
                cancelled = true;
            };
        }, [voltageLevel.id, studyUuid, currentNodeUuid, currentRootNetworkUuid]);

        if (!voltageLevelInfos?.subtationId || isLoading) {
            return;
        }

        return (
            <EquipmentMenu {...props} equipment={{ ...voltageLevel, substationId: voltageLevelInfos.subtationId }} />
        );
    };
};
