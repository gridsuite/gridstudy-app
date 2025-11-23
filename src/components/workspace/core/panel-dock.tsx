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
import { selectPanels, selectFocusedPanelId } from '../../../redux/slices/workspace-selectors';
import { closePanel, focusPanel, toggleMinimize } from '../../../redux/slices/workspace-slice';
import { PanelType } from '../types/workspace.types';
import type { UUID } from 'node:crypto';
import { getPanelConfig } from '../constants/workspace.constants';

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

export const PanelDock = memo(() => {
    const dispatch = useDispatch();
    const allPanels = useSelector(selectPanels);
    const focusedPanelId = useSelector(selectFocusedPanelId);
    const [hoveredTab, setHoveredTab] = useState<UUID | null>(null);

    const panels = useMemo(
        () => allPanels.filter((panel) => panel.type === PanelType.SLD || panel.type === PanelType.NAD),
        [allPanels]
    );

    // Find the index of the focused panel in the filtered panels array
    const selectedTabIndex = useMemo(() => {
        if (!focusedPanelId) return false;
        const index = panels.findIndex((p) => p.id === focusedPanelId && !p.isMinimized);
        return index >= 0 ? index : false;
    }, [focusedPanelId, panels]);

    if (panels.length === 0) {
        return null;
    }

    const handlePanelClick = (panelId: UUID, isMinimized: boolean) => {
        if (isMinimized) {
            dispatch(toggleMinimize(panelId));
            dispatch(focusPanel(panelId));
        } else {
            if (panelId === focusedPanelId) {
                dispatch(toggleMinimize(panelId));
            } else {
                dispatch(focusPanel(panelId));
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
                {panels.map((panel, index) => (
                    <Tab
                        key={panel.id}
                        value={index}
                        onMouseEnter={() => setHoveredTab(panel.id)}
                        onMouseLeave={() => setHoveredTab(null)}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getPanelConfig(panel.type).icon}
                                <span>{panel.title}</span>
                                <Box
                                    component="span"
                                    sx={{
                                        ...styles.closeButton,
                                        visibility: hoveredTab === panel.id && !panel.isPinned ? 'visible' : 'hidden',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(closePanel(panel.id));
                                    }}
                                >
                                    <Close />
                                </Box>
                            </Box>
                        }
                        onClick={() => handlePanelClick(panel.id, panel.isMinimized)}
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
