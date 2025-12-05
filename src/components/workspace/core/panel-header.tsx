/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { Box, IconButton, Theme } from '@mui/material';
import { Close, Minimize, PushPin, PushPinOutlined, Fullscreen, FullscreenExit } from '@mui/icons-material';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { closePanel, toggleMinimize, toggleMaximize, togglePin } from '../../../redux/slices/workspace-slice';
import type { UUID } from 'node:crypto';
import { PanelType } from '../types/workspace.types';
import { getPanelConfig } from '../constants/workspace.constants';
import type { AppState } from '../../../redux/reducer';

const getHeaderStyles = (theme: Theme, isFocused: boolean) => {
    let backgroundColor: string;
    let border: string;
    if (theme.palette.mode === 'light') {
        backgroundColor = isFocused ? theme.palette.grey[200] : 'white';
        border = `1px solid ${theme.palette.grey[500]}`;
    } else {
        backgroundColor = '#292e33';
        border = isFocused ? `1px solid ${theme.palette.grey[100]}` : `1px solid ${theme.palette.grey[800]}`;
    }

    return {
        paddingLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        backgroundColor,
        border,
        borderRadius: theme.spacing(2) + ' ' + theme.spacing(2) + ' 0 0',
        borderBottom: 'none',
        cursor: 'grab',
        userSelect: 'none',
        '&:active': {
            cursor: 'grabbing',
        },
    };
};

const styles = {
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexShrink: 1,
        minWidth: 0,
    },
    titleContent: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        overflow: 'hidden',
        minWidth: 0,
    },
    titleText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.75rem',
    },
    headerActions: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 'auto',
        flexShrink: 0,
    },
    iconButton: {
        visibility: 'hidden',
    },
    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;

interface PanelHeaderProps {
    panelId: UUID;
    title: string;
    panelType: PanelType;
    isPinned: boolean;
    isMaximized: boolean;
    isFocused: boolean;
}

export const PanelHeader = memo(({ panelId, title, panelType, isPinned, isMaximized, isFocused }: PanelHeaderProps) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const displayTitle = intl.messages[title] ? intl.formatMessage({ id: title }) : title || '';
    const isDirtyComputationParameters = useSelector((state: AppState) => state.isDirtyComputationParameters);

    const handleClose = () => {
        // If it's a parameters panel with unsaved changes, trigger confirmation dialog
        if (panelType === PanelType.PARAMETERS && isDirtyComputationParameters) {
            globalThis.dispatchEvent(new CustomEvent('parametersPanel:requestClose', { detail: panelId }));
        } else if (panelType === PanelType.NAD) {
            globalThis.dispatchEvent(new CustomEvent('nadPanel:requestClose', { detail: panelId }));
        } else {
            dispatch(closePanel(panelId));
        }
    };

    return (
        <Box className="panel-header" sx={(theme) => getHeaderStyles(theme, isFocused)}>
            <Box sx={styles.title}>
                <Box sx={styles.titleContent}>
                    {getPanelConfig(panelType).icon}
                    <OverflowableText text={displayTitle} sx={styles.titleText} tooltipSx={styles.tooltip} />
                </Box>
            </Box>
            <Box sx={styles.headerActions}>
                <IconButton
                    className="panel-header-close-button"
                    size="small"
                    sx={styles.iconButton}
                    onClick={() => dispatch(togglePin(panelId))}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                </IconButton>
                {(panelType === PanelType.SLD_VOLTAGE_LEVEL ||
                    panelType === PanelType.SLD_SUBSTATION ||
                    panelType === PanelType.NAD) && (
                    <IconButton
                        className="panel-header-close-button"
                        size="small"
                        sx={styles.iconButton}
                        onClick={() => dispatch(toggleMinimize(panelId))}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Minimize fontSize="small" />
                    </IconButton>
                )}
                <IconButton
                    className="panel-header-close-button"
                    size="small"
                    sx={styles.iconButton}
                    onClick={() => dispatch(toggleMaximize(panelId))}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {isMaximized ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                </IconButton>
                <IconButton
                    className="panel-header-close-button"
                    size="small"
                    sx={styles.iconButton}
                    onClick={handleClose}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={isPinned}
                >
                    <Close fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
});
