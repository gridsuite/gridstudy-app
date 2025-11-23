/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, memo, type RefObject } from 'react';
import { Box } from '@mui/material';
import { Rnd, type RndDragCallback, type RndResizeCallback, type Position } from 'react-rnd';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { useDispatch, useSelector } from 'react-redux';
import { focusWindow, updateWindowPosition, updateWindowSize, snapWindow } from '../../../redux/slices/workspace-slice';
import { selectWindow } from '../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../redux/store';
import { WINDOW_CONTENT_REGISTRY } from '../window-contents/window-content-registry';
import { WindowHeader } from './window-header';
import type { UUID } from 'node:crypto';
import { getWindowConfig } from '../constants/workspace.constants';
import type { AppState } from '../../../redux/reducer';
import { getSnapZone, type SnapRect } from './utils/snap-utils';

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
    containerRef: RefObject<HTMLDivElement>;
    snapPreview: SnapRect | null;
    onSnapPreview: (preview: SnapRect | null) => void;
    isFocused: boolean;
}
export const Window = memo(({ windowId, containerRef, snapPreview, onSnapPreview, isFocused }: WindowProps) => {
    const dispatch = useDispatch();
    const window = useSelector((state: RootState) => selectWindow(state, windowId));
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const handleDrag = useCallback(
        (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            onSnapPreview(getSnapZone(e.clientX, e.clientY, rect));
        },
        [containerRef, onSnapPreview]
    );

    const handleDragStop: RndDragCallback = useCallback(
        (_e, data) => {
            if (snapPreview) {
                dispatch(snapWindow({ windowId, rect: snapPreview }));
            } else {
                dispatch(updateWindowPosition({ windowId, position: { x: data.x, y: data.y } }));
            }
            onSnapPreview(null);
        },
        [dispatch, windowId, snapPreview, onSnapPreview]
    );

    const handleResizeStop: RndResizeCallback = useCallback(
        (_e, _direction, ref, _delta, position) => {
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
        if (!isFocused) {
            dispatch(focusWindow(windowId));
        }
    }, [dispatch, windowId, isFocused]);

    if (!window) {
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
            onDrag={handleDrag as any}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
            dragHandleClassName="window-header"
            disableDragging={window.isMaximized || window.isPinned}
            enableResizing={!window.isMaximized && !window.isPinned}
            bounds="parent"
            minWidth={minWidth}
            minHeight={minHeight}
            style={{
                display: window.isMinimized ? 'none' : 'block',
            }}
        >
            <Box sx={{ ...styles.window, boxShadow: isFocused ? 14 : 0 }}>
                <WindowHeader
                    windowId={windowId}
                    title={window.title}
                    windowType={window.type}
                    isPinned={window.isPinned}
                    isMaximized={window.isMaximized}
                    isFocused={isFocused}
                    onFocus={handleFocus}
                />
                <Box className="window-content" sx={styles.content}>
                    {studyUuid && currentRootNetworkUuid && currentNode
                        ? WINDOW_CONTENT_REGISTRY[window.type]({
                              windowId,
                              studyUuid: studyUuid as UUID,
                              currentRootNetworkUuid: currentRootNetworkUuid as UUID,
                              currentNode,
                          })
                        : null}
                </Box>
            </Box>
        </Rnd>
    );
});
