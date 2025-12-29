/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UUID } from 'node:crypto';
import { PREFIX_STUDY_QUERIES } from '../../../../services/study';
import { backendFetch, backendFetchJson } from '@gridsuite/commons-ui';
import type { DiagramConfigPosition } from '../../../../services/explore';
import { updatePanels, deletePanels } from '../../../../redux/slices/workspace-slice';
import { selectPanel } from '../../../../redux/slices/workspace-selectors';
import type { RootState } from '../../../../redux/store';
import { NADPanel } from '../../../workspace/types/workspace.types';

export const useSavedNadConfig = (studyUuid: UUID, panelId: UUID, savedWorkspaceConfigUuid?: UUID) => {
    const dispatch = useDispatch();
    const nadPanel = useSelector((state: RootState) => selectPanel(state, panelId)) as NADPanel | undefined;

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
            if (!nadPanel) return Promise.resolve(null);

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
                    dispatch(updatePanels([{ ...nadPanel, savedWorkspaceConfigUuid: response }]));
                    return response;
                })
                .catch((error) => {
                    console.error('Failed to save NAD config:', error);
                    return null;
                });
        },
        [studyUuid, nadPanel, dispatch, savedWorkspaceConfigUuid]
    );

    useEffect(() => {
        const handleCloseRequest = (event: CustomEvent<UUID>) => {
            if (event.detail === panelId) {
                cleanupSavedNadConfig();
                dispatch(deletePanels([panelId]));
            }
        };

        globalThis.addEventListener('nadPanel:requestClose', handleCloseRequest as EventListener);
        return () => globalThis.removeEventListener('nadPanel:requestClose', handleCloseRequest as EventListener);
    }, [panelId, cleanupSavedNadConfig, dispatch]);

    return { saveNadConfig, cleanupSavedNadConfig };
};
