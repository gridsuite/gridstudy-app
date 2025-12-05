/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useDebounce, type MuiStyles } from '@gridsuite/commons-ui';
import type { RootState } from '../../../redux/store';
import { selectOpenPanelIds, selectFocusedPanelId } from '../../../redux/slices/workspace-selectors';
import { saveWorkspacesToStorage } from '../../../redux/slices/workspace-storage';
import type { SnapRect } from './utils/snap-utils';
import { toPixels } from './utils/coordinate-utils';
import { Panel } from './panel';
import { WorkspaceDock } from './workspace-dock';

const styles = {
    container: {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        isolation: 'isolate',
    },
    panelsArea: {
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
    },
    snapPreview: (theme) => ({
        position: 'absolute',
        backgroundColor: theme.palette.primary.main + '26',
        border: '2px solid',
        borderColor: theme.palette.primary.main,
        pointerEvents: 'none',
        zIndex: 99998,
        transition: 'all 0.15s',
    }),
} as const satisfies MuiStyles;

export const WorkspaceContainer = () => {
    const panelIds = useSelector(selectOpenPanelIds);
    const focusedPanelId = useSelector(selectFocusedPanelId);
    const workspaceState = useSelector((state: RootState) => state.workspace);
    const studyUuid = useSelector((state: RootState) => state.studyUuid);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
    const [snapPreview, setSnapPreview] = useState<SnapRect | null>(null);
    const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);

    // Track container dimensions
    useEffect(() => {
        if (!containerRef.current) return;

        const updateRect = () => {
            if (containerRef.current) {
                setContainerRect(containerRef.current.getBoundingClientRect());
            }
        };

        updateRect();
        const resizeObserver = new ResizeObserver(updateRect);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Save workspaces to localStorage when they change
    const debouncedSaveWorkspaces = useDebounce(() => {
        if (studyUuid && workspaceState) {
            saveWorkspacesToStorage(workspaceState, studyUuid);
        }
    }, 500);

    useEffect(() => {
        debouncedSaveWorkspaces();
    }, [workspaceState, studyUuid, debouncedSaveWorkspaces]);

    const handleSnapPreview = useCallback((panelId: string, preview: SnapRect | null) => {
        setDraggingPanelId(preview ? panelId : null);
        setSnapPreview(preview);
    }, []);

    return (
        <Box sx={styles.container}>
            <Box ref={containerRef} sx={styles.panelsArea}>
                {containerRect &&
                    panelIds.map((panelId) => (
                        <Panel
                            key={panelId}
                            panelId={panelId}
                            containerRect={containerRect}
                            snapPreview={draggingPanelId === panelId ? snapPreview : null}
                            onSnapPreview={handleSnapPreview}
                            isFocused={panelId === focusedPanelId}
                        />
                    ))}
                {snapPreview && containerRect && (
                    <Box
                        sx={(theme) => {
                            const pixelRect = toPixels(snapPreview, containerRect);
                            return {
                                ...styles.snapPreview(theme),
                                left: pixelRect.x,
                                top: pixelRect.y,
                                width: pixelRect.width,
                                height: pixelRect.height,
                            };
                        }}
                    />
                )}
            </Box>
            <WorkspaceDock />
        </Box>
    );
};
