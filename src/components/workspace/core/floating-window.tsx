/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { Close, Minimize, CropSquare, FilterNone, PushPin, PushPinOutlined } from '@mui/icons-material';
import { Rnd } from 'react-rnd';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { OverflowableText } from '@gridsuite/commons-ui';
import { useDispatch } from 'react-redux';
import {
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    togglePin,
    updateWindowPosition,
    updateWindowSize,
} from '../../../redux/slices/workspace-slice';
import type { WindowState } from '../types/workspace.types';

const styles = {
    window: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '& .window-resize-handle': {
            visibility: 'hidden',
        },
        '&:hover': {
            '& .window-resize-handle, .window-header-close-button': {
                visibility: 'visible',
            },
        },
    },
    header: (theme: any) => ({
        paddingLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.mode === 'light' ? 'white' : '#292e33',
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
    }),
    title: {
        flexGrow: 1,
        paddingBottom: '2px',
    },
    headerActions: {
        display: 'flex',
        flexDirection: 'row',
    },
    iconButton: {
        visibility: 'hidden',
    },
    content: (theme: any) => ({
        flexGrow: 1,
        overflow: 'auto',
        position: 'relative',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
        borderRadius: '0 0 ' + theme.spacing(2) + ' ' + theme.spacing(2),
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
        borderTop: 'none',
    }),
    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;

interface FloatingWindowProps {
    windowId: string;
    window: WindowState;
    onSnapRequest: (windowId: string, mousePos: { x: number; y: number } | null) => void;
    children?: React.ReactNode;
}

export const FloatingWindow = memo(({ windowId, window, onSnapRequest, children }: FloatingWindowProps) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const [dragMousePos, setDragMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const displayTitle = intl.messages[window.title] ? intl.formatMessage({ id: window.title }) : window.title || '';

    const handleDrag = useCallback((_e: any, _d: { x: number; y: number }) => {
        setIsDragging(true);
        const event = globalThis.window.event as MouseEvent | undefined;
        if (event) {
            setDragMousePos({ x: event.clientX, y: event.clientY });
        }
    }, []);

    const handleDragStop = useCallback(
        (_e: any, data: { x: number; y: number }) => {
            setIsDragging(false);
            setDragMousePos(null);
            dispatch(updateWindowPosition({ windowId, position: { x: data.x, y: data.y } }));
        },
        [dispatch, windowId]
    );

    const handleResizeStop = useCallback(
        (_e: any, _direction: any, ref: HTMLElement, _delta: any, position: { x: number; y: number }) => {
            dispatch(
                updateWindowSize({
                    windowId,
                    size: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) },
                })
            );
            dispatch(updateWindowPosition({ windowId, position }));
        },
        [dispatch, windowId]
    );

    const handleFocus = useCallback(() => {
        if (!isDragging) {
            dispatch(focusWindow(windowId));
        }
    }, [dispatch, windowId, isDragging]);

    useEffect(() => {
        if (dragMousePos && !window.isMaximized && !window.isPinned) {
            onSnapRequest(windowId, dragMousePos);
        }
    }, [dragMousePos, windowId, onSnapRequest, window.isMaximized, window.isPinned]);

    if (window.isMinimized) {
        return null;
    }

    return (
        <Rnd
            default={{
                x: window.position.x,
                y: window.position.y,
                width: window.size.width,
                height: window.size.height,
            }}
            position={{
                x: window.position.x,
                y: window.position.y,
            }}
            size={{
                width: window.isMaximized ? '100%' : window.size.width,
                height: window.isMaximized ? '100%' : window.size.height,
            }}
            onDrag={handleDrag}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            dragHandleClassName="window-header"
            cancel=".window-content"
            disableDragging={window.isMaximized || window.isPinned}
            enableResizing={!window.isMaximized && !window.isPinned}
            minWidth={300}
            minHeight={200}
            bounds="parent"
            resizeHandleClasses={{
                bottom: 'window-resize-handle',
                bottomLeft: 'window-resize-handle',
                bottomRight: 'window-resize-handle',
                left: 'window-resize-handle',
                right: 'window-resize-handle',
                top: 'window-resize-handle',
                topLeft: 'window-resize-handle',
                topRight: 'window-resize-handle',
            }}
            style={{
                zIndex: window.zIndex,
            }}
        >
            <Box sx={styles.window}>
                <Box onMouseDown={handleFocus} className="window-header" sx={styles.header}>
                    <OverflowableText
                        sx={styles.title}
                        tooltipSx={styles.tooltip}
                        text={<Typography variant="caption">{displayTitle}</Typography>}
                    />
                    <Box sx={styles.headerActions}>
                        <IconButton
                            className="window-header-close-button"
                            size="small"
                            sx={styles.iconButton}
                            onClick={() => dispatch(togglePin(windowId))}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {window.isPinned ? <PushPin fontSize="small" /> : <PushPinOutlined fontSize="small" />}
                        </IconButton>
                        <IconButton
                            className="window-header-close-button"
                            size="small"
                            sx={styles.iconButton}
                            onClick={() => dispatch(toggleMinimize(windowId))}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Minimize fontSize="small" />
                        </IconButton>
                        <IconButton
                            className="window-header-close-button"
                            size="small"
                            sx={styles.iconButton}
                            onClick={() => dispatch(toggleMaximize(windowId))}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {window.isMaximized ? <FilterNone fontSize="small" /> : <CropSquare fontSize="small" />}
                        </IconButton>
                        <IconButton
                            className="window-header-close-button"
                            size="small"
                            sx={styles.iconButton}
                            onClick={() => dispatch(closeWindow(windowId))}
                            onMouseDown={(e) => e.stopPropagation()}
                            disabled={window.isPinned}
                        >
                            <Close fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
                <Box className="window-content" sx={styles.content}>
                    {children}
                </Box>
            </Box>
        </Rnd>
    );
});
