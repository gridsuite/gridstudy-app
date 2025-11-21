/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState, memo } from 'react';
import { Box } from '@mui/material';
import { Rnd } from 'react-rnd';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { focusWindow, updateWindowPosition, updateWindowSize } from '../../../redux/slices/workspace-slice';
import { selectWindow, selectFocusedWindowId } from '../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../redux/store';
import { WindowContentFactory } from '../window-contents/window-content-factory';
import { WindowHeader } from './window-header';
import type { UUID } from 'node:crypto';
import { getWindowConfig } from '../constants/workspace.constants';

const styles = {
    window: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        '& .window-resize-handle': {
            visibility: 'hidden',
        },
        '&:hover': {
            '& .window-resize-handle, .window-header-close-button': {
                visibility: 'visible',
            },
        },
    },
    content: (theme: any) => ({
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
        borderRadius: '0 0 ' + theme.spacing(2) + ' ' + theme.spacing(2),
        border:
            theme.palette.mode === 'light'
                ? `1px solid ${theme.palette.grey[500]}`
                : `1px solid ${theme.palette.grey[800]}`,
        borderTop: 'none',
    }),
} as const satisfies MuiStyles;

interface WindowProps {
    windowId: UUID;
    onSnapRequest: (windowId: UUID, mousePos: { x: number; y: number } | null) => void;
}
export const Window = memo(({ windowId, onSnapRequest }: WindowProps) => {
    const dispatch = useDispatch();
    const window = useSelector((state: RootState) => selectWindow(state, windowId));
    const focusedWindowId = useSelector(selectFocusedWindowId);
    const [dragMousePos, setDragMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const isMaximized = window?.isMaximized ?? false;
    const isPinned = window?.isPinned ?? false;
    const isFocused = focusedWindowId === windowId;

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
        if (isDragging && dragMousePos && !isMaximized && !isPinned) {
            onSnapRequest(windowId, dragMousePos);
        } else if (!isDragging && dragMousePos === null) {
            onSnapRequest(windowId, null);
        }
    }, [isDragging, dragMousePos, windowId, onSnapRequest, isMaximized, isPinned]);

    if (!window || window.isMinimized) {
        return null;
    }

    const config = getWindowConfig(window.type);
    const minWidth = config.minSize?.width || 300;
    const minHeight = config.minSize?.height || 200;

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
            disableDragging={window.isMaximized || window.isPinned}
            enableResizing={!window.isMaximized && !window.isPinned}
            bounds="parent"
            minWidth={minWidth}
            minHeight={minHeight}
            style={{
                zIndex: window.zIndex,
            }}
        >
            <Box sx={{ ...styles.window, boxShadow: isFocused ? 14 : 0 }}>
                <WindowHeader
                    windowId={windowId}
                    title={window.title}
                    isPinned={window.isPinned}
                    isMaximized={window.isMaximized}
                    isFocused={isFocused}
                    onFocus={handleFocus}
                />
                <Box className="window-content" sx={styles.content}>
                    <WindowContentFactory windowId={windowId} windowType={window.type} windowData={window.metadata} />
                </Box>
            </Box>
        </Rnd>
    );
});
