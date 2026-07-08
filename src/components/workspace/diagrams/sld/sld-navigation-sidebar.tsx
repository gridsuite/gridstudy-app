/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { History as HistoryIcon } from '@mui/icons-material';
import { AppState } from '../../../../redux/reducer.type';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { NavigationSidebar, type SidebarSection } from '../common/navigation-sidebar';
import { HistorySectionContent } from '../common/history-section-content';

interface SldNavigationSidebarProps {
    navigationHistory: string[];
    currentVoltageLevelId?: string;
    onNavigate: (voltageLevelId: string) => void;
}

export const SldNavigationSidebar = memo<SldNavigationSidebarProps>(
    ({ navigationHistory, currentVoltageLevelId, onNavigate }) => {
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);
        const hasHistory = navigationHistory.length > 0;
        const isDisabled = !isNodeBuilt(currentNode);

        const sections = useMemo<SidebarSection[]>(
            () => [
                {
                    id: 'history',
                    icon: <HistoryIcon fontSize="small" />,
                    titleId: 'history',
                    isDisabled: !hasHistory,
                    content: (
                        <HistorySectionContent
                            navigationHistory={navigationHistory}
                            isDisabled={isDisabled}
                            isItemSelected={(id) => id === currentVoltageLevelId}
                            onNavigate={onNavigate}
                        />
                    ),
                },
            ],
            [hasHistory, navigationHistory, isDisabled, currentVoltageLevelId, onNavigate]
        );

        return <NavigationSidebar sections={sections} isAbsolutePositioned />;
    }
);
