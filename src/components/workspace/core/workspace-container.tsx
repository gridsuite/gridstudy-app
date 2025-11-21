/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useCallback, useRef } from 'react';
import type { MuiStyles } from '@gridsuite/commons-ui';
import { selectWindowIds } from '../../../redux/slices/workspace-selectors';
import { snapWindow } from '../../../redux/slices/workspace-slice';
import { WindowDock } from './window-dock';
import { Window } from './window';
import { SnapZones } from './snap-zones';
import { UUID } from 'crypto';

type SnapState = { windowId: string; mousePos: { x: number; y: number } } | null;

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
} as const satisfies MuiStyles;

export const WorkspaceContainer = () => {
    const dispatch = useDispatch();
    const windowIds = useSelector(selectWindowIds);

    const [snapState, setSnapState] = useState<SnapState>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSnapRequest = useCallback((windowId: string, mousePos: { x: number; y: number } | null) => {
        setSnapState(mousePos ? { windowId, mousePos } : null);
    }, []);

    const handleSnap = useCallback(
        (windowId: string, rect: { x: number; y: number; width: number; height: number }) => {
            dispatch(snapWindow({ windowId: windowId as UUID, rect }));
            setSnapState(null);
        },
        [dispatch]
    );

    return (
        <Box sx={styles.container}>
            <Box ref={containerRef} sx={styles.windowsArea}>
                {windowIds.map((windowId) => (
                    <Window key={windowId} windowId={windowId} onSnapRequest={handleSnapRequest} />
                ))}
                {snapState && (
                    <SnapZones
                        windowId={snapState.windowId as UUID}
                        mouseX={snapState.mousePos.x}
                        mouseY={snapState.mousePos.y}
                        onSnap={handleSnap}
                        containerRef={containerRef}
                    />
                )}
            </Box>
            <WindowDock />
        </Box>
    );
};
