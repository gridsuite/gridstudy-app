/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useRef, useCallback, useEffect, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { type MuiStyles } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import type { NADPanelMetadata } from '../../../types/workspace.types';
import { useDrawerResize } from './hooks/use-drawer-resize';
import { AssociatedSldPanel } from './associated-sld-panel';
import { selectPanelMetadata } from '../../../../../redux/slices/workspace-selectors';
import { closeAllAssociatedSlds } from '../../../../../redux/slices/workspace-slice';
import { NAD_SLD_CONSTANTS } from './constants';

const styles = {
    drawerContainer: (theme) => ({
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.15)',
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
    }),
    resizeHandle: (theme) => ({
        position: 'absolute',
        top: -2,
        left: 0,
        right: 0,
        height: 4,
        cursor: 'ns-resize',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: theme.palette.primary.main,
        },
        zIndex: 10,
    }),
    header: (theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 0.25,
        px: 0.5,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)',
        flexShrink: 0,
    }),
    headerWithBorder: {
        borderBottom: 1,
        borderColor: 'divider',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
    },
    iconButton: {
        padding: 0.25,
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: '0.75rem',
    },
    removeAllButton: {
        fontSize: '0.7rem',
        minWidth: 'auto',
        padding: '2px 8px',
        textTransform: 'none',
    },
    panelsContainer: (theme) => ({
        overflowX: 'auto',
        overflowY: 'hidden',
        flex: 1,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.3)',
        display: 'flex',
        gap: 0.5,
        p: 0.5,
    }),
    panelWrapper: {
        flex: '0 0 auto',
        height: '100%',
    },
} as const satisfies MuiStyles;

interface AssociatedSldsDrawerProps {
    readonly nadPanelId: UUID;
    readonly isCollapsed: boolean;
    readonly heightPercent: number;
    readonly focusedSldPanelId: UUID | null;
    readonly fullscreenSldPanelId: UUID | null;
    readonly isSidebarCollapsed: boolean;
    readonly onToggleCollapse: () => void;
    readonly onSetHeight: (height: number) => void;
    readonly onSetFocusedSldPanelId: React.Dispatch<React.SetStateAction<UUID | null>>;
    readonly onSetFullscreenSldPanelId: React.Dispatch<React.SetStateAction<UUID | null>>;
    readonly onRequestAssociation?: (voltageLevelId: string) => void;
}

export const AssociatedSldsDrawer = memo(function AssociatedSldsDrawer({
    nadPanelId,
    isCollapsed,
    heightPercent,
    focusedSldPanelId,
    fullscreenSldPanelId,
    isSidebarCollapsed,
    onToggleCollapse,
    onSetHeight,
    onSetFocusedSldPanelId,
    onSetFullscreenSldPanelId,
    onRequestAssociation,
}: AssociatedSldsDrawerProps) {
    const theme = useTheme();
    const intl = useIntl();
    const containerRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();

    const diagramMetadata = useSelector((state: RootState) => selectPanelMetadata(state, nadPanelId)) as
        | NADPanelMetadata
        | undefined;

    const associatedPanelIds = diagramMetadata?.associatedVoltageLevelPanels || [];

    const handleRemoveAll = useCallback(() => {
        dispatch(closeAllAssociatedSlds(nadPanelId));
        onSetFocusedSldPanelId(null);
        onSetFullscreenSldPanelId(null);
    }, [dispatch, nadPanelId, onSetFocusedSldPanelId, onSetFullscreenSldPanelId]);

    useEffect(() => {
        if (focusedSldPanelId && !isCollapsed && !fullscreenSldPanelId) {
            const timeoutId = setTimeout(() => {
                const card = document.querySelector(`[data-sld-panel-id="${focusedSldPanelId}"]`);
                card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }, NAD_SLD_CONSTANTS.SCROLL_INTO_VIEW_DELAY);
            return () => clearTimeout(timeoutId);
        }
        return undefined;
    }, [focusedSldPanelId, isCollapsed, fullscreenSldPanelId]);

    const { handleResizeStart } = useDrawerResize({
        containerRef,
        heightPercent,
        setHeightPercent: onSetHeight,
        minHeightPercent: NAD_SLD_CONSTANTS.DRAWER_MIN_HEIGHT_PERCENT,
        maxHeightPercent: NAD_SLD_CONSTANTS.DRAWER_MAX_HEIGHT_PERCENT,
    });

    if (associatedPanelIds.length === 0) {
        return null;
    }

    return (
        <Box
            ref={containerRef}
            sx={{
                ...styles.drawerContainer(theme),
                height: isCollapsed ? NAD_SLD_CONSTANTS.DRAWER_HEADER_HEIGHT : `${heightPercent}%`,
            }}
        >
            {!isCollapsed && !fullscreenSldPanelId && (
                <Box onMouseDown={handleResizeStart} sx={styles.resizeHandle(theme)} />
            )}

            <Box sx={{ ...styles.header(theme), ...(isCollapsed ? {} : styles.headerWithBorder) }}>
                <Box sx={styles.headerLeft}>
                    <IconButton size="small" onClick={onToggleCollapse} sx={styles.iconButton}>
                        {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
                    </IconButton>

                    <Typography variant="caption" sx={styles.titleText}>
                        {intl.formatMessage({ id: 'associatedSLDs' })} ({associatedPanelIds.length})
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleRemoveAll}
                    sx={styles.removeAllButton}
                >
                    {intl.formatMessage({ id: 'removeAll' })}
                </Button>
            </Box>

            <Box sx={{ ...styles.panelsContainer(theme), display: isCollapsed ? 'none' : 'flex' }}>
                {associatedPanelIds.map((sldPanelId) => (
                    <Box key={sldPanelId} data-sld-panel-id={sldPanelId} sx={styles.panelWrapper}>
                        <AssociatedSldPanel
                            sldPanelId={sldPanelId}
                            isFocused={focusedSldPanelId === sldPanelId}
                            isFullscreen={fullscreenSldPanelId === sldPanelId}
                            isSidebarCollapsed={isSidebarCollapsed}
                            onFocus={() => {
                                onSetFocusedSldPanelId(sldPanelId);
                                onSetFullscreenSldPanelId((prev) => (prev ? sldPanelId : prev));
                            }}
                            onToggleFullscreen={() => {
                                onSetFocusedSldPanelId(sldPanelId);
                                onSetFullscreenSldPanelId((prev) => (prev === sldPanelId ? null : sldPanelId));
                            }}
                            onClose={() => {
                                onSetFocusedSldPanelId((prev) => (prev === sldPanelId ? null : prev));
                                onSetFullscreenSldPanelId((prev) => (prev === sldPanelId ? null : prev));
                            }}
                            onRequestAssociation={onRequestAssociation}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
});
