/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { useDebounce } from '@gridsuite/commons-ui';
import { selectPanelIds, selectFocusedPanelId } from '../../../redux/slices/workspace-selectors';
import { WorkspaceDock } from './workspace-dock';
import { Panel } from './panel';
import type { SnapRect } from './utils/snap-utils';
import { saveWorkspacesToStorage } from '../../../redux/slices/workspace-slice';
import type { RootState } from '../../../redux/store';

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
    const panelIds = useSelector(selectPanelIds);
    const focusedPanelId = useSelector(selectFocusedPanelId);
    const workspaceState = useSelector((state: RootState) => state.workspace);
    const studyUuid = useSelector((state: RootState) => state.studyUuid);
    const containerRef = useRef<HTMLDivElement>(null);
    const [snapPreview, setSnapPreview] = useState<SnapRect | null>(null);
    const [draggingPanelId, setDraggingPanelId] = useState<string | null>(null);

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
                {panelIds.map((panelId) => (
                    <Panel
                        key={panelId}
                        panelId={panelId}
                        containerRef={containerRef}
                        snapPreview={draggingPanelId === panelId ? snapPreview : null}
                        onSnapPreview={handleSnapPreview}
                        isFocused={panelId === focusedPanelId}
                    />
                ))}
                {snapPreview && (
                    <Box
                        sx={(theme) => ({
                            ...styles.snapPreview(theme),
                            left: snapPreview.x,
                            top: snapPreview.y,
                            width: snapPreview.width,
                            height: snapPreview.height,
                        })}
                    />
                )}
            </Box>
            <WorkspaceDock />
        </Box>
    );
};
