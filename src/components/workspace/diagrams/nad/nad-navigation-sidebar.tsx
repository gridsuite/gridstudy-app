/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, useTheme, Theme } from '@mui/material';
import { History as HistoryIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useState, memo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { isNodeBuilt } from '../../../graph/util/model-functions';
import { selectPanelMetadata } from '../../../../redux/slices/workspace-selectors';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../redux/store';
import type { NADPanelMetadata } from '../../types/workspace.types';

interface NadNavigationSidebarProps {
    nadPanelId: UUID;
    onNavigate: (voltageLevelId: string) => void;
    onCollapseChange?: (collapsed: boolean) => void;
    associatedVoltageLevelIds?: string[];
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 160;

const getBackgroundColor = (theme: Theme, shouldBeCollapsed: boolean) => {
    if (shouldBeCollapsed) {
        return 'transparent';
    }
    return theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33';
};

const styles = {
    sidebar: (theme: Theme, shouldBeCollapsed: boolean) => ({
        width: shouldBeCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        borderLeft: `1px solid ${theme.palette.divider}`,
        backgroundColor: getBackgroundColor(theme, shouldBeCollapsed),
        display: 'flex',
        flexDirection: 'column' as const,
        flexShrink: 0,
        overflowX: 'hidden' as const,
    }),
    header: (theme: Theme, hasHistory: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        p: 1,
        cursor: hasHistory ? 'pointer' : 'default',
        pointerEvents: 'auto' as const,
        '&:hover': {
            backgroundColor: hasHistory ? theme.palette.action.hover : 'transparent',
        },
    }),
    icon: (theme: Theme, hasHistory: boolean) => ({
        color: hasHistory ? theme.palette.text.primary : theme.palette.text.disabled,
    }),
    list: {
        flex: 1,
        overflow: 'auto' as const,
        py: 0,
    },
};

export const NadNavigationSidebar = memo(function NadNavigationSidebar({
    nadPanelId,
    onNavigate,
    onCollapseChange,
    associatedVoltageLevelIds = [],
}: NadNavigationSidebarProps) {
    const theme = useTheme();
    const intl = useIntl();
    const [isExpanded, setIsExpanded] = useState(false);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const isBuilt = isNodeBuilt(currentNode);

    const metadata = useSelector((state: RootState) => selectPanelMetadata(state, nadPanelId)) as
        | NADPanelMetadata
        | undefined;
    const navigationHistory = metadata?.navigationHistory || [];

    const hasHistory = navigationHistory.length > 0;
    const shouldBeCollapsed = !isExpanded || !hasHistory;
    const isDisabled = !isBuilt;

    const handleToggleExpand = () => {
        if (hasHistory) {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);
            onCollapseChange?.(!newExpanded || !hasHistory);
        }
    };

    return (
        <Box sx={styles.sidebar(theme, shouldBeCollapsed)}>
            {/* Header */}
            <Box onClick={handleToggleExpand} sx={styles.header(theme, hasHistory)}>
                <HistoryIcon sx={styles.icon(theme, hasHistory)} />
                {!shouldBeCollapsed && (
                    <Typography variant="caption" sx={{ ml: 1, fontWeight: 'medium' }}>
                        {intl.formatMessage({ id: 'history' })}
                    </Typography>
                )}
            </Box>

            {/* List */}
            {!shouldBeCollapsed && (
                <List dense sx={styles.list}>
                    {[...navigationHistory].reverse().map((voltageLevelId: string, index: number) => {
                        const isAssociated = associatedVoltageLevelIds.includes(voltageLevelId);
                        return (
                            <ListItemButton
                                key={`${voltageLevelId}-${index}`}
                                onClick={() => !isDisabled && onNavigate(voltageLevelId)}
                                disabled={isDisabled}
                                selected={isAssociated}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <ArrowBackIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={voltageLevelId}
                                    primaryTypographyProps={{
                                        variant: 'caption',
                                        noWrap: true,
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            )}
        </Box>
    );
});
