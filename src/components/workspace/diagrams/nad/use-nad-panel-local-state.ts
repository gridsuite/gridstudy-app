/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { AppState } from '../../../../redux/reducer.type';
import { selectActiveWorkspaceId } from '../../../../redux/slices/workspace-selectors';
import {
    type NadPanelLocalFields,
    getNadPanelLocalState,
    saveNadPanelLocalState,
} from '../../../../redux/session-storage/workspace-local-storage';

export function useNadPanelLocalState<K extends keyof NadPanelLocalFields>(panelId: UUID, key: K) {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const workspaceId = useSelector(selectActiveWorkspaceId);

    const [value, setValue] = useState<NadPanelLocalFields[K] | undefined>(
        () => getNadPanelLocalState(studyUuid, workspaceId, panelId)?.[key]
    );

    const setAndSaveValue = useCallback(
        (newValue: NadPanelLocalFields[K] | undefined) => {
            setValue(newValue);
            saveNadPanelLocalState(studyUuid, workspaceId, panelId, { [key]: newValue });
        },
        [studyUuid, workspaceId, panelId, key]
    );

    return [value, setAndSaveValue] as const;
}
