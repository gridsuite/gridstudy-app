/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useRef, useState, useCallback, useMemo } from 'react';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { selectWindowIds, selectFocusedWindowId } from '../../../redux/slices/workspace-selectors';
import { WindowDock } from './window-dock';
import { Window } from './window';
import type { SnapRect } from './utils/snap-utils';

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
    windowsArea: {
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
    const windowIds = useSelector(selectWindowIds);
    const focusedWindowId = useSelector(selectFocusedWindowId);
    const containerRef = useRef<HTMLDivElement>(null);
    const [snapPreview, setSnapPreview] = useState<SnapRect | null>(null);

    const handleSnapPreview = useCallback((preview: SnapRect | null) => {
        setSnapPreview(preview);
    }, []);

    // Sort windows to render focused window on top
    const sortedWindowIds = useMemo(() => {
        if (!focusedWindowId) return windowIds;
        return windowIds.filter((id) => id !== focusedWindowId).concat(focusedWindowId);
    }, [windowIds, focusedWindowId]);

    return (
        <Box sx={styles.container}>
            <Box ref={containerRef} sx={styles.windowsArea}>
                {sortedWindowIds.map((windowId) => (
                    <Window
                        key={windowId}
                        windowId={windowId}
                        containerRef={containerRef}
                        snapPreview={snapPreview}
                        onSnapPreview={handleSnapPreview}
                        isFocused={windowId === focusedWindowId}
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
            <WindowDock />
        </Box>
    );
};
