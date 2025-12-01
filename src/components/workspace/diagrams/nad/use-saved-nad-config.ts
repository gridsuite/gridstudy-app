/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_QUERIES } from '../../../../services/study';
import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';
import type { DiagramConfigPosition } from '../../../../services/explore';
import { updatePanelMetadata } from '../../../../redux/slices/workspace-slice';

export const useSavedNadConfig = (studyUuid: UUID, panelId: UUID, savedWorkspaceConfigUuid?: UUID) => {
    const dispatch = useDispatch();

    const cleanupSavedNadConfig = useCallback(() => {
        if (savedWorkspaceConfigUuid) {
            const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/nad-configs/${savedWorkspaceConfigUuid}`;
            backendFetch(url, { method: 'DELETE' }).catch((error) =>
                console.error('Failed to delete NAD config:', error)
            );
        }
    }, [studyUuid, savedWorkspaceConfigUuid]);

    const saveNadConfig = useCallback(
        (
            voltageLevelIds: string[],
            positions: DiagramConfigPosition[],
            scalingFactor?: number
        ): Promise<UUID | null> => {
            const url = `${PREFIX_STUDY_QUERIES}/v1/studies/${studyUuid}/nad-configs`;

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
                    dispatch(
                        updatePanelMetadata({
                            panelId,
                            metadata: { savedWorkspaceConfigUuid: response },
                        })
                    );
                    return response;
                })
                .catch((error) => {
                    console.error('Failed to save NAD config:', error);
                    return null;
                });
        },
        [studyUuid, panelId, dispatch, savedWorkspaceConfigUuid]
    );

    useEffect(() => {
        const handleCloseRequest = (event: CustomEvent<UUID>) => {
            if (event.detail === panelId) {
                cleanupSavedNadConfig();
                dispatch({ type: 'workspace/closePanel', payload: panelId });
            }
        };

        globalThis.addEventListener('nadPanel:requestClose', handleCloseRequest as EventListener);
        return () => globalThis.removeEventListener('nadPanel:requestClose', handleCloseRequest as EventListener);
    }, [panelId, cleanupSavedNadConfig, dispatch]);

    return { saveNadConfig, cleanupSavedNadConfig };
};
