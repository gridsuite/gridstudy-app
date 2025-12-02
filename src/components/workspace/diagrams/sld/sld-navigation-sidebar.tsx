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

interface SldNavigationSidebarProps {
    navigationHistory: string[];
    currentVoltageLevelId?: string;
    onNavigate: (voltageLevelId: string) => void;
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 160;

const styles = {
    sidebar: (theme: Theme, shouldBeCollapsed: boolean) => ({
        width: shouldBeCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        borderLeft: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
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

export const SldNavigationSidebar = memo<SldNavigationSidebarProps>(
    ({ navigationHistory, currentVoltageLevelId, onNavigate }) => {
        const theme = useTheme();
        const intl = useIntl();
        const currentNode = useSelector((state: AppState) => state.currentTreeNode);
        const [isCollapsed, setIsCollapsed] = useState(false);
        const hasHistory = navigationHistory.length > 0;
        const shouldBeCollapsed = isCollapsed || !hasHistory;
        const isDisabled = !isNodeBuilt(currentNode);

        return (
            <Box sx={styles.sidebar(theme, shouldBeCollapsed)}>
                {/* Header */}
                <Box
                    onClick={hasHistory ? () => setIsCollapsed(!isCollapsed) : undefined}
                    sx={styles.header(theme, hasHistory)}
                >
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
                        {navigationHistory.map((voltageLevelId, index) => (
                            <ListItemButton
                                key={`${voltageLevelId}-${index}`}
                                selected={voltageLevelId === currentVoltageLevelId}
                                onClick={() => !isDisabled && onNavigate(voltageLevelId)}
                                disabled={isDisabled}
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
                        ))}
                    </List>
                )}
            </Box>
        );
    }
);
