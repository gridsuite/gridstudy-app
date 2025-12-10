/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, memo } from 'react';
import { Box, Theme } from '@mui/material';
import { Rnd, type RndDragCallback, type RndResizeCallback } from 'react-rnd';
import { useDispatch, useSelector } from 'react-redux';
import {
    focusPanel,
    updatePanelPosition,
    updatePanelPositionAndSize,
    snapPanel,
} from '../../../redux/slices/workspace-slice';
import { selectPanel } from '../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../redux/store';
import { PANEL_CONTENT_REGISTRY } from '../panel-contents/panel-content-registry';
import { PanelHeader } from './panel-header';
import type { UUID } from 'node:crypto';
import { getPanelConfig } from '../constants/workspace.constants';
import type { AppState } from '../../../redux/reducer';
import { getSnapZone, type SnapRect } from './utils/snap-utils';
import { positionToRelative, sizeToRelative, calculatePanelDimensions } from './utils/coordinate-utils';

const RESIZE_HANDLE_SIZE = 12;

const getBorder = (theme: Theme, isFocused: boolean, isMaximized: boolean) => {
    if (theme.palette.mode === 'light') {
        return `1px solid ${theme.palette.grey[500]}`;
    }
    if (isFocused && !isMaximized) {
        return `1px solid ${theme.palette.grey[100]}`;
    }
    return `1px solid ${theme.palette.grey[800]}`;
};

const getBoxShadow = (theme: Theme, isFocused: boolean) => {
    if (!isFocused) {
        return 0;
    }
    return theme.palette.mode === 'light' ? theme.shadows[14] : theme.shadows[18];
};

const styles = {
    panel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        '& .panel-resize-handle': {
            visibility: 'hidden',
        },
        '&:hover': {
            '& .panel-resize-handle, .panel-header-close-button': {
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
        borderTop: 'none',
    }),
    resizeHandles: {
        bottomRight: { width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE, right: 0, bottom: 0 },
        bottomLeft: { width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE, left: 0, bottom: 0 },
        topRight: { width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE, right: 0, top: 0 },
        topLeft: { width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE, left: 0, top: 0 },
    },
} as const;

interface PanelProps {
    panelId: UUID;
    containerRect: DOMRect;
    snapPreview: SnapRect | null;
    onSnapPreview: (panelId: UUID, preview: SnapRect | null) => void;
    isFocused: boolean;
}
export const Panel = memo(({ panelId, containerRect, snapPreview, onSnapPreview, isFocused }: PanelProps) => {
    const dispatch = useDispatch();
    const panel = useSelector((state: RootState) => selectPanel(state, panelId));
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const handleDrag = useCallback(
        (e: MouseEvent) => {
            onSnapPreview(panelId, getSnapZone(e.clientX, e.clientY, containerRect));
        },
        [containerRect, onSnapPreview, panelId]
    );

    const handleDragStop: RndDragCallback = useCallback(
        (_e, data) => {
            if (snapPreview) {
                dispatch(snapPanel({ panelId, rect: snapPreview }));
            } else {
                // Convert pixel position back to relative values
                const relativePosition = positionToRelative({ x: data.x, y: data.y }, containerRect);
                dispatch(updatePanelPosition({ panelId, position: relativePosition }));
            }
            onSnapPreview(panelId, null);
        },
        [dispatch, panelId, snapPreview, onSnapPreview, containerRect]
    );

    const handleResizeStop: RndResizeCallback = useCallback(
        (_e, _direction, ref, _delta, position) => {
            // Convert pixel values back to relative values
            const relativePosition = positionToRelative(position, containerRect);
            const relativeSize = sizeToRelative(
                {
                    width: Number.parseInt(ref.style.width, 10),
                    height: Number.parseInt(ref.style.height, 10),
                },
                containerRect
            );
            dispatch(updatePanelPositionAndSize({ panelId, position: relativePosition, size: relativeSize }));
        },
        [dispatch, panelId, containerRect]
    );

    const handleFocus = useCallback(() => {
        if (!isFocused) {
            dispatch(focusPanel(panelId));
        }
    }, [dispatch, panelId, isFocused]);

    if (!panel) {
        return null;
    }

    const config = getPanelConfig(panel.type);
    const minWidth = config.minSize?.width || 300;
    const minHeight = config.minSize?.height || 200;

    // Calculate panel dimensions and position
    const dimensions = panel.isMaximized
        ? { x: 0, y: 0, width: containerRect.width, height: containerRect.height }
        : calculatePanelDimensions(panel.position, panel.size, containerRect, { width: minWidth, height: minHeight });

    return (
        <Rnd
            position={{ x: dimensions.x, y: dimensions.y }}
            size={{ width: dimensions.width, height: dimensions.height }}
            onDrag={handleDrag as any}
            onDragStop={handleDragStop}
            onResizeStart={handleFocus}
            onResizeStop={handleResizeStop}
            dragHandleClassName="panel-header"
            disableDragging={panel.isMaximized || panel.isPinned}
            enableResizing={!panel.isMaximized && !panel.isPinned}
            bounds="parent"
            minWidth={minWidth}
            minHeight={minHeight}
            resizeHandleStyles={styles.resizeHandles}
            style={{
                display: panel.isMinimized ? 'none' : 'block',
                zIndex: panel.zIndex,
            }}
        >
            <Box
                onPointerDown={handleFocus}
                sx={(theme) => ({ ...styles.panel, boxShadow: getBoxShadow(theme, isFocused) })}
            >
                <PanelHeader
                    panelId={panelId}
                    title={panel.title}
                    panelType={panel.type}
                    isPinned={panel.isPinned}
                    isMaximized={panel.isMaximized}
                    isFocused={isFocused}
                />
                <Box
                    className="panel-content"
                    sx={(theme) => ({
                        ...styles.content(theme),
                        border: getBorder(theme, isFocused, panel.isMaximized),
                    })}
                >
                    {studyUuid && currentRootNetworkUuid && currentNode
                        ? PANEL_CONTENT_REGISTRY[panel.type]({
                              panelId,
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
