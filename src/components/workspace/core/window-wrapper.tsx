/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo } from 'react';
import { useSelector } from 'react-redux';
import { selectWindowDirect } from '../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../redux/store';
import { FloatingWindow } from './floating-window';
import type { WindowContentDependencies } from '../window-contents/window-content-factory';
import { WindowContentFactory } from '../window-contents/window-content-factory';

interface WindowWrapperProps {
    windowId: string;
    contentDependencies: WindowContentDependencies;
    onSnapRequest: (windowId: string, mousePos: { x: number; y: number } | null) => void;
}

export const WindowWrapper = memo(({ windowId, contentDependencies, onSnapRequest }: WindowWrapperProps) => {
    const window = useSelector((state: RootState) => selectWindowDirect(state, windowId));

    if (!window) return null;

    return (
        <FloatingWindow windowId={windowId} window={window} onSnapRequest={onSnapRequest}>
            <WindowContentFactory
                windowType={window.type}
                windowData={window.data}
                windowId={windowId}
                dependencies={contentDependencies}
            />
        </FloatingWindow>
    );
});
