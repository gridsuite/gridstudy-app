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
import { OverflowableText } from '@gridsuite/commons-ui';
import { selectOpenPanels, selectFocusedPanelId } from '../../../redux/slices/workspace-selectors';
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
    tabLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
    },
    tabContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        width: 100,
        overflow: 'hidden',
    },
    tabText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;

export const WorkspaceDock = memo(() => {
    const dispatch = useDispatch();
    const allPanels = useSelector(selectOpenPanels);
    const focusedPanelId = useSelector(selectFocusedPanelId);
    const [hoveredTab, setHoveredTab] = useState<UUID | null>(null);

    const panels = useMemo(
        () =>
            allPanels.filter(
                (panel) =>
                    panel.type === PanelType.SLD_VOLTAGE_LEVEL ||
                    panel.type === PanelType.SLD_SUBSTATION ||
                    panel.type === PanelType.NAD
            ),
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

    const handleMinimizedPanelClick = (panelId: UUID) => {
        dispatch(toggleMinimize(panelId));
        dispatch(focusPanel(panelId));
    };

    const handleActivePanelClick = (panelId: UUID) => {
        if (panelId === focusedPanelId) {
            dispatch(toggleMinimize(panelId));
        } else {
            dispatch(focusPanel(panelId));
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
                            <Box sx={styles.tabLabel}>
                                <Box sx={styles.tabContent}>
                                    {getPanelConfig(panel.type).icon}
                                    <OverflowableText
                                        text={panel.title}
                                        sx={styles.tabText}
                                        tooltipSx={styles.tooltip}
                                    />
                                </Box>
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
                        onClick={() =>
                            panel.isMinimized ? handleMinimizedPanelClick(panel.id) : handleActivePanelClick(panel.id)
                        }
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
