/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { Box, IconButton, Theme, Typography } from '@mui/material';
import { Close, Minimize, CropSquare, FilterNone, PushPin, PushPinOutlined } from '@mui/icons-material';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { closeWindow, toggleMinimize, toggleMaximize, togglePin } from '../../../redux/slices/workspace-slice';
import type { UUID } from 'node:crypto';
import { WindowType } from '../types/workspace.types';
import { getWindowConfig } from '../constants/workspace.constants';

const getHeaderStyles = (theme: Theme, isFocused: boolean) => ({
    paddingLeft: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.mode === 'light' ? (isFocused ? theme.palette.grey[200] : 'white') : '#292e33',
    border:
        theme.palette.mode === 'light'
            ? `1px solid ${theme.palette.grey[500]}`
            : `1px solid ${theme.palette.grey[800]}`,
    borderRadius: theme.spacing(2) + ' ' + theme.spacing(2) + ' 0 0',
    cursor: 'grab',
    userSelect: 'none',
    '&:active': {
        cursor: 'grabbing',
    },
});

const styles = {
    title: {
        flexGrow: 1,
        paddingBottom: '2px',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
    },
    titleContent: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
    },
    titleText: {
        lineHeight: 1,
    },
    headerActions: {
        display: 'flex',
        flexDirection: 'row',
    },
    iconButton: {
        visibility: 'hidden',
    },
    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;

interface WindowHeaderProps {
    windowId: UUID;
    title: string;
    windowType: WindowType;
    isPinned: boolean;
    isMaximized: boolean;
    isFocused: boolean;
    onFocus: () => void;
}

export const WindowHeader = memo(
    ({ windowId, title, windowType, isPinned, isMaximized, isFocused, onFocus }: WindowHeaderProps) => {
        const dispatch = useDispatch();
        const intl = useIntl();
        const displayTitle = intl.messages[title] ? intl.formatMessage({ id: title }) : title || '';

        return (
            <Box onMouseDown={onFocus} className="window-header" sx={(theme) => getHeaderStyles(theme, isFocused)}>
                <OverflowableText
                    sx={styles.title}
                    tooltipSx={styles.tooltip}
                    text={
                        <Box sx={styles.titleContent}>
                            {getWindowConfig(windowType).icon}
                            <Typography variant="caption" sx={styles.titleText}>
                                {displayTitle}
                            </Typography>
                        </Box>
                    }
                />
                <Box sx={styles.headerActions}>
                    <IconButton
                        className="window-header-close-button"
                        size="small"
                        sx={styles.iconButton}
                        onClick={() => dispatch(togglePin(windowId))}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                    </IconButton>
                    {(windowType === WindowType.SLD || windowType === WindowType.NAD) && (
                        <IconButton
                            className="window-header-close-button"
                            size="small"
                            sx={styles.iconButton}
                            onClick={() => dispatch(toggleMinimize(windowId))}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Minimize fontSize="small" />
                        </IconButton>
                    )}
                    <IconButton
                        className="window-header-close-button"
                        size="small"
                        sx={styles.iconButton}
                        onClick={() => dispatch(toggleMaximize(windowId))}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {isMaximized ? <FilterNone fontSize="small" /> : <CropSquare fontSize="small" />}
                    </IconButton>
                    <IconButton
                        className="window-header-close-button"
                        size="small"
                        sx={styles.iconButton}
                        onClick={() => dispatch(closeWindow(windowId))}
                        onMouseDown={(e) => e.stopPropagation()}
                        disabled={isPinned}
                    >
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
        );
    }
);
