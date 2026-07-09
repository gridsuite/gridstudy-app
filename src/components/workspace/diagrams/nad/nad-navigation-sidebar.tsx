/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { History as HistoryIcon, Info as InfoIcon } from '@mui/icons-material';
import { NominalVoltageIcon } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer.type';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import {
    selectAssociatedVoltageLevelIds,
    selectNadNavigationHistory,
} from '../../../../redux/slices/workspace-selectors';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../redux/store';
import { NavigationSidebar, type SidebarSection } from '../common/navigation-sidebar';
import { HistorySectionContent } from '../common/history-section-content';
import { useWorkspacePanelActions } from '../../hooks/use-workspace-panel-actions';
import NominalVoltageFilter, { type NominalVoltageFilterStyles } from '../../../network/nominal-voltage-filter';
import NadInfoFilter from './nad-info-filter';
import type { NadSelectedInfoKey, NadSelectedInfos } from './use-nad-info-filter';

// Flatten NominalVoltageFilter so it blends into the sidebar instead of floating like the map overlay.
const voltageFilterStyles: NominalVoltageFilterStyles = {
    root: { boxShadow: 'none', backgroundColor: 'transparent', borderRadius: 0 },
    nominalVoltageZone: { maxHeight: 'none', minWidth: 0, width: '100%', py: 0 },
};

interface NadNavigationSidebarProps {
    readonly nadPanelId: UUID;
    readonly allNominalVoltages: number[];
    readonly selectedNominalVoltages: number[];
    readonly onNominalVoltagesChange: (checkedNominalVoltages: number[]) => void;
    readonly selectedInfos: NadSelectedInfos;
    readonly onSelectedInfoToggle: (key: NadSelectedInfoKey) => void;
}

export const NadNavigationSidebar = memo(function NadNavigationSidebar({
    nadPanelId,
    allNominalVoltages,
    selectedNominalVoltages,
    onNominalVoltagesChange,
    selectedInfos,
    onSelectedInfoToggle,
}: NadNavigationSidebarProps) {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isBuilt = isNodeBuilt(currentNode);

    const associatedVoltageLevelIds = useSelector(
        (state: RootState) => selectAssociatedVoltageLevelIds(state, nadPanelId),
        shallowEqual
    );

    const navigationHistory = useSelector(
        (state: RootState) => selectNadNavigationHistory(state, nadPanelId),
        shallowEqual
    );

    const { associateVoltageLevelWithNad } = useWorkspacePanelActions();

    const handleNavigationSidebarClick = useCallback(
        (voltageLevelId: string) => {
            associateVoltageLevelWithNad({ voltageLevelId, nadPanelId });
        },
        [nadPanelId, associateVoltageLevelWithNad]
    );

    const reversedHistory = useMemo(() => [...(navigationHistory || [])].reverse(), [navigationHistory]);

    const hasHistory = reversedHistory.length > 0;
    const hasNominalVoltages = allNominalVoltages.length > 0;

    const sections = useMemo<SidebarSection[]>(
        () => [
            {
                id: 'history',
                icon: <HistoryIcon fontSize="small" />,
                titleId: 'history',
                disabled: !hasHistory,
                content: (
                    <HistorySectionContent
                        navigationHistory={reversedHistory}
                        disabled={!isBuilt}
                        isItemSelected={(id) => associatedVoltageLevelIds.includes(id)}
                        onNavigate={handleNavigationSidebarClick}
                    />
                ),
            },
            {
                id: 'voltage',
                icon: <NominalVoltageIcon fontSize="small" />,
                titleId: 'nadVoltageFilter',
                disabled: !hasNominalVoltages,
                content: (
                    <NominalVoltageFilter
                        nominalVoltages={allNominalVoltages}
                        filteredNominalVoltages={selectedNominalVoltages}
                        onChange={onNominalVoltagesChange}
                        disabled={!isBuilt}
                        styles={voltageFilterStyles}
                    />
                ),
            },
            {
                id: 'informations',
                icon: <InfoIcon fontSize="medium" />,
                titleId: 'nadInfoFilter',
                isDisabled: !isBuilt,
                content: (
                    <NadInfoFilter
                        selectedInfos={selectedInfos}
                        onToggle={onSelectedInfoToggle}
                        isDisabled={!isBuilt}
                    />
                ),
            },
        ],
        [
            hasHistory,
            reversedHistory,
            isBuilt,
            associatedVoltageLevelIds,
            handleNavigationSidebarClick,
            hasNominalVoltages,
            allNominalVoltages,
            selectedNominalVoltages,
            onNominalVoltagesChange,
            selectedInfos,
            onSelectedInfoToggle,
        ]
    );

    return <NavigationSidebar sections={sections} />;
});
