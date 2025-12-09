/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, useTheme, Theme } from '@mui/material';
import { History as HistoryIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { memo } from 'react';
import { useIntl } from 'react-intl';

interface NavigationSidebarProps {
    navigationHistory: string[];
    shouldBeCollapsed: boolean;
    hasHistory: boolean;
    isDisabled: boolean;
    isAbsolutePositioned?: boolean;
    isItemSelected?: (voltageLevelId: string) => boolean;
    onToggleCollapse?: () => void;
    onNavigate: (voltageLevelId: string) => void;
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 160;

const getBackgroundColor = (theme: Theme, shouldBeCollapsed: boolean) => {
    if (shouldBeCollapsed) {
        return 'transparent';
    }
    return theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33';
};

const getBorderLeft = (theme: Theme, shouldBeCollapsed: boolean, isAbsolutePositioned: boolean) => {
    if (isAbsolutePositioned && shouldBeCollapsed) {
        return 'none';
    }
    return `1px solid ${theme.palette.divider}`;
};

const styles = {
    sidebar: (theme: Theme, shouldBeCollapsed: boolean, isAbsolutePositioned: boolean) => ({
        width: shouldBeCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        borderLeft: getBorderLeft(theme, shouldBeCollapsed, isAbsolutePositioned),
        backgroundColor: getBackgroundColor(theme, shouldBeCollapsed),
        display: 'flex',
        flexDirection: 'column' as const,
        flexShrink: 0,
        overflowX: 'hidden' as const,
        ...(shouldBeCollapsed &&
            isAbsolutePositioned && {
                position: 'absolute' as const,
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
                pointerEvents: 'none' as const,
            }),
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

export const NavigationSidebar = memo(function NavigationSidebar({
    navigationHistory,
    shouldBeCollapsed,
    hasHistory,
    isDisabled,
    isAbsolutePositioned = false,
    isItemSelected,
    onToggleCollapse,
    onNavigate,
}: NavigationSidebarProps) {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <Box sx={styles.sidebar(theme, shouldBeCollapsed, isAbsolutePositioned)}>
            {/* Header */}
            <Box onClick={hasHistory ? onToggleCollapse : undefined} sx={styles.header(theme, hasHistory)}>
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
                            selected={isItemSelected ? isItemSelected(voltageLevelId) : false}
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
});
