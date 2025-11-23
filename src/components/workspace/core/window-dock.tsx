/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useState, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Tabs, Tab, Theme } from '@mui/material';
import { Close } from '@mui/icons-material';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { selectWindows, selectFocusedWindowId } from '../../../redux/slices/workspace-selectors';
import { closeWindow, focusWindow, toggleMinimize } from '../../../redux/slices/workspace-slice';
import { WindowType } from '../types/workspace.types';
import type { UUID } from 'node:crypto';
import { getWindowConfig } from '../constants/workspace.constants';

const styles = {
    dock: (theme: Theme) => ({
        flexShrink: 0,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
    }),
    closeButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        width: 16,
        height: 16,
        cursor: 'pointer',
        borderRadius: '50%',
        '&:hover': {
            backgroundColor: 'action.hover',
        },
        '& .MuiSvgIcon-root': { fontSize: 14 },
    },
} as const satisfies MuiStyles;

export const WindowDock = memo(() => {
    const dispatch = useDispatch();
    const allWindows = useSelector(selectWindows);
    const focusedWindowId = useSelector(selectFocusedWindowId);
    const [hoveredTab, setHoveredTab] = useState<UUID | null>(null);

    const windows = useMemo(
        () => allWindows.filter((window) => window.type === WindowType.SLD || window.type === WindowType.NAD),
        [allWindows]
    );

    // Find the index of the focused window in the filtered windows array
    const selectedTabIndex = useMemo(() => {
        if (!focusedWindowId) return false;
        const index = windows.findIndex((w) => w.id === focusedWindowId && !w.isMinimized);
        return index >= 0 ? index : false;
    }, [focusedWindowId, windows]);

    if (windows.length === 0) {
        return null;
    }

    const handleWindowClick = (windowId: UUID, isMinimized: boolean) => {
        if (isMinimized) {
            dispatch(toggleMinimize(windowId));
            dispatch(focusWindow(windowId));
        } else {
            if (windowId === focusedWindowId) {
                dispatch(toggleMinimize(windowId));
            } else {
                dispatch(focusWindow(windowId));
            }
        }
    };

    return (
        <Box sx={styles.dock}>
            <Tabs
                value={selectedTabIndex}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 36 }}
                TabIndicatorProps={{ sx: { top: 0, bottom: 'auto' } }}
            >
                {windows.map((window, index) => (
                    <Tab
                        key={window.id}
                        value={index}
                        onMouseEnter={() => setHoveredTab(window.id)}
                        onMouseLeave={() => setHoveredTab(null)}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getWindowConfig(window.type).icon}
                                <span>{window.title}</span>
                                <Box
                                    component="span"
                                    sx={{
                                        ...styles.closeButton,
                                        visibility: hoveredTab === window.id && !window.isPinned ? 'visible' : 'hidden',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(closeWindow(window.id));
                                    }}
                                >
                                    <Close />
                                </Box>
                            </Box>
                        }
                        onClick={() => handleWindowClick(window.id, window.isMinimized)}
                        sx={{
                            minHeight: 36,
                            textTransform: 'none',
                        }}
                    />
                ))}
            </Tabs>
        </Box>
    );
});
