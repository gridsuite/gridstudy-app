/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Bolt as BoltIcon, History as HistoryIcon } from '@mui/icons-material';
import { AppState } from '../../../../redux/reducer.type';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import {
    selectAssociatedVoltageLevelIds,
    selectNadNavigationHistory,
} from '../../../../redux/slices/workspace-selectors';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../redux/store';
import { HistorySectionContent, NavigationSidebar, type SidebarSection } from '../common/navigation-sidebar';
import { useWorkspacePanelActions } from '../../hooks/use-workspace-panel-actions';
import NominalVoltageFilter, { type NominalVoltageFilterStyles } from '../../../network/nominal-voltage-filter';

// Flatten NominalVoltageFilter so it blends into the sidebar instead of floating like the map overlay.
const voltageFilterStyles: NominalVoltageFilterStyles = {
    root: { boxShadow: 'none', backgroundColor: 'transparent', borderRadius: 0 },
    nominalVoltageZone: { maxHeight: 'none', minWidth: 0, width: '100%' },
};

interface NadNavigationSidebarProps {
    readonly nadPanelId: UUID;
    readonly allVoltages: number[];
    readonly selectedVoltages: number[];
    readonly onVoltagesChange: (checkedVoltages: number[]) => void;
}

export const NadNavigationSidebar = memo(function NadNavigationSidebar({
    nadPanelId,
    allVoltages,
    selectedVoltages,
    onVoltagesChange,
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
    const hasVoltages = allVoltages.length > 0;

    const sections = useMemo<SidebarSection[]>(
        () => [
            {
                id: 'history',
                icon: <HistoryIcon fontSize="small" />,
                titleId: 'history',
                isDisabled: !hasHistory,
                content: (
                    <HistorySectionContent
                        navigationHistory={reversedHistory}
                        isDisabled={!isBuilt}
                        isItemSelected={(id) => associatedVoltageLevelIds.includes(id)}
                        onNavigate={handleNavigationSidebarClick}
                    />
                ),
            },
            {
                id: 'voltage',
                icon: <BoltIcon fontSize="small" />,
                titleId: 'nadVoltageFilter',
                isDisabled: !hasVoltages,
                content: (
                    <NominalVoltageFilter
                        nominalVoltages={allVoltages}
                        filteredNominalVoltages={selectedVoltages}
                        onChange={onVoltagesChange}
                        isDisabled={!isBuilt}
                        styles={voltageFilterStyles}
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
            hasVoltages,
            allVoltages,
            selectedVoltages,
            onVoltagesChange,
        ]
    );

    return <NavigationSidebar sections={sections} />;
});
