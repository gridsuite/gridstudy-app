/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, IconButton, Paper, Typography, useTheme, Theme } from '@mui/material';
import { Close, Fullscreen, FullscreenExit, LinkOff } from '@mui/icons-material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import type { AppState } from '../../../../../redux/reducer';
import { selectPanel } from '../../../../../redux/slices/workspace-selectors';
import { dissociateSldFromNad, closePanel } from '../../../../../redux/slices/workspace-slice';
import { VoltageLevelPanelContent } from '../sld/voltage-level-panel-content';
import { NAD_SLD_CONSTANTS } from './constants';

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        py: 0.25,
        minHeight: 28,
        backgroundColor: 'action.hover',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
    },
    titleText: {
        fontWeight: 500,
        fontSize: '0.75rem',
        lineHeight: 1.5,
    },
    actionsContainer: {
        display: 'flex',
        gap: 0.25,
    },
    iconButton: {
        padding: 0.4,
    },
    icon: {
        fontSize: 18,
    },
    contentContainer: (theme: Theme) => ({
        height: `calc(100% - ${NAD_SLD_CONSTANTS.DRAWER_HEADER_HEIGHT}px)`,
        overflow: 'hidden',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
    }),
} as const satisfies MuiStyles;

const getPanelContainerStyles = (
    theme: Theme,
    isFocused: boolean,
    isFullscreen: boolean,
    isSidebarCollapsed: boolean
) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    borderRadius: isFullscreen ? 0 : 1,
    border: isFocused ? 2 : 1,
    borderColor: isFocused ? theme.palette.primary.main : theme.palette.divider,
    cursor: 'pointer',
    ...(isFullscreen && {
        position: 'fixed' as const,
        top: NAD_SLD_CONSTANTS.FULLSCREEN_TOP_OFFSET,
        left: NAD_SLD_CONSTANTS.FULLSCREEN_LEFT_OFFSET,
        right: isSidebarCollapsed
            ? NAD_SLD_CONSTANTS.SIDEBAR_COLLAPSED_WIDTH
            : NAD_SLD_CONSTANTS.SIDEBAR_EXPANDED_WIDTH,
        bottom: NAD_SLD_CONSTANTS.FULLSCREEN_BOTTOM_OFFSET,
        width: 'auto',
        height: 'auto',
        minWidth: 'unset',
        zIndex: 1300,
        borderRadius: 0,
    }),
});

interface AssociatedSldPanelProps {
    readonly sldPanelId: UUID;
    readonly isFocused: boolean;
    readonly isFullscreen: boolean;
    readonly isSidebarCollapsed: boolean;
    readonly onFocus: () => void;
    readonly onToggleFullscreen: () => void;
    readonly onClose?: () => void;
    readonly onRequestAssociation?: (voltageLevelId: string) => void;
}

export const AssociatedSldPanel = memo(function AssociatedSldPanel({
    sldPanelId,
    isFocused,
    isFullscreen,
    isSidebarCollapsed,
    onFocus,
    onToggleFullscreen,
    onClose,
    onRequestAssociation,
}: AssociatedSldPanelProps) {
    const dispatch = useDispatch();
    const theme = useTheme();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const sldPanel = useSelector((state: RootState) => selectPanel(state, sldPanelId));

    const handleDissociate = () => {
        onClose?.();
        dispatch(dissociateSldFromNad(sldPanelId));
    };

    const handleClose = () => {
        onClose?.();
        dispatch(closePanel(sldPanelId));
    };

    if (!sldPanel || !currentNodeId || !studyUuid || !currentRootNetworkUuid) return null;

    return (
        <Paper
            onClick={onFocus}
            elevation={isFocused ? 6 : 3}
            sx={getPanelContainerStyles(theme, isFocused, isFullscreen, isSidebarCollapsed)}
        >
            <Box sx={styles.header}>
                <Typography variant="caption" sx={styles.titleText}>
                    {sldPanel.title}
                </Typography>
                <Box sx={styles.actionsContainer}>
                    <IconButton
                        size="small"
                        sx={styles.iconButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFullscreen();
                        }}
                    >
                        {isFullscreen ? <FullscreenExit sx={styles.icon} /> : <Fullscreen sx={styles.icon} />}
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={styles.iconButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDissociate();
                        }}
                    >
                        <LinkOff sx={styles.icon} />
                    </IconButton>
                    <IconButton
                        size="small"
                        sx={styles.iconButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                    >
                        <Close sx={styles.icon} />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={styles.contentContainer(theme)}>
                <VoltageLevelPanelContent
                    panelId={sldPanelId}
                    studyUuid={studyUuid}
                    currentNodeId={currentNodeId}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onRequestAssociation={onRequestAssociation}
                />
            </Box>
        </Paper>
    );
});
