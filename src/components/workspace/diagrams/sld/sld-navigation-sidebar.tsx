/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { History as HistoryIcon } from '@mui/icons-material';
import { TopologyIcon } from '@gridsuite/commons-ui';
import { AppState } from '../../../../redux/reducer.type';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { NavigationSidebar, type SidebarSection } from '../common/navigation-sidebar';
import { HistorySectionContent } from '../common/history-section-content';
import { TopologySectionContent } from './topology-section-content';
import type { PendingSwitches } from './use-pending-switches';

interface SldNavigationSidebarProps {
    /** No history section when undefined: a substation diagram has no navigation. */
    navigationHistory?: string[];
    currentVoltageLevelId?: string;
    onNavigate?: (voltageLevelId: string) => void;
    pendingSwitches: PendingSwitches;
}

export const SldNavigationSidebar = memo<SldNavigationSidebarProps>(
    ({ navigationHistory, currentVoltageLevelId, onNavigate, pendingSwitches }) => {
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);
        const disabled = !isNodeBuilt(currentNode);

        const sections = useMemo(() => {
            const result: SidebarSection[] = [];
            if (navigationHistory && onNavigate) {
                result.push({
                    id: 'history',
                    icon: <HistoryIcon fontSize="small" />,
                    titleId: 'history',
                    disabled: navigationHistory.length === 0,
                    content: (
                        <HistorySectionContent
                            navigationHistory={navigationHistory}
                            disabled={disabled}
                            isItemSelected={(id) => id === currentVoltageLevelId}
                            onNavigate={onNavigate}
                        />
                    ),
                });
            }
            if (pendingSwitches.size > 0) {
                result.push({
                    id: 'topology',
                    icon: <TopologyIcon fontSize="small" />,
                    titleId: 'topology',
                    defaultExpanded: true,
                    content: <TopologySectionContent pendingSwitches={pendingSwitches} />,
                });
            }
            return result;
        }, [navigationHistory, disabled, currentVoltageLevelId, onNavigate, pendingSwitches]);

        return <NavigationSidebar sections={sections} />;
    }
);
