/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, memo, useMemo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import {
    selectNadNavigationHistory,
    selectAssociatedVoltageLevelIds,
} from '../../../../redux/slices/workspace-selectors';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../redux/store';
import { NavigationSidebar } from '../common/navigation-sidebar';
import { useNadSldAssociation } from '../../panel-contents/diagrams/nad/hooks/use-nad-sld-association';

interface NadNavigationSidebarProps {
    readonly nadPanelId: UUID;
    readonly onCollapseChange?: (collapsed: boolean) => void;
}

export const NadNavigationSidebar = memo(function NadNavigationSidebar({
    nadPanelId,
    onCollapseChange,
}: NadNavigationSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
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

    const { handleNavigationSidebarClick } = useNadSldAssociation({ nadPanelId });

    const reversedHistory = useMemo(() => [...(navigationHistory || [])].reverse(), [navigationHistory]);

    const hasHistory = reversedHistory.length > 0;
    const shouldBeCollapsed = !isExpanded || !hasHistory;

    const handleToggleExpand = () => {
        if (hasHistory) {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);
            onCollapseChange?.(!newExpanded || !hasHistory);
        }
    };

    return (
        <NavigationSidebar
            navigationHistory={reversedHistory}
            isCollapsed={shouldBeCollapsed}
            isDisabled={!isBuilt}
            isItemSelected={(id) => associatedVoltageLevelIds.includes(id)}
            onToggleCollapse={handleToggleExpand}
            onNavigate={handleNavigationSidebarClick}
        />
    );
});
