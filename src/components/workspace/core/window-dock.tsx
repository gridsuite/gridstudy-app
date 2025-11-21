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
import { selectWindows } from '../../../redux/slices/workspace-selectors';
import { closeWindow, focusWindow, toggleMinimize } from '../../../redux/slices/workspace-slice';
import { WindowType } from '../types/workspace.types';
import { UUID } from 'crypto';

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
    const windows = useMemo(() => allWindows.filter((window) => window.type === WindowType.DIAGRAM), [allWindows]);
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    if (windows.length === 0) {
        return null;
    }

    const handleWindowClick = (windowId: UUID, isMinimized: boolean) => {
        if (isMinimized) {
            dispatch(toggleMinimize(windowId));
            dispatch(focusWindow(windowId));
        } else {
            const window = allWindows.find((w) => w.id === windowId);
            if (!window) return;

            const maxZIndex = Math.max(...allWindows.map((w) => w.zIndex));
            if (window.zIndex === maxZIndex) {
                dispatch(toggleMinimize(windowId));
            } else {
                dispatch(focusWindow(windowId));
            }
        }
    };

    const handleTabHover = (windowId: string | null) => setHoveredTab(windowId);

    return (
        <Box sx={styles.dock}>
            <Tabs value={false} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 36 }}>
                {windows.map((window) => (
                    <Tab
                        key={window.id}
                        onMouseEnter={() => handleTabHover(window.id)}
                        onMouseLeave={() => handleTabHover(null)}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                            opacity: window.isMinimized ? 0.6 : 1,
                        }}
                    />
                ))}
            </Tabs>
        </Box>
    );
});
