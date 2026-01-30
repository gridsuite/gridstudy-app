/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    Theme,
    IconButton,
} from '@mui/material';
import { History as HistoryIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { memo } from 'react';
import { useIntl } from 'react-intl';

interface NavigationSidebarProps {
    navigationHistory: string[];
    isCollapsed: boolean;
    isDisabled: boolean;
    isAbsolutePositioned?: boolean;
    isItemSelected?: (voltageLevelId: string) => boolean;
    onToggleCollapse?: () => void;
    onNavigate: (voltageLevelId: string) => void;
}

const COLLAPSED_WIDTH = 40;
const EXPANDED_WIDTH = 160;

const getBackgroundColor = (theme: Theme, isCollapsed: boolean) => {
    if (isCollapsed) {
        return 'transparent';
    }
    return theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33';
};

const getBorderRight = (theme: Theme, isCollapsed: boolean, isAbsolutePositioned: boolean) => {
    if (isAbsolutePositioned && isCollapsed) {
        return 'none';
    }
    return `1px solid ${theme.palette.divider}`;
};

const styles = {
    sidebar: (theme: Theme, isCollapsed: boolean, isAbsolutePositioned: boolean) => ({
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        borderRight: getBorderRight(theme, isCollapsed, isAbsolutePositioned),
        borderLeft: isAbsolutePositioned ? 'none' : `1px solid ${theme.palette.divider}`,
        backgroundColor: getBackgroundColor(theme, isCollapsed),
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowX: 'hidden',
        ...(isCollapsed &&
            isAbsolutePositioned && {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
                pointerEvents: 'none',
            }),
    }),
    headerContainer: {
        p: 0.5,
        pointerEvents: 'auto',
    },
    iconButton: {
        p: 0.5,
    },
    headerExpanded: (theme: Theme, hasHistory: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        p: 0.5,
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
        overflow: 'auto',
        py: 0,
    },
};

export const NavigationSidebar = memo(function NavigationSidebar({
    navigationHistory,
    isCollapsed,
    isDisabled,
    isAbsolutePositioned = false,
    isItemSelected,
    onToggleCollapse,
    onNavigate,
}: NavigationSidebarProps) {
    const theme = useTheme();
    const intl = useIntl();
    const hasHistory = navigationHistory.length > 0;

    return (
        <Box sx={styles.sidebar(theme, isCollapsed, isAbsolutePositioned)}>
            {/* Header */}
            <Box sx={styles.headerContainer}>
                {isCollapsed ? (
                    <IconButton
                        onClick={hasHistory ? onToggleCollapse : undefined}
                        disabled={!hasHistory}
                        size="small"
                        sx={styles.iconButton}
                    >
                        <HistoryIcon sx={styles.icon(theme, hasHistory)} fontSize="small" />
                    </IconButton>
                ) : (
                    <Box
                        onClick={hasHistory ? onToggleCollapse : undefined}
                        sx={styles.headerExpanded(theme, hasHistory)}
                    >
                        <HistoryIcon sx={styles.icon(theme, hasHistory)} fontSize="small" />
                        <Typography variant="caption" sx={{ ml: 1, fontWeight: 'medium' }}>
                            {intl.formatMessage({ id: 'history' })}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* List */}
            {!isCollapsed && (
                <List dense sx={styles.list}>
                    {navigationHistory.map((voltageLevelId, index) => (
                        <ListItemButton
                            key={`${voltageLevelId}-${index}`}
                            selected={isItemSelected ? isItemSelected(voltageLevelId) : false}
                            onClick={() => onNavigate(voltageLevelId)}
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
