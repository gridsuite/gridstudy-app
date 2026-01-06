/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, memo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { NavigationSidebar } from '../common/navigation-sidebar';

interface SldNavigationSidebarProps {
    navigationHistory: string[];
    currentVoltageLevelId?: string;
    onNavigate: (voltageLevelId: string) => void;
}

export const SldNavigationSidebar = memo<SldNavigationSidebarProps>(
    ({ navigationHistory, currentVoltageLevelId, onNavigate }) => {
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);
        const [isCollapsed, setIsCollapsed] = useState(true);
        const hasHistory = navigationHistory.length > 0;
        const shouldBeCollapsed = isCollapsed || !hasHistory;
        const isDisabled = !isNodeBuilt(currentNode);

        return (
            <NavigationSidebar
                navigationHistory={navigationHistory}
                isCollapsed={shouldBeCollapsed}
                isDisabled={isDisabled}
                isAbsolutePositioned
                isItemSelected={(id) => id === currentVoltageLevelId}
                onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                onNavigate={onNavigate}
            />
        );
    }
);
