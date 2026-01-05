/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_QUERIES } from '../../../../services/study';
import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';
import type { DiagramConfigPosition } from '../../../../services/explore';
import { useWorkspaceActions } from '../../../workspace/hooks/use-workspace-actions';
import { selectActiveWorkspaceId } from '../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../redux/store';

export const useSavedNadConfig = (studyUuid: UUID, panelId: UUID, savedWorkspaceConfigUuid?: UUID) => {
    const { deletePanel } = useWorkspaceActions();
    const workspaceId = useSelector((state: RootState) => selectActiveWorkspaceId(state));

    const cleanupSavedNadConfig = useCallback(() => {
        if (savedWorkspaceConfigUuid && workspaceId) {
            const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/workspaces/${workspaceId}/saved-nad-configs/${savedWorkspaceConfigUuid}`;
            backendFetch(url, { method: 'DELETE' }).catch((error) =>
                console.error('Failed to delete NAD config:', error)
            );
        }
    }, [studyUuid, workspaceId, savedWorkspaceConfigUuid]);

    const saveNadConfig = useCallback(
        (
            voltageLevelIds: string[],
            positions: DiagramConfigPosition[],
            scalingFactor?: number
        ): Promise<UUID | null> => {
            if (!workspaceId) {
                console.error('Cannot save NAD config: no active workspace');
                return Promise.resolve(null);
            }

            const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/workspaces/${workspaceId}/saved-nad-configs`;

            return backendFetchJson(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: savedWorkspaceConfigUuid || null,
                    scalingFactor,
                    voltageLevelIds,
                    positions,
                }),
            })
                .then((response: UUID) => {
                    return response;
                })
                .catch((error) => {
                    console.error('Failed to save NAD config:', error);
                    return null;
                });
        },
        [studyUuid, workspaceId, savedWorkspaceConfigUuid]
    );

    useEffect(() => {
        const handleCloseRequest = (event: CustomEvent<UUID>) => {
            if (event.detail === panelId) {
                cleanupSavedNadConfig();
                deletePanel(panelId);
            }
        };

        globalThis.addEventListener('nadPanel:requestClose', handleCloseRequest as EventListener);
        return () => globalThis.removeEventListener('nadPanel:requestClose', handleCloseRequest as EventListener);
    }, [panelId, cleanupSavedNadConfig, deletePanel]);

    return { saveNadConfig, cleanupSavedNadConfig };
};
