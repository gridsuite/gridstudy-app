/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Rnd, type RndDragCallback, type RndResizeCallback } from 'react-rnd';
import { Box, IconButton, Paper, Typography, useTheme, alpha } from '@mui/material';
import { Close, LinkOff, MinimizeOutlined } from '@mui/icons-material';
import { type MuiStyles } from '@gridsuite/commons-ui';
import type { UUID } from 'node:crypto';
import type { RootState } from '../../../../../redux/store';
import type { AppState } from '../../../../../redux/reducer';
import { selectPanel } from '../../../../../redux/slices/workspace-selectors';
import {
    dissociateSldFromNad,
    deleteAssociatedSld,
    updatePanelPositionAndSize,
    closePanel,
} from '../../../../../redux/slices/workspace-slice';
import { VoltageLevelPanelContent } from '../sld/voltage-level-panel-content';
import { NAD_SLD_CONSTANTS } from './constants';

// Helper functions from workspace panels
const positionToRelative = (position: { x: number; y: number }, containerRect: DOMRect) => ({
    x: position.x / containerRect.width,
    y: position.y / containerRect.height,
});

const sizeToRelative = (size: { width: number; height: number }, containerRect: DOMRect) => ({
    width: size.width / containerRect.width,
    height: size.height / containerRect.height,
});

const calculatePanelDimensions = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    containerRect: DOMRect,
    minSize: { width: number; height: number }
) => {
    let width = size.width * containerRect.width;
    let height = size.height * containerRect.height;

    // Apply minimum constraints
    width = Math.max(minSize.width, width);
    height = Math.max(minSize.height, height);

    const x = Math.max(0, Math.min(position.x * containerRect.width, containerRect.width - width));
    const y = Math.max(0, Math.min(position.y * containerRect.height, containerRect.height - height));
    return { x, y, width, height };
};

const DEFAULT_POSITION = { x: 0.01, y: 0.5 };
const DEFAULT_SIZE = { width: 0.35, height: 0.5 };

const styles = {
    header: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 0.75,
        py: 0.25,
        minHeight: 24,
        backgroundColor:
            theme.palette.mode === 'light'
                ? alpha(theme.palette.primary.main, 0.06)
                : alpha(theme.palette.primary.main, 0.24),
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        cursor: 'move',
    }),
    titleText: {
        fontWeight: 500,
        fontSize: '0.75rem',
        lineHeight: 1.4,
    },
    actionsContainer: {
        display: 'flex',
        gap: 0.25,
    },
    iconButton: {
        padding: 0.25,
    },
} as const satisfies MuiStyles;

const getContentContainerStyle = (theme: any, isDragging: boolean) => ({
    height: 'calc(100% - 24px)',
    overflow: 'hidden',
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#292e33',
    pointerEvents: isDragging ? 'none' : 'auto',
});

interface AssociatedSldPanelProps {
    readonly sldPanelId: UUID;
    readonly isFocused: boolean;
    readonly onRequestAssociation?: (voltageLevelId: string) => void;
    readonly onBringToFront?: (sldPanelId: UUID) => void;
    readonly onDragStart?: () => void;
    readonly onDragEnd?: () => void;
}

export const AssociatedSldPanel = memo(function AssociatedSldPanel({
    sldPanelId,
    isFocused,
    onRequestAssociation,
    onBringToFront,
    onDragStart,
    onDragEnd,
}: AssociatedSldPanelProps) {
    const dispatch = useDispatch();
    const theme = useTheme();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const sldPanel = useSelector((state: RootState) => selectPanel(state, sldPanelId), shallowEqual);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
    const lastSvgDimensionsRef = useRef<{ width: number; height: number } | null>(null);
    const hasManuallyResizedRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const relativePosition = sldPanel?.position || DEFAULT_POSITION;
    const relativeSize = sldPanel?.size || DEFAULT_SIZE;

    // Update container rect on mount and resize
    useEffect(() => {
        const updateRect = () => {
            if (containerRef.current) {
                setContainerRect(containerRef.current.getBoundingClientRect());
            }
        };

        updateRect();
        const resizeObserver = new ResizeObserver(updateRect);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    // Handle SVG load to auto-size panel
    const handleSvgLoad = useCallback(
        (svgWidth: number, svgHeight: number) => {
            if (!containerRect) return;

            // Skip if dimensions haven't changed
            const lastDimensions = lastSvgDimensionsRef.current;
            if (lastDimensions?.width === svgWidth && lastDimensions?.height === svgHeight) {
                return;
            }

            lastSvgDimensionsRef.current = { width: svgWidth, height: svgHeight };

            const maxWidthPercent = 0.6;
            const svgAspectRatio = svgWidth / svgHeight;

            let newSize;
            if (hasManuallyResizedRef.current) {
                // User has manually resized: adapt width based on current height to maintain aspect ratio
                const currentHeightPx = relativeSize.height * containerRect.height;
                const targetWidth = currentHeightPx * svgAspectRatio;
                const relWidth = Math.min(targetWidth / containerRect.width, maxWidthPercent);

                newSize = { width: relWidth, height: relativeSize.height };
            } else {
                // First load: auto-size both width and height based on aspect ratio
                const maxHeightPercent = 0.6;

                // Calculate target height
                const targetHeight = Math.min(svgHeight / containerRect.height, maxHeightPercent);

                // Calculate width based on aspect ratio and actual display height
                const targetHeightPx = targetHeight * containerRect.height;
                const targetWidthPx = targetHeightPx * svgAspectRatio;
                const targetWidth = Math.min(targetWidthPx / containerRect.width, maxWidthPercent);

                newSize = {
                    width: targetWidth,
                    height: targetHeight,
                };
            }

            dispatch(
                updatePanelPositionAndSize({
                    panelId: sldPanelId,
                    position: relativePosition,
                    size: newSize,
                })
            );
        },
        [dispatch, sldPanelId, containerRect, relativeSize.height, relativePosition]
    );

    const handleDissociate = useCallback(() => {
        dispatch(dissociateSldFromNad(sldPanelId));
    }, [dispatch, sldPanelId]);

    const handleMinimize = useCallback(() => {
        dispatch(closePanel(sldPanelId));
    }, [dispatch, sldPanelId]);

    const handleClose = useCallback(() => {
        dispatch(deleteAssociatedSld(sldPanelId));
    }, [dispatch, sldPanelId]);

    const handleResizeStart = useCallback(() => {
        setIsDragging(true);
        if (!isFocused) {
            onBringToFront?.(sldPanelId);
        }
    }, [isFocused, onBringToFront, sldPanelId]);

    const handleResizeStop: RndResizeCallback = useCallback(
        (_e, _direction, ref, _delta, position) => {
            if (!containerRect) return;

            const width = Number.parseInt(ref.style.width, 10);
            const height = Number.parseInt(ref.style.height, 10);

            hasManuallyResizedRef.current = true;
            dispatch(
                updatePanelPositionAndSize({
                    panelId: sldPanelId,
                    position: positionToRelative(position, containerRect),
                    size: sizeToRelative({ width, height }, containerRect),
                })
            );
            setIsDragging(false);
        },
        [dispatch, sldPanelId, containerRect]
    );

    const handleDragStart = useCallback(() => {
        setIsDragging(true);
        onDragStart?.();
    }, [onDragStart]);

    const handleDragStop: RndDragCallback = useCallback(
        (_e, data) => {
            if (!containerRect) return;

            const newRelativePosition = positionToRelative({ x: data.x, y: data.y }, containerRect);
            dispatch(
                updatePanelPositionAndSize({
                    panelId: sldPanelId,
                    position: newRelativePosition,
                    size: relativeSize,
                })
            );
            setIsDragging(false);
            onDragEnd?.();
        },
        [dispatch, sldPanelId, containerRect, relativeSize, onDragEnd]
    );

    const handlePointerDown = useCallback(() => {
        if (!isFocused) {
            onBringToFront?.(sldPanelId);
        }
    }, [onBringToFront, sldPanelId, isFocused]);

    // Calculate pixel dimensions from relative values
    const dimensions = useMemo(() => {
        if (!containerRect) {
            return {
                x: 0,
                y: 0,
                width: NAD_SLD_CONSTANTS.DEFAULT_RND_SIZE.width,
                height: NAD_SLD_CONSTANTS.DEFAULT_RND_SIZE.height,
            };
        }

        return calculatePanelDimensions(relativePosition, relativeSize, containerRect, {
            width: NAD_SLD_CONSTANTS.MIN_RND_WIDTH,
            height: NAD_SLD_CONSTANTS.MIN_RND_HEIGHT,
        });
    }, [containerRect, relativeSize, relativePosition]);

    if (!sldPanel || !currentNodeId || !studyUuid || !currentRootNetworkUuid) return null;

    return (
        <Box
            ref={containerRef}
            sx={{
                position: 'absolute',
                bottom: NAD_SLD_CONSTANTS.CHIP_BAR_HEIGHT,
                left: 0,
                right: 0,
                top: NAD_SLD_CONSTANTS.TOP_CONTROLS_HEIGHT,
                pointerEvents: 'none',
            }}
        >
            <Rnd
                position={{ x: dimensions.x, y: dimensions.y }}
                size={{ width: dimensions.width, height: dimensions.height }}
                onDragStart={handleDragStart}
                onDragStop={handleDragStop}
                onResizeStart={handleResizeStart}
                onResizeStop={handleResizeStop}
                minWidth={NAD_SLD_CONSTANTS.MIN_RND_WIDTH}
                minHeight={NAD_SLD_CONSTANTS.MIN_RND_HEIGHT}
                bounds="parent"
                dragHandleClassName="draggable-header"
                style={{
                    zIndex: sldPanel.zIndex,
                    pointerEvents: 'auto',
                }}
            >
                <Paper
                    elevation={isFocused ? 4 : 1}
                    onPointerDown={handlePointerDown}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: 2,
                        borderColor: isFocused ? theme.palette.primary.main : theme.palette.divider,
                    }}
                >
                    <Box className="draggable-header" sx={styles.header}>
                        <Typography variant="body2" sx={styles.titleText}>
                            {sldPanel.title}
                        </Typography>
                        <Box sx={styles.actionsContainer}>
                            <IconButton
                                size="small"
                                sx={styles.iconButton}
                                onClick={handleMinimize}
                                onMouseDownCapture={(e) => e.stopPropagation()}
                                onPointerDownCapture={(e) => e.stopPropagation()}
                            >
                                <MinimizeOutlined fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={styles.iconButton}
                                onClick={handleDissociate}
                                onMouseDownCapture={(e) => e.stopPropagation()}
                                onPointerDownCapture={(e) => e.stopPropagation()}
                            >
                                <LinkOff fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                sx={styles.iconButton}
                                onClick={handleClose}
                                onMouseDownCapture={(e) => e.stopPropagation()}
                                onPointerDownCapture={(e) => e.stopPropagation()}
                            >
                                <Close fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={getContentContainerStyle(theme, isDragging)}>
                        <VoltageLevelPanelContent
                            panelId={sldPanelId}
                            studyUuid={studyUuid}
                            currentNodeId={currentNodeId}
                            currentRootNetworkUuid={currentRootNetworkUuid}
                            onRequestAssociation={onRequestAssociation}
                            onSvgLoad={handleSvgLoad}
                        />
                    </Box>
                </Paper>
            </Rnd>
        </Box>
    );
});
